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
  // 添加图片
  addImage: (image: Omit<MaterialImage, 'id' | 'createdAt' | 'updatedAt'>) => string;
  // 删除图片
  removeImage: (id: string) => void;
  // 更新图片
  updateImage: (id: string, updates: Partial<MaterialImage>) => void;
  // 关联分镜
  associateWithShot: (imageId: string, shotId: string) => void;
  // 解除关联
  disassociateFromShot: (imageId: string, shotId: string) => void;
  // 添加标签
  addTag: (tag: string) => void;
  // 删除标签
  removeTag: (tag: string) => void;
  // 获取图片
  getImageById: (id: string) => MaterialImage | undefined;
  // 获取分镜关联的图片
  getImagesByShotId: (shotId: string) => MaterialImage[];
  // 按类型获取图片
  getImagesByType: (type: MaterialImage['type']) => MaterialImage[];
  // 按标签搜索
  searchByTags: (tags: string[]) => MaterialImage[];
  // 搜索名称
  searchByName: (query: string) => MaterialImage[];
  // 导入图片
  importImages: (images: Partial<MaterialImage>[]) => void;
  // 导出图片
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
          ...img,
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          associatedShotIds: img.associatedShotIds || [],
          tags: img.tags || [],
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
