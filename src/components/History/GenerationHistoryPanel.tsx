import React, { useState } from 'react';
import { useHistoryStore, GenerationHistory } from '../../stores/historyStore';
import { X, Trash2, Download, CheckCircle, XCircle, Clock, Image as ImageIcon, Type } from 'lucide-react';

interface GenerationHistoryPanelProps {
  onClose: () => void;
}

export const GenerationHistoryPanel: React.FC<GenerationHistoryPanelProps> = ({
  onClose,
}) => {
  const { 
    generations, 
    deleteGeneration, 
    clearHistory,
    exportHistory,
  } = useHistoryStore();
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'success' | 'error'>('all');
  
  const filteredGenerations = generations.filter((g) => {
    if (filter === 'all') return true;
    if (filter === 'text') return g.type === 'text';
    if (filter === 'image') return g.type === 'image';
    if (filter === 'success') return g.status === 'success';
    if (filter === 'error') return g.status === 'error';
    return true;
  });
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  const handleExport = () => {
    const data = exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyforge-generations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleClear = () => {
    if (confirm('确定要清空所有生成历史吗？此操作不可恢复。')) {
      clearHistory();
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };
  
  const getTypeIcon = (type: string) => {
    return type === 'image' ? (
      <ImageIcon className="w-4 h-4 text-purple-500" />
    ) : (
      <Type className="w-4 h-4 text-blue-500" />
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">生成历史 ({generations.length})</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">筛选:</span>
            {(['all', 'text', 'image', 'success', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm ${
                  filter === f
                    ? 'bg-gray-900 text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {f === 'all' && '全部'}
                {f === 'text' && '文本'}
                {f === 'image' && '图像'}
                {f === 'success' && '成功'}
                {f === 'error' && '失败'}
              </button>
            ))}
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              导出
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredGenerations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              暂无生成记录
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-2 font-medium">状态</th>
                  <th className="px-4 py-2 font-medium">类型</th>
                  <th className="px-4 py-2 font-medium">模型</th>
                  <th className="px-4 py-2 font-medium">时间</th>
                  <th className="px-4 py-2 font-medium">耗时</th>
                  <th className="px-4 py-2 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredGenerations.map((gen) => (
                  <tr key={gen.id} className="hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(gen.status)}
                        <span className={
                          gen.status === 'success' ? 'text-green-600' :
                          gen.status === 'error' ? 'text-red-600' :
                          'text-amber-600'
                        }>
                          {gen.status === 'success' ? '成功' :
                           gen.status === 'error' ? '失败' : '进行中'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(gen.type)}
                        <span>{gen.type === 'image' ? '图像' : '文本'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <span className="text-gray-500">{gen.provider}</span>
                        <span className="mx-1">/</span>
                        <span className="font-medium">{gen.model}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatTime(gen.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDuration(gen.duration)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteGeneration(gen.id)}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-sm text-gray-500">
          <span>
            成功: {generations.filter(g => g.status === 'success').length} |
            失败: {generations.filter(g => g.status === 'error').length} |
            总计: {generations.length}
          </span>
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
