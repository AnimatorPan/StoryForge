import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MaterialImage {
  id: string;
  url: string;
  name: string;
  type: 'character' | 'prop' | 'scene' | 'reference' | 'other';
  tags: string[];
  associatedShotIds: string[];
  createdAt: number;
  updatedAt: number;
  size?: number;
  width?: number;
  height?: number;
}

export interface MaterialLibrary {
  images: MaterialImage[];
  tags: string[];
}

interface MaterialStoreState extends MaterialLibrary {
  addImage: (image: Omit<MaterialImage, 'id' | 'createdAt' | 'updatedAt'>) => string;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<MaterialImage>) => void;
  associateWithShot: (imageId: string, shotId: string) => void;
  disassociateFromShot: (imageId: string, shotId: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  getImageById: (id: string) => MaterialImage | undefined;
  getImagesByShotId: (shotId: string) => MaterialImage[];
  getImagesByType: (type: MaterialImage['type']) => MaterialImage[];
  searchByTags: (tags: string[]) => MaterialImage[];
  searchByName: (query: string) => MaterialImage[];
  importImages: (images: Partial<MaterialImage>[]) => void;
  exportImages: () => MaterialImage[];
}

export const useMaterialStore = create<MaterialStoreState>()(
  persist(
    (set, get) => ({
      images: [],
      tags: [],

      addImage: (imageData) => {
        const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newImage: MaterialImage = {
          ...imageData,
          id,
          associatedShotIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          images: [...state.images, newImage],
          tags: [...new Set([...state.tags, ...imageData.tags])],
        }));
        
        return id;
      },

      removeImage: (id) => {
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      },

      updateImage: (id, updates) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id
              ? { ...img, ...updates, updatedAt: Date.now() }
              : img
          ),
          tags: updates.tags
            ? [...new Set([...state.tags, ...updates.tags])]
            : state.tags,
        }));
      },

      associateWithShot: (imageId, shotId) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId && !img.associatedShotIds.includes(shotId)
              ? {
                  ...img,
                  associatedShotIds: [...img.associatedShotIds, shotId],
                  updatedAt: Date.now(),
                }
              : img
          ),
        }));
      },

      disassociateFromShot: (imageId, shotId) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  associatedShotIds: img.associatedShotIds.filter((id) => id !== shotId),
                  updatedAt: Date.now(),
                }
              : img
          ),
        }));
      },

      addTag: (tag) => {
        set((state) => ({
          tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
        }));
      },

      removeTag: (tag) => {
        set((state) => ({
          tags: state.tags.filter((t) => t !== tag),
          images: state.images.map((img) => ({
            ...img,
            tags: img.tags.filter((t) => t !== tag),
          })),
        }));
      },

      getImageById: (id) => {
        return get().images.find((img) => img.id === id);
      },

      getImagesByShotId: (shotId) => {
        return get().images.filter((img) => img.associatedShotIds.includes(shotId));
      },

      getImagesByType: (type) => {
        return get().images.filter((img) => img.type === type);
      },

      searchByTags: (tags) => {
        return get().images.filter((img) =>
          tags.some((tag) => img.tags.includes(tag))
        );
      },

      searchByName: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().images.filter((img) =>
          img.name.toLowerCase().includes(lowerQuery)
        );
      },

      importImages: (images) => {
        const newImages: MaterialImage[] = images.map((img) => ({
          url: img.url || '',
          name: img.name || '',
          type: img.type || 'reference',
          tags: img.tags || [],
          associatedShotIds: img.associatedShotIds || [],
          size: img.size,
          width: img.width,
          height: img.height,
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        
        set((state) => ({
          images: [...state.images, ...newImages],
          tags: [...new Set([...state.tags, ...newImages.flatMap((i) => i.tags)])],
        }));
      },

      exportImages: () => {
        return get().images;
      },
    }),
    {
      name: 'storyforge-materials',
      version: 1,
    }
  )
);
