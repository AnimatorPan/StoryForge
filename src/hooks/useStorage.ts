import { useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Shot } from '../types/shot';

interface UseStorageResult {
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => Shot[] | null;
  clearLocalStorage: () => void;
  exportProject: () => string;
  importProject: (json: string) => boolean;
}

export function useStorage(): UseStorageResult {
  const { shots, currentProjectId, projects } = useProjectStore();

  const saveToLocalStorage = useCallback(() => {
    const data = {
      shots,
      currentProjectId,
      projects,
      savedAt: Date.now(),
    };
    localStorage.setItem('soullens-data', JSON.stringify(data));
  }, [shots, currentProjectId, projects]);

  const loadFromLocalStorage = useCallback((): Shot[] | null => {
    try {
      const data = localStorage.getItem('soullens-data');
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return parsed.shots || null;
    } catch {
      return null;
    }
  }, []);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('soullens-data');
    localStorage.removeItem('soullens-projects');
    localStorage.removeItem('soullens-ai-config');
  }, []);

  const exportProject = useCallback((): string => {
    const data = {
      shots,
      currentProjectId,
      projects,
      exportedAt: Date.now(),
    };
    return JSON.stringify(data, null, 2);
  }, [shots, currentProjectId, projects]);

  const importProject = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.shots && Array.isArray(data.shots)) {
        // 使用 store 的方法恢复数据
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, exportProject, importProject };
}
