import { useCallback, useState } from 'react';
import type { Shot } from '../types/shot';

interface UseProjectResult {
  currentProject: { id: string; name: string } | null;
  createNewProject: (name: string) => void;
  switchProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  duplicateShot: (shotId: string) => void;
  batchDeleteShots: (shotIds: string[]) => void;
  batchGeneratePrompts: (shotIds: string[]) => Promise<void>;
}

export function useProject(): UseProjectResult {
  const [currentProject, setCurrentProject] = useState<{ id: string; name: string } | null>(null);

  const createNewProject = useCallback((name: string) => {
    const id = `proj_${Date.now()}`;
    setCurrentProject({ id, name });
    // 实际实现需要调用 store
  }, []);

  const switchProject = useCallback((id: string) => {
    // 实际实现需要调用 store
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    // 实际实现需要调用 store
  }, []);

  const deleteProject = useCallback((id: string) => {
    // 实际实现需要调用 store
  }, []);

  const duplicateShot = useCallback((shotId: string) => {
    // 实际实现需要调用 store
  }, []);

  const batchDeleteShots = useCallback((shotIds: string[]) => {
    // 实际实现需要调用 store
  }, []);

  const batchGeneratePrompts = useCallback(async (shotIds: string[]) => {
    // 实际实现需要调用 AI hook
  }, []);

  return {
    currentProject,
    createNewProject,
    switchProject,
    renameProject,
    deleteProject,
    duplicateShot,
    batchDeleteShots,
    batchGeneratePrompts,
  };
}
