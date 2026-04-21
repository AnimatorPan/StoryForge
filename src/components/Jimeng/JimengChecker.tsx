import React, { useState, useCallback } from 'react';
import { usePromptCompression } from '../../utils/promptCompression';

interface JimengCheckerProps {
  prompt: string;
  onCompress?: (compressed: string) => void;
  showActions?: boolean;
  className?: string;
}

export function JimengChecker({
  prompt,
  onCompress,
  showActions = true,
  className = '',
}: JimengCheckerProps) {
  const { check, compress, limits } = usePromptCompression();
  const [compressedText, setCompressedText] = useState<string | null>(null);
  const [showCompressed, setShowCompressed] = useState(false);

  const result = check(prompt);

  const handleCompress = useCallback(() => {
    const compressed = compress(prompt);
    setCompressedText(compressed);
    setShowCompressed(true);
    onCompress?.(compressed);
  }, [prompt, compress, onCompress]);

  const handleUseCompressed = useCallback(() => {
    if (compressedText && onCompress) {
      onCompress(compressedText);
      setShowCompressed(false);
    }
  }, [compressedText, onCompress]);

  // 根据状态确定颜色
  const getStatusColor = () => {
    if (result.charCount <= limits.RECOMMENDED) return 'text-green-600 bg-green-50 border-green-200';
    if (result.charCount <= limits.MAX_CHARS) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressColor = () => {
    if (result.charCount <= limits.RECOMMENDED) return 'bg-green-500';
    if (result.charCount <= limits.MAX_CHARS) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercent = Math.min((result.charCount / limits.MAX_CHARS) * 100, 100);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 状态指示器 */}
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">即梦兼容性</span>
            <span className="text-xs font-mono">
              {result.charCount} / {limits.MAX_CHARS}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        
        {showActions && result.needsCompression && (
          <button
            onClick={handleCompress}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            ✂️ 精简
          </button>
        )}
      </div>

      {/* 状态消息 */}
      <p className="text-xs text-gray-500">{result.message}</p>

      {/* 精简结果 */}
      {showCompressed && compressedText && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">精简后</span>
            <span className="text-xs text-green-600">
              {compressedText.length} 字符 (节省 {prompt.length - compressedText.length})
            </span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3 mb-2">{compressedText}</p>
          <div className="flex gap-2">
            <button
              onClick={handleUseCompressed}
              className="flex-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              使用精简版
            </button>
            <button
              onClick={() => setShowCompressed(false)}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 简化的行内版本
export function JimengBadge({ prompt }: { prompt: string }) {
  const { check, limits } = usePromptCompression();
  const result = check(prompt);

  if (result.charCount <= limits.RECOMMENDED) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
        <span>✓</span>
        <span>即梦</span>
      </span>
    );
  } else if (result.charCount <= limits.MAX_CHARS) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
        <span>⚠</span>
        <span>即梦</span>
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
        <span>✗</span>
        <span>超限</span>
      </span>
    );
  }
}
