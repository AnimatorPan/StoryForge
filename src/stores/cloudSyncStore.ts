import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncConflict {
  id: string;
  type: 'shot' | 'project' | 'comment';
  localData: unknown;
  remoteData: unknown;
  timestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merged';
}

export interface SyncLog {
  id: string;
  timestamp: number;
  operation: 'push' | 'pull' | 'merge' | 'resolve';
  status: 'success' | 'error' | 'conflict';
  details: string;
  itemsCount: number;
}

interface CloudSyncState {
  // Sync status
  status: SyncStatus;
  lastSyncTime: number | null;
  syncInterval: number; // minutes
  autoSync: boolean;
  
  // Conflicts
  conflicts: SyncConflict[];
  
  // Logs
  logs: SyncLog[];
  
  // Settings
  cloudProvider: 'local' | 'github' | 'gitlab' | 'custom';
  apiEndpoint: string;
  apiKey: string;
  projectId: string;
  
  // Actions
  setStatus: (status: SyncStatus) => void;
  setAutoSync: (enabled: boolean) => void;
  setSyncInterval: (minutes: number) => void;
  setCloudProvider: (provider: CloudSyncState['cloudProvider']) => void;
  setApiEndpoint: (endpoint: string) => void;
  setApiKey: (key: string) => void;
  setProjectId: (id: string) => void;
  
  // Sync operations
  sync: () => Promise<boolean>;
  push: () => Promise<boolean>;
  pull: () => Promise<boolean>;
  
  // Conflict resolution
  addConflict: (conflict: Omit<SyncConflict, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveConflict: (conflictId: string, resolution: 'local' | 'remote' | 'merged') => void;
  getUnresolvedConflicts: () => SyncConflict[];
  
  // Logs
  addLog: (log: Omit<SyncLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  getRecentLogs: (limit?: number) => SyncLog[];
  
  // Export/Import
  exportSettings: () => string;
  importSettings: (data: string) => boolean;
}

// Mock sync implementation - replace with actual API calls
const mockSync = async (direction: 'push' | 'pull'): Promise<{ success: boolean; data?: unknown; error?: string }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simulate random success/failure
  if (Math.random() > 0.9) {
    return { success: false, error: '网络连接失败' };
  }
  
  return { success: true, data: {} };
};

export const useCloudSyncStore = create<CloudSyncState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      lastSyncTime: null,
      syncInterval: 5,
      autoSync: false,
      conflicts: [],
      logs: [],
      cloudProvider: 'local',
      apiEndpoint: '',
      apiKey: '',
      projectId: '',
      
      setStatus: (status) => set({ status }),
      setAutoSync: (enabled) => set({ autoSync: enabled }),
      setSyncInterval: (minutes) => set({ syncInterval: minutes }),
      setCloudProvider: (provider) => set({ cloudProvider: provider }),
      setApiEndpoint: (endpoint) => set({ apiEndpoint: endpoint }),
      setApiKey: (key) => set({ apiKey: key }),
      setProjectId: (id) => set({ projectId: id }),
      
      sync: async () => {
        const state = get();
        if (state.status === 'syncing') return false;
        
        set({ status: 'syncing' });
        
        try {
          // First pull, then push
          const pullResult = await get().pull();
          if (!pullResult) {
            set({ status: 'error' });
            return false;
          }
          
          const pushResult = await get().push();
          if (!pushResult) {
            set({ status: 'error' });
            return false;
          }
          
          set({
            status: 'synced',
            lastSyncTime: Date.now(),
          });
          
          return true;
        } catch (error) {
          set({ status: 'error' });
          get().addLog({
            operation: 'push',
            status: 'error',
            details: error instanceof Error ? error.message : '同步失败',
            itemsCount: 0,
          });
          return false;
        }
      },
      
      push: async () => {
        const state = get();
        
        if (state.cloudProvider === 'local') {
          // Local sync - just log
          get().addLog({
            operation: 'push',
            status: 'success',
            details: '本地模式 - 数据已保存',
            itemsCount: 0,
          });
          return true;
        }
        
        const result = await mockSync('push');
        
        if (result.success) {
          get().addLog({
            operation: 'push',
            status: 'success',
            details: `成功推送到 ${state.cloudProvider}`,
            itemsCount: 1,
          });
          return true;
        } else {
          get().addLog({
            operation: 'push',
            status: 'error',
            details: result.error || '推送失败',
            itemsCount: 0,
          });
          return false;
        }
      },
      
      pull: async () => {
        const state = get();
        
        if (state.cloudProvider === 'local') {
          get().addLog({
            operation: 'pull',
            status: 'success',
            details: '本地模式 - 无需拉取',
            itemsCount: 0,
          });
          return true;
        }
        
        const result = await mockSync('pull');
        
        if (result.success) {
          get().addLog({
            operation: 'pull',
            status: 'success',
            details: `成功从 ${state.cloudProvider} 拉取`,
            itemsCount: 1,
          });
          return true;
        } else {
          get().addLog({
            operation: 'pull',
            status: 'error',
            details: result.error || '拉取失败',
            itemsCount: 0,
          });
          return false;
        }
      },
      
      addConflict: (conflict) => {
        const newConflict: SyncConflict = {
          ...conflict,
          id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          resolved: false,
        };
        
        set((state) => ({
          conflicts: [...state.conflicts, newConflict],
        }));
      },
      
      resolveConflict: (conflictId, resolution) => {
        set((state) => ({
          conflicts: state.conflicts.map((c) =>
            c.id === conflictId ? { ...c, resolved: true, resolution } : c
          ),
        }));
        
        get().addLog({
          operation: 'resolve',
          status: 'success',
          details: `解决冲突: ${resolution}`,
          itemsCount: 1,
        });
      },
      
      getUnresolvedConflicts: () => {
        return get().conflicts.filter((c) => !c.resolved);
      },
      
      addLog: (log) => {
        const newLog: SyncLog = {
          ...log,
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 100), // Keep last 100 logs
        }));
      },
      
      clearLogs: () => {
        set({ logs: [] });
      },
      
      getRecentLogs: (limit = 50) => {
        return get().logs.slice(0, limit);
      },
      
      exportSettings: () => {
        const state = get();
        return JSON.stringify({
          cloudProvider: state.cloudProvider,
          apiEndpoint: state.apiEndpoint,
          projectId: state.projectId,
          autoSync: state.autoSync,
          syncInterval: state.syncInterval,
          exportedAt: Date.now(),
        }, null, 2);
      },
      
      importSettings: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            cloudProvider: parsed.cloudProvider || 'local',
            apiEndpoint: parsed.apiEndpoint || '',
            projectId: parsed.projectId || '',
            autoSync: parsed.autoSync || false,
            syncInterval: parsed.syncInterval || 5,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'storyforge-cloud-sync',
    }
  )
);
