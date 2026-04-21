import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { Shot } from '../types/shot';

interface ExportData {
  shots: Shot[];
  projectName: string;
}

interface UseExportResult {
  exportToExcel: (data: ExportData) => void;
  exportToTxt: (data: ExportData) => void;
  exportSeedancePrompts: (shots: Shot[]) => void;
  importFromExcel: (file: File) => Promise<Partial<Shot>[]>;
}

export function useExport(): UseExportResult {
  const exportToExcel = useCallback((data: ExportData) => {
    const exportData = data.shots.map((shot) => ({
      序号: shot.sequence,
      时间段: shot.timeCode,
      景别: shot.shotType,
      运镜: shot.cameraMove,
      画面描述: shot.description,
      光影氛围: shot.lighting,
      戏剧张力: shot.drama,
      台词: shot.dialogue,
      SEEDANCE提示词: shot.seedancePrompt,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '分镜脚本');
    
    const fileName = `${data.projectName}_分镜脚本_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, []);

  const exportToTxt = useCallback((data: ExportData) => {
    const lines = data.shots.map((shot) => {
      return `[${shot.sequence}] ${shot.timeCode} | ${shot.shotType} | ${shot.cameraMove}
画面: ${shot.description}
光影: ${shot.lighting}
戏剧: ${shot.drama}
台词: ${shot.dialogue}
SEEDANCE: ${shot.seedancePrompt}
---`;
    });

    const content = lines.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.projectName}_分镜脚本_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportSeedancePrompts = useCallback((shots: Shot[]) => {
    const prompts = shots
      .filter((s) => s.seedancePrompt)
      .map((s) => s.seedancePrompt)
      .join('\n\n---\n\n');

    const blob = new Blob([prompts], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `SEEDANCE提示词_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importFromExcel = useCallback(async (file: File): Promise<Partial<Shot>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          const shots: Partial<Shot>[] = jsonData.map((row: any) => ({
            timeCode: row['时间段'] || row['timeCode'] || '',
            shotType: row['景别'] || row['shotType'] || '',
            cameraMove: row['运镜'] || row['cameraMove'] || '',
            description: row['画面描述'] || row['description'] || '',
            lighting: row['光影氛围'] || row['lighting'] || '',
            drama: row['戏剧张力'] || row['drama'] || '',
            dialogue: row['台词'] || row['dialogue'] || '',
            seedancePrompt: row['SEEDANCE提示词'] || row['seedancePrompt'] || '',
          }));
          
          resolve(shots);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsBinaryString(file);
    });
  }, []);

  return { exportToExcel, exportToTxt, exportSeedancePrompts, importFromExcel };
}
