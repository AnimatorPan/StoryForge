import { useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Shot } from '../types/shot';

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  shots: Partial<Shot>[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel';
  includeImages: boolean;
  selectedOnly: boolean;
}

interface UseBatchImportExportReturn {
  importFromFile: (file: File) => Promise<ImportResult>;
  importFromJSON: (json: string) => ImportResult;
  importFromCSV: (csv: string) => ImportResult;
  exportToFile: (options: ExportOptions) => Promise<string | null>;
  exportToJSON: (shots: Shot[]) => string;
  exportToCSV: (shots: Shot[]) => string;
  isProcessing: boolean;
  progress: number;
}

export const useBatchImportExport = (): UseBatchImportExportReturn => {
  const { shots, selectedShotIds, addShot } = useProjectStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const importFromJSON = useCallback((json: string): ImportResult => {
    const result: ImportResult = {
      success: false,
      imported: 0,
      errors: [],
      shots: [],
    };
    
    try {
      const data = JSON.parse(json);
      
      // Handle array of shots
      if (Array.isArray(data)) {
        result.shots = data;
      }
      // Handle object with shots property
      else if (data.shots && Array.isArray(data.shots)) {
        result.shots = data.shots;
      }
      // Handle single shot
      else if (typeof data === 'object') {
        result.shots = [data];
      }
      
      result.imported = result.shots.length;
      result.success = result.imported > 0;
      
      // Validate shots
      result.shots = result.shots.filter((shot, index) => {
        if (!shot || typeof shot !== 'object') {
          result.errors.push(`条目 ${index + 1}: 无效的数据格式`);
          return false;
        }
        return true;
      });
      
    } catch (error) {
      result.errors.push(`JSON 解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    return result;
  }, []);
  
  const importFromCSV = useCallback((csv: string): ImportResult => {
    const result: ImportResult = {
      success: false,
      imported: 0,
      errors: [],
      shots: [],
    };
    
    try {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) {
        result.errors.push('CSV 文件至少需要包含标题行和一行数据');
        return result;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const requiredFields = ['timeCode', 'shotType', 'description'];
      const missingFields = requiredFields.filter(f => !headers.includes(f));
      
      if (missingFields.length > 0) {
        result.errors.push(`缺少必需字段: ${missingFields.join(', ')}`);
        return result;
      }
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const shot: Partial<Shot> = {};
          
          headers.forEach((header, index) => {
            if (values[index]) {
              (shot as Record<string, string>)[header] = values[index];
            }
          });
          
          result.shots.push(shot);
        } catch (error) {
          result.errors.push(`第 ${i + 1} 行解析失败`);
        }
      }
      
      result.imported = result.shots.length;
      result.success = result.imported > 0;
      
    } catch (error) {
      result.errors.push(`CSV 解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    return result;
  }, []);
  
  const importFromFile = useCallback(async (file: File): Promise<ImportResult> => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const content = await file.text();
      setProgress(50);
      
      let result: ImportResult;
      
      if (file.name.endsWith('.json')) {
        result = importFromJSON(content);
      } else if (file.name.endsWith('.csv')) {
        result = importFromCSV(content);
      } else {
        // Try JSON first, then CSV
        result = importFromJSON(content);
        if (!result.success && result.errors.length > 0) {
          result = importFromCSV(content);
        }
      }
      
      setProgress(100);
      
      // Import shots to store
      if (result.success && result.shots.length > 0) {
        result.shots.forEach((shot) => {
          addShot(shot);
        });
      }
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [importFromJSON, importFromCSV, addShot]);
  
  const exportToJSON = useCallback((shotsToExport: Shot[]): string => {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      shots: shotsToExport.map(shot => ({
        sequence: shot.sequence,
        timeCode: shot.timeCode,
        shotType: shot.shotType,
        cameraMove: shot.cameraMove,
        description: shot.description,
        lighting: shot.lighting,
        drama: shot.drama,
        dialogue: shot.dialogue,
        seedancePrompt: shot.seedancePrompt,
      })),
    };
    
    return JSON.stringify(data, null, 2);
  }, []);
  
  const exportToCSV = useCallback((shotsToExport: Shot[]): string => {
    const headers = ['sequence', 'timeCode', 'shotType', 'cameraMove', 'description', 'lighting', 'drama', 'dialogue', 'seedancePrompt'];
    const rows = shotsToExport.map(shot => [
      shot.sequence,
      shot.timeCode,
      shot.shotType,
      shot.cameraMove,
      shot.description,
      shot.lighting,
      shot.drama,
      shot.dialogue,
      shot.seedancePrompt,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    return csvContent;
  }, []);
  
  const exportToFile = useCallback(async (options: ExportOptions): Promise<string | null> => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const shotsToExport = options.selectedOnly
        ? shots.filter(s => selectedShotIds.includes(s.id))
        : shots;
      
      if (shotsToExport.length === 0) {
        return null;
      }
      
      setProgress(30);
      
      let content: string;
      let filename: string;
      let mimeType: string;
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      switch (options.format) {
        case 'json':
          content = exportToJSON(shotsToExport);
          filename = `storyforge-shots-${timestamp}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          content = exportToCSV(shotsToExport);
          filename = `storyforge-shots-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'excel':
          // For Excel, we'll use CSV as a simple export
          content = exportToCSV(shotsToExport);
          filename = `storyforge-shots-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        default:
          content = exportToJSON(shotsToExport);
          filename = `storyforge-shots-${timestamp}.json`;
          mimeType = 'application/json';
      }
      
      setProgress(70);
      
      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      
      return filename;
    } finally {
      setIsProcessing(false);
    }
  }, [shots, selectedShotIds, exportToJSON, exportToCSV]);
  
  return {
    importFromFile,
    importFromJSON,
    importFromCSV,
    exportToFile,
    exportToJSON,
    exportToCSV,
    isProcessing,
    progress,
  };
};
