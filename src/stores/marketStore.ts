import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MarketPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  authorAvatar?: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  icon: string;
  screenshots: string[];
  changelog: string;
  createdAt: number;
  updatedAt: number;
  price: 'free' | 'paid';
  priceAmount?: number;
  category: 'productivity' | 'ai' | 'integration' | 'visualization' | 'automation' | 'other';
  dependencies?: string[];
  minAppVersion: string;
}

export interface MarketReview {
  id: string;
  pluginId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: number;
  helpful: number;
}

export interface MarketCollection {
  id: string;
  name: string;
  description: string;
  plugins: string[];
  curatedBy: string;
  createdAt: number;
}

interface MarketState {
  plugins: MarketPlugin[];
  reviews: MarketReview[];
  collections: MarketCollection[];
  installedIds: string[];
  favorites: string[];
  searchHistory: string[];
}

interface MarketActions {
  // Browse
  getFeaturedPlugins: () => MarketPlugin[];
  getPopularPlugins: () => MarketPlugin[];
  getNewPlugins: () => MarketPlugin[];
  getPluginsByCategory: (category: MarketPlugin['category']) => MarketPlugin[];
  getPluginsByTag: (tag: string) => MarketPlugin[];
  searchPlugins: (query: string) => MarketPlugin[];
  
  // Plugin details
  getPluginById: (id: string) => MarketPlugin | undefined;
  getPluginReviews: (pluginId: string) => MarketReview[];
  getPluginAverageRating: (pluginId: string) => number;
  
  // User actions
  installPlugin: (id: string) => void;
  uninstallPlugin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addReview: (review: Omit<MarketReview, 'id' | 'createdAt' | 'helpful'>) => void;
  markReviewHelpful: (reviewId: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // Collections
  getCollection: (id: string) => MarketCollection | undefined;
  createCollection: (name: string, description: string, plugins: string[]) => void;
  
  // Sync
  syncWithRegistry: () => Promise<void>;
}

// Mock data
const MOCK_PLUGINS: MarketPlugin[] = [
  {
    id: 'storyforge-ai-enhancer',
    name: 'AI Prompt Enhancer',
    version: '1.2.0',
    description: '使用 GPT-4 自动优化提示词质量，支持多种优化模式',
    author: 'StoryForge Team',
    downloads: 15420,
    rating: 4.8,
    ratingCount: 342,
    tags: ['AI', 'productivity', 'prompt'],
    icon: 'wand-2',
    screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
    changelog: 'v1.2.0: 支持批量优化',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    price: 'free',
    category: 'ai',
    minAppVersion: '1.0.0',
  },
  {
    id: 'storyforge-batch-exporter',
    name: 'Batch Exporter Pro',
    version: '2.1.0',
    description: '批量导出多种格式（PDF, Word, Final Draft, Celtx）',
    author: 'Studio Tools',
    downloads: 8930,
    rating: 4.6,
    ratingCount: 215,
    tags: ['export', 'productivity', 'batch'],
    icon: 'download',
    screenshots: ['export1.jpg'],
    changelog: 'v2.1.0: 新增 Celtx 支持',
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    price: 'paid',
    priceAmount: 29.99,
    category: 'productivity',
    minAppVersion: '1.0.0',
  },
  {
    id: 'storyforge-character-db',
    name: 'Character Database',
    version: '1.5.0',
    description: '管理角色库并与镜头自动关联，支持角色关系图',
    author: 'Narrative Tools',
    downloads: 12350,
    rating: 4.9,
    ratingCount: 428,
    tags: ['characters', 'database', 'visualization'],
    icon: 'users',
    screenshots: ['chars1.jpg', 'chars2.jpg', 'chars3.jpg'],
    changelog: 'v1.5.0: 新增关系图功能',
    createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    price: 'free',
    category: 'productivity',
    minAppVersion: '1.0.0',
  },
  {
    id: 'storyforge-story-analyzer',
    name: 'Story Structure Analyzer',
    version: '1.0.5',
    description: '分析剧本结构，检测情节漏洞和节奏问题',
    author: 'Script Doctor',
    downloads: 5670,
    rating: 4.4,
    ratingCount: 128,
    tags: ['analysis', 'story', 'structure'],
    icon: 'search',
    screenshots: ['analyzer1.jpg'],
    changelog: 'v1.0.5: 修复节奏检测问题',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
    price: 'free',
    category: 'ai',
    minAppVersion: '1.2.0',
  },
  {
    id: 'storyforge-voice-input',
    name: 'Voice Input',
    version: '0.9.0',
    description: '语音输入转提示词，支持多种语言',
    author: 'Accessibility First',
    downloads: 3210,
    rating: 4.2,
    ratingCount: 89,
    tags: ['accessibility', 'input', 'voice'],
    icon: 'mic',
    screenshots: ['voice1.jpg'],
    changelog: 'v0.9.0: Beta 版本',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    price: 'free',
    category: 'productivity',
    minAppVersion: '1.0.0',
  },
  {
    id: 'storyforge-timeline-viz',
    name: 'Timeline Visualizer',
    version: '1.1.0',
    description: '可视化时间线编辑器，支持多线并行',
    author: 'Visual Story',
    downloads: 7890,
    rating: 4.7,
    ratingCount: 256,
    tags: ['visualization', 'timeline', 'editing'],
    icon: 'timeline',
    screenshots: ['timeline1.jpg', 'timeline2.jpg'],
    changelog: 'v1.1.0: 支持颜色编码',
    createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    price: 'paid',
    priceAmount: 19.99,
    category: 'visualization',
    minAppVersion: '1.0.0',
  },
  {
    id: 'storyforge-auto-tag',
    name: 'Auto Tagger',
    version: '1.0.0',
    description: 'AI 自动分析镜头并建议标签',
    author: 'Smart Tools',
    downloads: 4560,
    rating: 4.3,
    ratingCount: 167,
    tags: ['AI', 'automation', 'tags'],
    icon: 'tag',
    screenshots: ['tagger1.jpg'],
    changelog: 'v1.0.0: 初始版本',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    price: 'free',
    category: 'automation',
    minAppVersion: '1.0.0',
  },
  {
    id: 'storyforge-notion-sync',
    name: 'Notion Sync',
    version: '1.3.0',
    description: '与 Notion 双向同步项目数据',
    author: 'Integration Hub',
    downloads: 6780,
    rating: 4.5,
    ratingCount: 198,
    tags: ['integration', 'sync', 'notion'],
    icon: 'sync',
    screenshots: ['notion1.jpg'],
    changelog: 'v1.3.0: 支持数据库同步',
    createdAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    price: 'free',
    category: 'integration',
    minAppVersion: '1.0.0',
  },
];

const MOCK_REVIEWS: MarketReview[] = [
  {
    id: 'r1',
    pluginId: 'storyforge-ai-enhancer',
    userId: 'u1',
    userName: '张三',
    rating: 5,
    comment: '非常实用的插件，提示词质量提升明显！',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    helpful: 24,
  },
  {
    id: 'r2',
    pluginId: 'storyforge-ai-enhancer',
    userId: 'u2',
    userName: '李四',
    rating: 4,
    comment: '好用，但希望能支持更多语言模型',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    helpful: 12,
  },
  {
    id: 'r3',
    pluginId: 'storyforge-character-db',
    userId: 'u3',
    userName: '王五',
    rating: 5,
    comment: '角色管理神器，关系图功能太棒了',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    helpful: 18,
  },
];

const MOCK_COLLECTIONS: MarketCollection[] = [
  {
    id: 'c1',
    name: 'AI 工具集',
    description: '提升创作效率的 AI 插件精选',
    plugins: ['storyforge-ai-enhancer', 'storyforge-story-analyzer', 'storyforge-auto-tag'],
    curatedBy: 'StoryForge 官方',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'c2',
    name: '生产力套件',
    description: '专业编剧必备工具',
    plugins: ['storyforge-batch-exporter', 'storyforge-character-db', 'storyforge-voice-input'],
    curatedBy: 'Studio Pro',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
];

export const useMarketStore = create<MarketState & MarketActions>()(
  persist(
    (set, get) => ({
      plugins: MOCK_PLUGINS,
      reviews: MOCK_REVIEWS,
      collections: MOCK_COLLECTIONS,
      installedIds: [],
      favorites: [],
      searchHistory: [],

      getFeaturedPlugins: () => {
        return get().plugins
          .filter(p => p.rating >= 4.5)
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, 6);
      },

      getPopularPlugins: () => {
        return get().plugins
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, 10);
      },

      getNewPlugins: () => {
        return get().plugins
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 10);
      },

      getPluginsByCategory: (category) => {
        return get().plugins.filter(p => p.category === category);
      },

      getPluginsByTag: (tag) => {
        return get().plugins.filter(p => p.tags.includes(tag));
      },

      searchPlugins: (query) => {
        const lower = query.toLowerCase();
        return get().plugins.filter(p =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.tags.some(t => t.toLowerCase().includes(lower))
        );
      },

      getPluginById: (id) => {
        return get().plugins.find(p => p.id === id);
      },

      getPluginReviews: (pluginId) => {
        return get().reviews.filter(r => r.pluginId === pluginId);
      },

      getPluginAverageRating: (pluginId) => {
        const reviews = get().reviews.filter(r => r.pluginId === pluginId);
        if (reviews.length === 0) return 0;
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      },

      installPlugin: (id) => {
        set(state => ({
          installedIds: state.installedIds.includes(id)
            ? state.installedIds
            : [...state.installedIds, id],
        }));
      },

      uninstallPlugin: (id) => {
        set(state => ({
          installedIds: state.installedIds.filter(i => i !== id),
        }));
      },

      toggleFavorite: (id) => {
        set(state => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter(f => f !== id)
            : [...state.favorites, id],
        }));
      },

      addReview: (review) => {
        const newReview: MarketReview = {
          ...review,
          id: `r${Date.now()}`,
          createdAt: Date.now(),
          helpful: 0,
        };
        set(state => ({ reviews: [...state.reviews, newReview] }));
      },

      markReviewHelpful: (reviewId) => {
        set(state => ({
          reviews: state.reviews.map(r =>
            r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
          ),
        }));
      },

      addToSearchHistory: (query) => {
        if (!query.trim()) return;
        set(state => ({
          searchHistory: [query, ...state.searchHistory.filter(h => h !== query)].slice(0, 10),
        }));
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      getCollection: (id) => {
        return get().collections.find(c => c.id === id);
      },

      createCollection: (name, description, plugins) => {
        const newCollection: MarketCollection = {
          id: `c${Date.now()}`,
          name,
          description,
          plugins,
          curatedBy: 'You',
          createdAt: Date.now(),
        };
        set(state => ({ collections: [...state.collections, newCollection] }));
      },

      syncWithRegistry: async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In real implementation, fetch from registry API
      },
    }),
    {
      name: 'storyforge-market',
      partialize: (state) => ({
        installedIds: state.installedIds,
        favorites: state.favorites,
        searchHistory: state.searchHistory,
      }),
    }
  )
);
