import { create } from 'zustand';

interface UIState {
  activeTab: 'shots' | 'ai-settings' | 'image-gen' | 'styles';
  isSidebarOpen: boolean;
  isGenerating: boolean;
  generationProgress: number;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  
  setActiveTab: (tab: UIState['activeTab']) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'shots',
  isSidebarOpen: true,
  isGenerating: false,
  generationProgress: 0,
  toast: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  showToast: (message, type) => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));
