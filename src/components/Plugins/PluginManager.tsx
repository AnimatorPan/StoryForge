import React, { useState, useCallback } from 'react';
import { usePluginManager } from '../../hooks/usePluginManager';
import { Plugin, PluginManifest } from '../../stores/pluginStore';
import { 
  Puzzle, 
  Download, 
  Trash2, 
  Power, 
  PowerOff, 
  Settings, 
  Search,
  Shield,
  Globe,
  Star,
  Package,
  Check,
  AlertCircle
} from 'lucide-react';

export const PluginManager: React.FC = () => {
  const {
    plugins,
    activePlugin,
    registryUrl,
    sandboxMode,
    isInstalling,
    installError,
    installPlugin,
    uninstallPlugin,
    enablePlugin,
    disablePlugin,
    setActivePlugin,
    setRegistryUrl,
    toggleSandboxMode,
    searchRegistry,
    fetchPluginCode,
  } = usePluginManager();

  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace' | 'settings'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PluginManifest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginManifest | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchRegistry(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, searchRegistry]);

  const handleInstall = useCallback(async (manifest: PluginManifest) => {
    try {
      const code = await fetchPluginCode(manifest.id);
      await installPlugin(manifest, code);
      setShowInstallModal(false);
      setSelectedPlugin(null);
    } catch (error) {
      console.error('Install failed:', error);
    }
  }, [fetchPluginCode, installPlugin]);

  const getPermissionLabel = (permission: string): string => {
    const labels: Record<string, string> = {
      'read:shots': '读取镜头',
      'write:shots': '修改镜头',
      'read:projects': '读取项目',
      'write:projects': '修改项目',
      'read:settings': '读取设置',
      'write:settings': '修改设置',
      'ui:panel': '添加面板',
      'ui:toolbar': '添加工具栏',
      'ai:generate': 'AI 生成',
      'export:file': '导出文件',
      'import:file': '导入文件',
    };
    return labels[permission] || permission;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Puzzle className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">插件管理器</h2>
            <p className="text-gray-500">扩展 StoryForge 功能</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {plugins.length} 个插件
          </span>
          <span className="text-sm text-gray-500">
            {plugins.filter(p => p.enabled).length} 个启用
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('installed')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'installed'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          已安装
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'marketplace'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          插件市场
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          设置
        </button>
      </div>

      {/* Installed Tab */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          {plugins.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Puzzle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>暂无已安装插件</p>
              <p className="text-sm">从插件市场安装扩展功能</p>
            </div>
          ) : (
            plugins.map(plugin => (
              <div
                key={plugin.id}
                onClick={() => setActivePlugin(plugin.id)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  activePlugin?.id === plugin.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Puzzle className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {plugin.name}
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                          v{plugin.version}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500">{plugin.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>作者: {plugin.author}</span>
                        <span>安装于: {new Date(plugin.installedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {plugin.permissions.slice(0, 3).map(perm => (
                          <span
                            key={perm}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                          >
                            {getPermissionLabel(perm)}
                          </span>
                        ))}
                        {plugin.permissions.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{plugin.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        plugin.enabled ? disablePlugin(plugin.id) : enablePlugin(plugin.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        plugin.enabled
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={plugin.enabled ? '禁用' : '启用'}
                    >
                      {plugin.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        uninstallPlugin(plugin.id);
                      }}
                      className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      title="卸载"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索插件..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(manifest => {
                const isInstalled = plugins.some(p => p.id === manifest.id);
                return (
                  <div
                    key={manifest.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Puzzle className="w-5 h-5 text-blue-600" />
                      </div>
                      {isInstalled && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          已安装
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{manifest.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{manifest.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>v{manifest.version}</span>
                      <span>•</span>
                      <span>{manifest.author}</span>
                    </div>
                    <div className="flex gap-2">
                      {manifest.tags?.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlugin(manifest);
                        setShowInstallModal(true);
                      }}
                      disabled={isInstalled || isInstalling}
                      className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isInstalled ? (
                        <>
                          <Check className="w-4 h-4" />
                          已安装
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          安装
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? (
                <>
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>未找到匹配的插件</p>
                </>
              ) : (
                <>
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>搜索插件市场</p>
                  <p className="text-sm">输入关键词查找扩展功能</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              插件仓库
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仓库地址
              </label>
              <input
                type="url"
                value={registryUrl}
                onChange={(e) => setRegistryUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://registry.example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                插件市场的 API 端点地址
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              安全设置
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">沙盒模式</p>
                <p className="text-sm text-gray-500">
                  启用代码验证，阻止潜在危险操作
                </p>
              </div>
              <button
                onClick={toggleSandboxMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sandboxMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    sandboxMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {!sandboxMode && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  警告：关闭沙盒模式可能允许执行危险代码，请仅从可信来源安装插件。
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">开发者选项</h3>
            <button
              onClick={() => {
                const manifest: PluginManifest = {
                  id: `custom-${Date.now()}`,
                  name: '自定义插件',
                  version: '1.0.0',
                  description: '从本地加载的自定义插件',
                  author: 'Developer',
                  entry: 'main.js',
                  permissions: ['read:shots', 'ui:panel'],
                };
                const code = '// 自定义插件代码\nfunction main() {\n  console.log("Plugin loaded");\n}';
                installPlugin(manifest, code);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              从代码安装
            </button>
          </div>
        </div>
      )}

      {/* Install Modal */}
      {showInstallModal && selectedPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              安装 {selectedPlugin.name}?
            </h3>
            <p className="text-gray-600 mb-4">{selectedPlugin.description}</p>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">所需权限:</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlugin.permissions.map(perm => (
                  <span
                    key={perm}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                  >
                    {getPermissionLabel(perm)}
                  </span>
                ))}
              </div>
            </div>

            {installError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {installError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInstallModal(false);
                  setSelectedPlugin(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleInstall(selectedPlugin)}
                disabled={isInstalling}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isInstalling ? '安装中...' : '确认安装'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PluginManager;
