import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shot, Project } from '../types/shot';

interface ProjectState {
  currentProjectId: string;
  projects: Record<string, Project>;
  shots: Shot[];
  selectedShotIds: string[];
  
  addShot: (shot?: Partial<Shot>) => void;
  updateShot: (id: string, updates: Partial<Shot>) => void;
  deleteShot: (id: string) => void;
  duplicateShot: (id: string) => void;
  moveShot: (fromIndex: number, toIndex: number) => void;
  
  selectShot: (id: string | 'all' | 'none', multi?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  createProject: (name: string) => string;
  switchProject: (id: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProjectId: 'default',
      projects: {
        default: {
          id: 'default',
          name: '默认项目',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          shotCount: 0,
        },
      },
      shots: [],
      selectedShotIds: [],
      
      addShot: (shot) => {
        const newShot: Shot = {
          id: `shot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sequence: get().shots.length + 1,
          timeCode: shot?.timeCode || '',
          shotType: shot?.shotType || '',
          cameraMove: shot?.cameraMove || '',
          description: shot?.description || '',
          lighting: shot?.lighting || '',
          drama: shot?.drama || '',
          dialogue: shot?.dialogue || '',
          seedancePrompt: shot?.seedancePrompt || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          shots: [...state.shots, newShot],
          projects: {
            ...state.projects,
            [state.currentProjectId]: {
              ...state.projects[state.currentProjectId],
              updatedAt: Date.now(),
              shotCount: state.shots.length + 1,
            },
          },
        }));
      },
      
      updateShot: (id, updates) => {
        set((state) => ({
          shots: state.shots.map((shot) =>
            shot.id === id ? { ...shot, ...updates, updatedAt: Date.now() } : shot
          ),
        }));
      },
      
      deleteShot: (id) => {
        set((state) => {
          const newShots = state.shots.filter((shot) => shot.id !== id);
          // 重新排序
          const reorderedShots = newShots.map((shot, index) => ({
            ...shot,
            sequence: index + 1,
          }));
          
          return {
            shots: reorderedShots,
            selectedShotIds: state.selectedShotIds.filter((sid) => sid !== id),
            projects: {
              ...state.projects,
              [state.currentProjectId]: {
                ...state.projects[state.currentProjectId],
                updatedAt: Date.now(),
                shotCount: reorderedShots.length,
              },
            },
          };
        });
      },
      
      duplicateShot: (id) => {
        const shot = get().shots.find((s) => s.id === id);
        if (!shot) return;
        
        const newShot: Shot = {
          ...shot,
          id: `shot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sequence: get().shots.length + 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          shots: [...state.shots, newShot],
          projects: {
            ...state.projects,
            [state.currentProjectId]: {
              ...state.projects[state.currentProjectId],
              updatedAt: Date.now(),
              shotCount: state.shots.length + 1,
            },
          },
        }));
      },
      
      moveShot: (fromIndex, toIndex) => {
        set((state) => {
          const shots = [...state.shots];
          const [moved] = shots.splice(fromIndex, 1);
          shots.splice(toIndex, 0, moved);
          
          return {
            shots: shots.map((shot, index) => ({
              ...shot,
              sequence: index + 1,
            })),
          };
        });
      },
      
      selectShot: (id, multi = false) => {
        if (id === 'all') {
          set((state) => ({
            selectedShotIds: state.shots.map((s) => s.id),
          }));
        } else if (id === 'none') {
          set({ selectedShotIds: [] });
        } else if (multi) {
          set((state) => ({
            selectedShotIds: state.selectedShotIds.includes(id)
              ? state.selectedShotIds.filter((sid) => sid !== id)
              : [...state.selectedShotIds, id],
          }));
        } else {
          set({ selectedShotIds: [id] });
        }
      },
      
      selectAll: () => {
        set((state) => ({
          selectedShotIds: state.shots.map((s) => s.id),
        }));
      },
      
      clearSelection: () => {
        set({ selectedShotIds: [] });
      },
      
      createProject: (name) => {
        const id = `proj_${Date.now()}`;
        set((state) => ({
          projects: {
            ...state.projects,
            [id]: {
              id,
              name,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              shotCount: 0,
            },
          },
        }));
        return id;
      },
      
      switchProject: (id) => {
        set({ currentProjectId: id });
      },
      
      deleteProject: (id) => {
        set((state) => {
          const { [id]: _, ...remaining } = state.projects;
          return {
            projects: remaining,
            currentProjectId: state.currentProjectId === id ? 'default' : state.currentProjectId,
          };
        });
      },
      
      renameProject: (id, name) => {
        set((state) => ({
          projects: {
            ...state.projects,
            [id]: {
              ...state.projects[id],
              name,
              updatedAt: Date.now(),
            },
          },
        }));
      },
    }),
    {
      name: 'storyforge-projects',
    }
  )
);
