import React, { useState, useCallback } from 'react';
import { useMarketStore, MarketPlugin } from '../../stores/marketStore';
import { usePluginStore } from '../../stores/pluginStore';
import {
  Store,
  Search,
  Star,
  Download,
  Heart,
  Check,
  Filter,
  TrendingUp,
  Sparkles,
  Clock,
  Package,
  ChevronRight,
  ExternalLink,
  Shield,
  Zap,
  Users,
  Image,
  Tag,
  RefreshCw,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: '全部', icon: Package },
  { id: 'productivity', name: '生产力', icon: Zap },
  { id: 'ai', name: 'AI 工具', icon: Sparkles },
  { id: 'integration', name: '集成', icon: RefreshCw },
  { id: 'visualization', name: '可视化', icon: Image },
  { id: 'automation', name: '自动化', icon: TrendingUp },
  { id: 'other', name: '其他', icon: Tag },
];

export const MarketPlace: React.FC = () => {
  const market = useMarketStore();
  const pluginStore = usePluginStore();
  
  const [activeTab, setActiveTab] = useState<'featured' | 'popular' | 'new' | 'installed'>('featured');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<MarketPlugin | null>(null);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);

  const getPlugins = useCallback(() => {
    let plugins: MarketPlugin[] = [];
    
    switch (activeTab) {
      case 'featured':
        plugins = market.getFeaturedPlugins();
        break;
      case 'popular':
        plugins = market.getPopularPlugins();
        break;
      case 'new':
        plugins = market.getNewPlugins();
        break;
      case 'installed':
        plugins = market.installedIds.map(id => market.getPluginById(id)).filter(Boolean) as MarketPlugin[];
        break;
    }

    if (selectedCategory !== 'all') {
      plugins = plugins.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      plugins = market.searchPlugins(searchQuery);
    }

    return plugins;
  }, [activeTab, selectedCategory, searchQuery, market]);

  const plugins = getPlugins();

  const handleInstall = async (plugin: MarketPlugin) => {
    setIsInstalling(plugin.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    market.installPlugin(plugin.id);
    
    // Also install in plugin store
    const code = `
      // Plugin: ${plugin.id}
      function main() {
        console.log('${plugin.name} loaded');
      }
    `;
    await pluginStore.installPlugin({
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      entry: 'main.js',
      permissions: ['read:shots', 'ui:panel'],
      icon: plugin.icon,
      tags: plugin.tags,
    }, code);
    
    setIsInstalling(null);
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">插件市场</h2>
            <p className="text-gray-500">发现和安装社区插件</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索插件..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>
          <button
            onClick={() => market.syncWithRegistry()}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'featured', label: '精选', icon: Sparkles },
          { id: 'popular', label: '热门', icon: TrendingUp },
          { id: 'new', label: '最新', icon: Clock },
          { id: 'installed', label: '已安装', icon: Check },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 pb-2 px-4 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map(plugin => {
          const isInstalled = market.installedIds.includes(plugin.id);
          const isFavorite = market.favorites.includes(plugin.id);
          const isInstallingThis = isInstalling === plugin.id;

          return (
            <div
              key={plugin.id}
              onClick={() => setSelectedPlugin(plugin)}
              className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      market.toggleFavorite(plugin.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFavorite
                        ? 'text-red-500 bg-red-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                {plugin.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {plugin.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                {renderStars(plugin.rating)}
                <span className="text-xs text-gray-400">
                  {formatNumber(plugin.downloads)} 下载
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {plugin.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {plugin.price === 'paid' && (
                  <span className="text-sm font-semibold text-purple-600">
                    ¥{plugin.priceAmount}
                  </span>
                )}
              </div>

              {isInstalled && (
                <div className="mt-3 flex items-center gap-1 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  已安装
                </div>
              )}
            </div>
          );
        })}
      </div>

      {plugins.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>暂无插件</p>
          <p className="text-sm">尝试切换分类或搜索关键词</p>
        </div>
      )}

      {/* Plugin Detail Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedPlugin.name}
                    </h3>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      v{selectedPlugin.version}
                    </span>
                  </div>
                  <p className="text-gray-500">{selectedPlugin.author}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {renderStars(selectedPlugin.rating)}
                    <span className="text-sm text-gray-500">
                      {selectedPlugin.ratingCount} 评价
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatNumber(selectedPlugin.downloads)} 下载
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlugin(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-3 mb-6">
                {market.installedIds.includes(selectedPlugin.id) ? (
                  <button
                    disabled
                    className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    已安装
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(selectedPlugin)}
                    disabled={isInstalling === selectedPlugin.id}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isInstalling === selectedPlugin.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        安装中...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        {selectedPlugin.price === 'free' ? '免费安装' : `¥${selectedPlugin.priceAmount} 购买`}
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => market.toggleFavorite(selectedPlugin.id)}
                  className={`px-4 py-3 rounded-xl border-2 transition-colors ${
                    market.favorites.includes(selectedPlugin.id)
                      ? 'border-red-500 text-red-500'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${market.favorites.includes(selectedPlugin.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">简介</h4>
                  <p className="text-gray-600">{selectedPlugin.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">标签</h4>
                  <div className="flex gap-2">
                    {selectedPlugin.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">更新日志</h4>
                  <p className="text-gray-600 text-sm">{selectedPlugin.changelog}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>创建于 {new Date(selectedPlugin.createdAt).toLocaleDateString()}</span>
                  <span>更新于 {new Date(selectedPlugin.updatedAt).toLocaleDateString()}</span>
                  <span>最低版本要求: {selectedPlugin.minAppVersion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPlace;
