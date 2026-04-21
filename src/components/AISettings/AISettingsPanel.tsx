import React, { useState } from 'react';
import { useAIStore } from '../../stores/aiStore';
import { TEXT_PROVIDERS, IMAGE_PROVIDERS } from '../../constants';

export function AISettingsPanel() {
  const {
    textConfig,
    imageConfig,
    customEndpoint,
    customModel,
    setTextProvider,
    setTextApiKey,
    setTextModel,
    setImageProvider,
    setImageApiKey,
    setImageModel,
    setCustomEndpoint,
    setCustomModel,
  } = useAIStore();

  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');

  const currentTextProvider = TEXT_PROVIDERS.find((p) => p.id === textConfig.providerId);
  const currentImageProvider = IMAGE_PROVIDERS.find((p) => p.id === imageConfig.providerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'text'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📝 文本生成设置
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'image'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🖼️ 图片生成设置
        </button>
      </div>

      {activeTab === 'text' ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>{currentTextProvider?.icon}</span>
              <span>AI 文本提供商</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择提供商
                </label>
                <select
                  value={textConfig.providerId}
                  onChange={(e) => setTextProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {TEXT_PROVIDERS.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.icon} {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                  {currentTextProvider?.keyLink && (
                    <a
                      href={currentTextProvider.keyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary-600 hover:underline text-xs"
                    >
                      获取 API Key →
                    </a>
                  )}
                </label>
                <input
                  type="password"
                  value={textConfig.apiKey}
                  onChange={(e) => setTextApiKey(e.target.value)}
                  placeholder={currentTextProvider?.keyHint || '输入 API Key'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">{currentTextProvider?.keyHint}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模型
                </label>
                <select
                  value={textConfig.model}
                  onChange={(e) => setTextModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {currentTextProvider?.models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {textConfig.providerId === 'custom' && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold mb-4">🔧 自定义配置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API 端点
                  </label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="https://api.example.com/v1/chat/completions"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    模型名称
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="model-name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>{currentImageProvider?.icon}</span>
              <span>AI 图片提供商</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择提供商
                </label>
                <select
                  value={imageConfig.providerId}
                  onChange={(e) => setImageProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {IMAGE_PROVIDERS.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.icon} {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                  {currentImageProvider?.keyLink && (
                    <a
                      href={currentImageProvider.keyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary-600 hover:underline text-xs"
                    >
                      获取 API Key →
                    </a>
                  )}
                </label>
                <input
                  type="password"
                  value={imageConfig.apiKey}
                  onChange={(e) => setImageApiKey(e.target.value)}
                  placeholder={currentImageProvider?.keyHint || '输入 API Key'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">{currentImageProvider?.keyHint}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模型
                </label>
                <select
                  value={imageConfig.model}
                  onChange={(e) => setImageModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {currentImageProvider?.models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
