import React, { useState } from 'react';
import { useHistoryStore, PromptVersion } from '../../stores/historyStore';
import { useProjectStore } from '../../stores/projectStore';
import { Clock, RotateCcw, Trash2, X, ChevronDown, ChevronUp, Save, Download, Upload } from 'lucide-react';

interface VersionHistoryProps {
  shotId: string;
  onRestore?: (prompt: string) => void;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  shotId,
  onRestore,
  onClose,
}) => {
  const { 
    getShotVersions, 
    deletePromptVersion, 
    restorePromptVersion,
    exportHistory,
    importHistory,
  } = useHistoryStore();
  const { updateShot } = useProjectStore();
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);
  
  const versions = getShotVersions(shotId);
  
  const handleRestore = (version: PromptVersion) => {
    restorePromptVersion(shotId, version.id);
    updateShot(shotId, { seedancePrompt: version.prompt });
    if (onRestore) {
      onRestore(version.prompt);
    }
  };
  
  const handleDelete = (versionId: string) => {
    deletePromptVersion(shotId, versionId);
  };
  
  const handleExport = () => {
    const data = exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyforge-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    if (importData.trim()) {
      const success = importHistory(importData.trim());
      if (success) {
        setImportData('');
        setShowImport(false);
        alert('历史记录导入成功');
      } else {
        alert('导入失败，请检查文件格式');
      }
    }
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (versions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              历史版本
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-500 text-center py-8">暂无历史版本</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowImport(true)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              导入
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-900 text-white rounded text-sm"
            >
              关闭
            </button>
          </div>
          
          {showImport && (
            <div className="mt-4 border-t pt-4">
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="粘贴历史记录 JSON..."
                className="w-full h-24 p-2 border rounded text-sm font-mono"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowImport(false)}
                  className="px-3 py-1 text-sm text-gray-600"
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  className="px-3 py-1 bg-gray-900 text-white rounded text-sm"
                >
                  确认导入
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            历史版本 ({versions.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
              title="导出历史"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
              title="导入历史"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {showImport && (
          <div className="p-4 bg-gray-50 border-b">
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="粘贴历史记录 JSON..."
              className="w-full h-24 p-2 border rounded text-sm font-mono"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-3 py-1 text-sm text-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                className="px-3 py-1 bg-gray-900 text-white rounded text-sm"
              >
                确认导入
              </button>
            </div>
          </div>
        )}
        
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="divide-y">
            {versions.slice().reverse().map((version, index) => (
              <div
                key={version.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        版本 {versions.length - index}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(version.timestamp)}
                      </span>
                      {version.metadata?.compressed && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                          已压缩
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {version.provider} / {version.model}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRestore(version)}
                      className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                      title="恢复此版本"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(version.id)}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedVersion(
                        expandedVersion === version.id ? null : version.id
                      )}
                      className="p-1.5 hover:bg-gray-200 rounded"
                    >
                      {expandedVersion === version.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedVersion === version.id && (
                  <div className="mt-3 p-3 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
                    {version.prompt}
                  </div>
                )}
                
                {version.metadata && (
                  <div className="mt-2 text-xs text-gray-400">
                    {version.metadata.originalLength && version.metadata.compressedLength && (
                      <span>
                        压缩: {version.metadata.originalLength} → {version.metadata.compressedLength} 字符
                        ({Math.round((1 - version.metadata.compressedLength / version.metadata.originalLength) * 100)}% 节省)
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
