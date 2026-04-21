import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useAIStore } from '../../stores/aiStore';
import { useImageGen } from '../../hooks/useImageGen';
import { IMAGE_PROVIDERS, IMAGE_SIZES, DIRECTOR_STYLES } from '../../constants';

export function ImageGenPanel() {
  const { shots, selectedShotIds, updateShot } = useProjectStore();
  const { imageConfig } = useAIStore();
  const { generateImage, isGenerating, progress, error } = useImageGen();
  
  const [selectedSize, setSelectedSize] = useState('1792x1024');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});

  const selectedShots = shots.filter((s) => selectedShotIds.includes(s.id));
  const currentProvider = IMAGE_PROVIDERS.find((p) => p.id === imageConfig.providerId);

  const handleGenerate = async (shotId: string, prompt: string) => {
    if (!imageConfig.apiKey) {
      alert('请先配置图片生成 API Key');
      return;
    }

    try {
      const provider = IMAGE_PROVIDERS.find((p) => p.id === imageConfig.providerId);
      if (!provider) return;

      const result = await generateImage({
        provider,
        apiKey: imageConfig.apiKey,
        model: imageConfig.model,
        prompt,
        negativePrompt,
        imageSize: selectedSize as '1792x1024' | '1024x1024' | '1024x1792',
      });

      setGeneratedImages((prev) => ({ ...prev, [shotId]: result.url }));
      updateShot(shotId, { generatedImage: result.url, status: 'generated' });
    } catch (err) {
      updateShot(shotId, { status: 'error' });
    }
  };

  const handleBatchGenerate = async () => {
    for (const shot of selectedShots) {
      if (shot.seedancePrompt) {
        await handleGenerate(shot.id, shot.seedancePrompt);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 设置面板 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">🖼️ 图片生成设置</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片尺寸
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {IMAGE_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label} - {size.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              负面提示词 (可选)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="low quality, blurry, distorted..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {selectedShotIds.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleBatchGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isGenerating ? `生成中... ${progress}%` : `批量生成 (${selectedShotIds.length} 个)`}
            </button>
          </div>
        )}
      </div>

      {/* 生成结果 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">生成队列</h3>
        
        {selectedShots.length === 0 ? (
          <p className="text-gray-500">请在分镜表格中选择要生成的分镜</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {selectedShots.map((shot) => (
              <div key={shot.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">分镜 #{shot.sequence}</span>
                  <button
                    onClick={() => handleGenerate(shot.id, shot.seedancePrompt)}
                    disabled={isGenerating}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200 disabled:opacity-50"
                  >
                    生成
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                  {shot.seedancePrompt || '无提示词'}
                </p>

                {shot.generatedImage && (
                  <img
                    src={shot.generatedImage}
                    alt={`分镜 ${shot.sequence}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                {shot.status === 'pending' && !shot.generatedImage && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    等待生成
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
