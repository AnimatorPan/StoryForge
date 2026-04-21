import React from 'react';
import { useAIStore } from '../../stores/aiStore';
import { DIRECTOR_STYLES } from '../../constants';

export function DirectorStyles() {
  const { textConfig, setTextProvider } = useAIStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">🎨 导演风格预设</h2>
        <p className="text-gray-600 mb-6">
          选择一种视觉风格，AI 将根据该风格生成对应的 SEEDANCE 提示词
        </p>

        <div className="grid grid-cols-3 gap-4">
          {DIRECTOR_STYLES.map((style) => (
            <div
              key={style.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                // 可以设置为默认风格或应用到当前选择的分镜
              }}
            >
              <div className="text-3xl mb-2">{style.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{style.name}</h3>
              <p className="text-sm text-gray-600">{style.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary-50 p-6 rounded-lg border border-primary-200">
        <h3 className="font-semibold text-primary-900 mb-2">💡 使用提示</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li>• 在 AI 设置中选择对应的提供商和模型</li>
          <li>• 在分镜表格中填写基础信息后，点击生成提示词</li>
          <li>• 生成的提示词会自动标记 @标签 便于识别</li>
          <li>• 可以直接复制提示词到 SEEDANCE 或其他 AI 视频工具使用</li>
        </ul>
      </div>
    </div>
  );
}
