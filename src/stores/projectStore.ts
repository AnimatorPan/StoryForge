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
  
  selectShot: (id: string, multi?: boolean) => void;
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
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...shot,
        };
        
        set({ 
          shots: [...get().shots, newShot],
        });
        
        get().updateProjectShotCount();
      },
      
      updateShot: (id, updates) => {
        set({
          shots: get().shots.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
          ),
        });
      },
      
      deleteShot: (id) => {
        const newShots = get().shots.filter((s) => s.id !== id);
        const reindexedShots = newShots.map((s, idx) => ({
          ...s,
          sequence: idx + 1,
        }));
        
        set({
          shots: reindexedShots,
          selectedShotIds: get().selectedShotIds.filter((sid) => sid !== id),
        });
        
        get().updateProjectShotCount();
      },
      
      duplicateShot: (id) => {
        const shot = get().shots.find((s) => s.id === id);
        if (!shot) return;
        
        const newShot: Shot = {
          ...shot,
          id: `shot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sequence: get().shots.length + 1,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set({ shots: [...get().shots, newShot] });
        get().updateProjectShotCount();
      },
      
      moveShot: (fromIndex, toIndex) => {
        const shots = [...get().shots];
        const [moved] = shots.splice(fromIndex, 1);
        shots.splice(toIndex, 0, moved);
        
        const reindexedShots = shots.map((s, idx) => ({
          ...s,
          sequence: idx + 1,
        }));
        
        set({ shots: reindexedShots });
      },
      
      selectShot: (id, multi = false) => {
        if (id === 'all') {
          set({ selectedShotIds: get().shots.map((s) => s.id) });
        } else if (id === 'none') {
          set({ selectedShotIds: [] });
        } else if (multi) {
          const current = get().selectedShotIds;
          if (current.includes(id)) {
            set({ selectedShotIds: current.filter((sid) => sid !== id) });
          } else {
            set({ selectedShotIds: [...current, id] });
          }
        } else {
          set({ selectedShotIds: [id] });
        }
      },
      
      selectAll: () => {
        set({ selectedShotIds: get().shots.map((s) => s.id) });
      },
      
      clearSelection: () => {
        set({ selectedShotIds: [] });
      },
      
      createProject: (name) => {
        const id = `proj_${Date.now()}`;
        set({
          projects: {
            ...get().projects,
            [id]: {
              id,
              name,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              shotCount: 0,
            },
          },
        });
        return id;
      },
      
      switchProject: (id) => {
        set({ currentProjectId: id });
      },
      
      deleteProject: (id) => {
        if (id === 'default') return;
        const { [id]: _, ...rest } = get().projects;
        set({
          projects: rest,
          currentProjectId: 'default',
        });
      },
      
      renameProject: (id, name) => {
        set({
          projects: {
            ...get().projects,
            [id]: { ...get().projects[id], name, updatedAt: Date.now() },
          },
        });
      },
      
      updateProjectShotCount: () => {
        const currentId = get().currentProjectId;
        set({
          projects: {
            ...get().projects,
            [currentId]: {
              ...get().projects[currentId],
              shotCount: get().shots.length,
              updatedAt: Date.now(),
            },
          },
        });
      },
    }),
    {
      name: 'soullens-projects',
    }
  )
);
