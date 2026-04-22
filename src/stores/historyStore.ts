import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PromptVersion {
  id: string;
  shotId: string;
  prompt: string;
  provider: string;
  model: string;
  timestamp: number;
  metadata?: {
    compressed?: boolean;
    originalLength?: number;
    compressedLength?: number;
  };
}

export interface GenerationHistory {
  id: string;
  shotId: string;
  type: 'text' | 'image';
  prompt: string;
  result?: string;
  provider: string;
  model: string;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  timestamp: number;
  duration?: number;
}

interface HistoryState {
  // Prompt versions per shot
  promptVersions: Record<string, PromptVersion[]>;
  // Generation history
  generations: GenerationHistory[];
  // Current active version per shot
  activeVersions: Record<string, string>;
  
  // Actions
  savePromptVersion: (shotId: string, prompt: string, provider: string, model: string, metadata?: PromptVersion['metadata']) => string;
  restorePromptVersion: (shotId: string, versionId: string) => PromptVersion | null;
  deletePromptVersion: (shotId: string, versionId: string) => void;
  getShotVersions: (shotId: string) => PromptVersion[];
  
  addGeneration: (generation: Omit<GenerationHistory, 'id' | 'timestamp'>) => string;
  updateGeneration: (id: string, updates: Partial<GenerationHistory>) => void;
  deleteGeneration: (id: string) => void;
  getShotGenerations: (shotId: string) => GenerationHistory[];
  getRecentGenerations: (limit?: number) => GenerationHistory[];
  
  clearHistory: () => void;
  exportHistory: () => string;
  importHistory: (data: string) => boolean;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      promptVersions: {},
      generations: [],
      activeVersions: {},
      
      savePromptVersion: (shotId, prompt, provider, model, metadata) => {
        const version: PromptVersion = {
          id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          shotId,
          prompt,
          provider,
          model,
          timestamp: Date.now(),
          metadata,
        };
        
        set((state) => ({
          promptVersions: {
            ...state.promptVersions,
            [shotId]: [...(state.promptVersions[shotId] || []), version],
          },
          activeVersions: {
            ...state.activeVersions,
            [shotId]: version.id,
          },
        }));
        
        return version.id;
      },
      
      restorePromptVersion: (shotId, versionId) => {
        const versions = get().promptVersions[shotId] || [];
        const version = versions.find((v) => v.id === versionId);
        if (version) {
          set((state) => ({
            activeVersions: {
              ...state.activeVersions,
              [shotId]: versionId,
            },
          }));
        }
        return version || null;
      },
      
      deletePromptVersion: (shotId, versionId) => {
        set((state) => {
          const versions = state.promptVersions[shotId] || [];
          const newVersions = versions.filter((v) => v.id !== versionId);
          const newActiveVersions = { ...state.activeVersions };
          
          if (state.activeVersions[shotId] === versionId) {
            const lastVersion = newVersions[newVersions.length - 1];
            if (lastVersion) {
              newActiveVersions[shotId] = lastVersion.id;
            } else {
              delete newActiveVersions[shotId];
            }
          }
          
          return {
            promptVersions: {
              ...state.promptVersions,
              [shotId]: newVersions,
            },
            activeVersions: newActiveVersions,
          };
        });
      },
      
      getShotVersions: (shotId) => {
        return get().promptVersions[shotId] || [];
      },
      
      addGeneration: (generation) => {
        const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newGeneration: GenerationHistory = {
          ...generation,
          id,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          generations: [newGeneration, ...state.generations].slice(0, 1000), // Keep last 1000
        }));
        
        return id;
      },
      
      updateGeneration: (id, updates) => {
        set((state) => ({
          generations: state.generations.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },
      
      deleteGeneration: (id) => {
        set((state) => ({
          generations: state.generations.filter((g) => g.id !== id),
        }));
      },
      
      getShotGenerations: (shotId) => {
        return get().generations.filter((g) => g.shotId === shotId);
      },
      
      getRecentGenerations: (limit = 50) => {
        return get().generations.slice(0, limit);
      },
      
      clearHistory: () => {
        set({
          promptVersions: {},
          generations: [],
          activeVersions: {},
        });
      },
      
      exportHistory: () => {
        return JSON.stringify({
          promptVersions: get().promptVersions,
          generations: get().generations,
          activeVersions: get().activeVersions,
          exportedAt: Date.now(),
        }, null, 2);
      },
      
      importHistory: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.promptVersions && parsed.generations) {
            set({
              promptVersions: parsed.promptVersions,
              generations: parsed.generations,
              activeVersions: parsed.activeVersions || {},
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'storyforge-history',
    }
  )
);
