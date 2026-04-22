import React, { useState, useEffect } from 'react';
import { Image, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { usePreviewGenerator } from '../../hooks/usePreviewGenerator';
import { useProjectStore } from '../../stores/projectStore';

interface PreviewPanelProps {
  shotId: string;
  prompt: string;
  onClose: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  shotId,
  prompt,
  onClose,
}) => {
  const { generatePreview, isGenerating, abortGeneration } = usePreviewGenerator();
  const { updateShot } = useProjectStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  
  useEffect(() => {
    handleGenerate();
    return () => {
      if (isGenerating) {
        abortGeneration();
      }
    };
  }, [shotId]);
  
  const handleGenerate = async () => {
    setStatus('generating');
    setError(null);
    
    try {
      const result = await generatePreview(shotId, prompt);
      if (result) {
        if (result.status === 'completed' && result.url) {
          setPreviewUrl(result.url);
          setStatus('completed');
          // Save preview URL to shot
          updateShot(shotId, { previewUrl: result.url });
        } else if (result.status === 'error') {
          setError(result.errorMessage || '生成失败');
          setStatus('error');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setStatus('error');
    }
  };
  
  const handleRegenerate = () => {
    setPreviewUrl(null);
    setError(null);
    handleGenerate();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Image className="w-5 h-5" />
            预览图生成
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">提示词</label>
          <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 max-h-24 overflow-y-auto">
            {prompt}
          </div>
        </div>
        
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
          {status === 'generating' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-3" />
              <p className="text-gray-600">正在生成预览图...</p>
            </div>
          )}
          
          {status === 'completed' && previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          )}
          
          {status === 'error' && (
            <div className="text-center p-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-2">生成失败</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          )}
          
          {status === 'idle' && (
            <div className="text-center text-gray-400">
              <Image className="w-12 h-12 mx-auto mb-2" />
              <p>点击生成预览图</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          {(status === 'completed' || status === 'error') && (
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              重新生成
            </button>
          )}
          
          {status === 'generating' && (
            <button
              onClick={abortGeneration}
              className="px-4 py-2 border rounded hover:bg-gray-50 text-red-600"
            >
              取消
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            {status === 'completed' ? '完成' : '关闭'}
          </button>
        </div>
      </div>
    </div>
  );
};
