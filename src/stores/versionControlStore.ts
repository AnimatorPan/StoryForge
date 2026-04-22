import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shot, Project } from '../types/shot';
import { useProjectStore } from './projectStore';

export interface VersionSnapshot {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  timestamp: number;
  author: string;
  authorId: string;
  shots: Shot[];
  project: Project;
  tags?: string[];
}

export interface VersionDiff {
  added: Shot[];
  modified: Array<{ before: Shot; after: Shot; changes: string[] }>;
  deleted: Shot[];
}

interface VersionControlState {
  versions: Record<string, VersionSnapshot[]>;
  currentVersionId: Record<string, string>;
  
  // Version actions
  createVersion: (projectId: string, name: string, description?: string, tags?: string[]) => VersionSnapshot;
  restoreVersion: (projectId: string, versionId: string) => boolean;
  deleteVersion: (projectId: string, versionId: string) => void;
  getProjectVersions: (projectId: string) => VersionSnapshot[];
  getVersion: (projectId: string, versionId: string) => VersionSnapshot | null;
  
  // Diff and compare
  compareVersions: (projectId: string, versionId1: string, versionId2: string) => VersionDiff;
  compareWithCurrent: (projectId: string, versionId: string, currentShots: Shot[]) => VersionDiff;
  compareShots: (shots1: Shot[], shots2: Shot[]) => VersionDiff;
  
  // Branching (simplified)
  createBranch: (projectId: string, versionId: string, branchName: string) => VersionSnapshot | null;
  mergeBranch: (projectId: string, sourceVersionId: string, targetVersionId: string) => VersionSnapshot | null;
  
  // Export/Import
  exportVersions: (projectId: string) => string;
  importVersions: (projectId: string, data: string) => boolean;
}

export const useVersionControlStore = create<VersionControlState>()(
  persist(
    (set, get) => ({
      versions: {},
      currentVersionId: {},
      
      createVersion: (projectId, name, description, tags) => {
        const projectStore = useProjectStore.getState();
        const project = projectStore.projects[projectId];
        const shots = projectStore.shots;
        
        const version: VersionSnapshot = {
          id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          name,
          description,
          timestamp: Date.now(),
          author: '当前用户',
          authorId: 'user_current',
          shots: JSON.parse(JSON.stringify(shots)),
          project: JSON.parse(JSON.stringify(project)),
          tags,
        };
        
        set((state) => ({
          versions: {
            ...state.versions,
            [projectId]: [...(state.versions[projectId] || []), version],
          },
          currentVersionId: {
            ...state.currentVersionId,
            [projectId]: version.id,
          },
        }));
        
        return version;
      },
      
      restoreVersion: (projectId, versionId) => {
        const version = get().getVersion(projectId, versionId);
        if (!version) return false;
        
        // Note: In real implementation, this would restore shots to projectStore
        // For now, we just update the current version ID
        
        set((state) => ({
          currentVersionId: {
            ...state.currentVersionId,
            [projectId]: versionId,
          },
        }));
        
        return true;
      },
      
      deleteVersion: (projectId, versionId) => {
        set((state) => ({
          versions: {
            ...state.versions,
            [projectId]: state.versions[projectId]?.filter((v) => v.id !== versionId) || [],
          },
        }));
      },
      
      getProjectVersions: (projectId) => {
        return get().versions[projectId] || [];
      },
      
      getVersion: (projectId, versionId) => {
        return get().versions[projectId]?.find((v) => v.id === versionId) || null;
      },
      
      compareVersions: (projectId, versionId1, versionId2) => {
        const v1 = get().getVersion(projectId, versionId1);
        const v2 = get().getVersion(projectId, versionId2);
        
        if (!v1 || !v2) {
          return { added: [], modified: [], deleted: [] };
        }
        
        return get().compareShots(v1.shots, v2.shots);
      },
      
      compareWithCurrent: (projectId, versionId, currentShots) => {
        const version = get().getVersion(projectId, versionId);
        if (!version) {
          return { added: [], modified: [], deleted: [] };
        }
        
        return get().compareShots(version.shots, currentShots);
      },
      
      compareShots: (shots1, shots2) => {
        const diff: VersionDiff = {
          added: [],
          modified: [],
          deleted: [],
        };
        
        const shots1Map = new Map(shots1.map((s) => [s.id, s]));
        const shots2Map = new Map(shots2.map((s) => [s.id, s]));
        
        // Find added and modified
        for (const shot2 of shots2) {
          const shot1 = shots1Map.get(shot2.id);
          if (!shot1) {
            diff.added.push(shot2);
          } else {
            const changes: string[] = [];
            const fields: (keyof Shot)[] = ['timeCode', 'shotType', 'cameraMove', 'description', 'lighting', 'drama', 'dialogue', 'seedancePrompt'];
            
            for (const field of fields) {
              if (shot1[field] !== shot2[field]) {
                changes.push(field);
              }
            }
            
            if (changes.length > 0) {
              diff.modified.push({ before: shot1, after: shot2, changes });
            }
          }
        }
        
        // Find deleted
        for (const shot1 of shots1) {
          if (!shots2Map.has(shot1.id)) {
            diff.deleted.push(shot1);
          }
        }
        
        return diff;
      },
      
      createBranch: (projectId, versionId, branchName) => {
        const version = get().getVersion(projectId, versionId);
        if (!version) return null;
        
        const branchVersion: VersionSnapshot = {
          ...version,
          id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: branchName,
          description: `分支自: ${version.name}`,
          timestamp: Date.now(),
          tags: [...(version.tags || []), 'branch'],
        };
        
        set((state) => ({
          versions: {
            ...state.versions,
            [projectId]: [...(state.versions[projectId] || []), branchVersion],
          },
        }));
        
        return branchVersion;
      },
      
      mergeBranch: (projectId, sourceVersionId, targetVersionId) => {
        const source = get().getVersion(projectId, sourceVersionId);
        const target = get().getVersion(projectId, targetVersionId);
        
        if (!source || !target) return null;
        
        // Simple merge: prefer source changes
        const mergedShots = [...target.shots];
        const sourceShotMap = new Map(source.shots.map((s) => [s.id, s]));
        
        for (let i = 0; i < mergedShots.length; i++) {
          const sourceShot = sourceShotMap.get(mergedShots[i].id);
          if (sourceShot && sourceShot.updatedAt > mergedShots[i].updatedAt) {
            mergedShots[i] = { ...sourceShot };
          }
        }
        
        // Add new shots from source
        const targetIds = new Set(target.shots.map((s) => s.id));
        for (const sourceShot of source.shots) {
          if (!targetIds.has(sourceShot.id)) {
            mergedShots.push(sourceShot);
          }
        }
        
        const mergeVersion: VersionSnapshot = {
          ...target,
          id: `merge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `合并: ${source.name} → ${target.name}`,
          description: `合并版本\n源: ${source.name}\n目标: ${target.name}`,
          timestamp: Date.now(),
          shots: mergedShots,
          tags: ['merge'],
        };
        
        set((state) => ({
          versions: {
            ...state.versions,
            [projectId]: [...(state.versions[projectId] || []), mergeVersion],
          },
        }));
        
        return mergeVersion;
      },
      
      exportVersions: (projectId) => {
        return JSON.stringify({
          projectId,
          versions: get().versions[projectId] || [],
          exportedAt: Date.now(),
        }, null, 2);
      },
      
      importVersions: (projectId, data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.versions && Array.isArray(parsed.versions)) {
            set((state) => ({
              versions: {
                ...state.versions,
                [projectId]: parsed.versions,
              },
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'storyforge-versions',
    }
  )
);
