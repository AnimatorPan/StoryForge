import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Comment {
  id: string;
  shotId: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
  resolved: boolean;
  parentId?: string;
  replies?: Comment[];
}

export interface Annotation {
  id: string;
  shotId: string;
  type: 'highlight' | 'note' | 'warning' | 'suggestion';
  startOffset: number;
  endOffset: number;
  content: string;
  author: string;
  authorId: string;
  timestamp: number;
  color?: string;
}

interface CollaborationState {
  comments: Record<string, Comment[]>;
  annotations: Record<string, Annotation[]>;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
    color: string;
  };
  onlineUsers: Array<{
    id: string;
    name: string;
    avatar?: string;
    color: string;
    lastSeen: number;
  }>;
  
  // Comment actions
  addComment: (shotId: string, content: string, parentId?: string) => Comment;
  updateComment: (shotId: string, commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (shotId: string, commentId: string) => void;
  resolveComment: (shotId: string, commentId: string) => void;
  getShotComments: (shotId: string) => Comment[];
  getUnresolvedComments: (shotId: string) => Comment[];
  
  // Annotation actions
  addAnnotation: (shotId: string, annotation: Omit<Annotation, 'id' | 'timestamp' | 'author' | 'authorId'>) => Annotation;
  updateAnnotation: (shotId: string, annotationId: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (shotId: string, annotationId: string) => void;
  getShotAnnotations: (shotId: string) => Annotation[];
  
  // User actions
  setCurrentUser: (user: { id: string; name: string; avatar?: string }) => void;
  updateUserPresence: () => void;
  getOnlineUsers: () => Array<CollaborationState['onlineUsers'][0]>;
  
  // Export/Import
  exportCollaboration: () => string;
  importCollaboration: (data: string) => boolean;
}

const generateUserColor = (userId: string): string => {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set, get) => ({
      comments: {},
      annotations: {},
      currentUser: {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name: '匿名用户',
        color: generateUserColor('anonymous'),
      },
      onlineUsers: [],
      
      addComment: (shotId, content, parentId) => {
        const comment: Comment = {
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          shotId,
          author: get().currentUser.name,
          authorId: get().currentUser.id,
          content,
          timestamp: Date.now(),
          resolved: false,
          parentId,
        };
        
        set((state) => ({
          comments: {
            ...state.comments,
            [shotId]: [...(state.comments[shotId] || []), comment],
          },
        }));
        
        return comment;
      },
      
      updateComment: (shotId, commentId, updates) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [shotId]: state.comments[shotId]?.map((c) =>
              c.id === commentId ? { ...c, ...updates } : c
            ) || [],
          },
        }));
      },
      
      deleteComment: (shotId, commentId) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [shotId]: state.comments[shotId]?.filter((c) => c.id !== commentId) || [],
          },
        }));
      },
      
      resolveComment: (shotId, commentId) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [shotId]: state.comments[shotId]?.map((c) =>
              c.id === commentId ? { ...c, resolved: true } : c
            ) || [],
          },
        }));
      },
      
      getShotComments: (shotId) => {
        return get().comments[shotId] || [];
      },
      
      getUnresolvedComments: (shotId) => {
        return (get().comments[shotId] || []).filter((c) => !c.resolved);
      },
      
      addAnnotation: (shotId, annotation) => {
        const newAnnotation: Annotation = {
          ...annotation,
          id: `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          shotId,
          author: get().currentUser.name,
          authorId: get().currentUser.id,
          timestamp: Date.now(),
          color: annotation.color || get().currentUser.color,
        };
        
        set((state) => ({
          annotations: {
            ...state.annotations,
            [shotId]: [...(state.annotations[shotId] || []), newAnnotation],
          },
        }));
        
        return newAnnotation;
      },
      
      updateAnnotation: (shotId, annotationId, updates) => {
        set((state) => ({
          annotations: {
            ...state.annotations,
            [shotId]: state.annotations[shotId]?.map((a) =>
              a.id === annotationId ? { ...a, ...updates } : a
            ) || [],
          },
        }));
      },
      
      deleteAnnotation: (shotId, annotationId) => {
        set((state) => ({
          annotations: {
            ...state.annotations,
            [shotId]: state.annotations[shotId]?.filter((a) => a.id !== annotationId) || [],
          },
        }));
      },
      
      getShotAnnotations: (shotId) => {
        return get().annotations[shotId] || [];
      },
      
      setCurrentUser: (user) => {
        set({
          currentUser: {
            ...user,
            color: generateUserColor(user.id),
          },
        });
      },
      
      updateUserPresence: () => {
        const { currentUser, onlineUsers } = get();
        const now = Date.now();
        
        // Update current user presence
        const existingIndex = onlineUsers.findIndex((u) => u.id === currentUser.id);
        let newOnlineUsers = [...onlineUsers];
        
        if (existingIndex >= 0) {
          newOnlineUsers[existingIndex] = {
            ...newOnlineUsers[existingIndex],
            lastSeen: now,
          };
        } else {
          newOnlineUsers.push({
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            color: currentUser.color,
            lastSeen: now,
          });
        }
        
        // Remove users not seen in last 5 minutes
        newOnlineUsers = newOnlineUsers.filter((u) => now - u.lastSeen < 5 * 60 * 1000);
        
        set({ onlineUsers: newOnlineUsers });
      },
      
      getOnlineUsers: () => {
        const now = Date.now();
        return get().onlineUsers.filter((u) => now - u.lastSeen < 5 * 60 * 1000);
      },
      
      exportCollaboration: () => {
        return JSON.stringify({
          comments: get().comments,
          annotations: get().annotations,
          exportedAt: Date.now(),
        }, null, 2);
      },
      
      importCollaboration: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.comments && parsed.annotations) {
            set({
              comments: parsed.comments,
              annotations: parsed.annotations,
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
      name: 'storyforge-collaboration',
    }
  )
);
