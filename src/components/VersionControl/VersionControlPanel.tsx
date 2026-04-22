import React, { useState } from 'react';
import { GitBranch, GitMerge, RotateCcw, Plus, Trash2, Download, Upload, X, ChevronRight, ChevronDown } from 'lucide-react';
import { useVersionControlStore, VersionSnapshot } from '../../stores/versionControlStore';
import { useProjectStore } from '../../stores/projectStore';

interface VersionControlPanelProps {
  onClose: () => void;
}

export const VersionControlPanel: React.FC<VersionControlPanelProps> = ({
  onClose,
}) => {
  const {
    getProjectVersions,
    createVersion,
    restoreVersion,
    deleteVersion,
    compareWithCurrent,
    createBranch,
    exportVersions,
    importVersions,
  } = useVersionControlStore();
  const { currentProjectId, shots } = useProjectStore();
  
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);
  
  const versions = getProjectVersions(currentProjectId);
  
  const handleCreateVersion = () => {
    if (newVersionName.trim()) {
      createVersion(currentProjectId, newVersionName.trim(), newVersionDesc.trim());
      setNewVersionName('');
      setNewVersionDesc('');
      setShowCreateForm(false);
    }
  };
  
  const handleRestore = (versionId: string) => {
    if (confirm('确定要恢复到这个版本吗？当前未保存的更改将丢失。')) {
      restoreVersion(currentProjectId, versionId);
    }
  };
  
  const handleExport = () => {
    const data = exportVersions(currentProjectId);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyforge-versions-${currentProjectId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    if (importData.trim()) {
      const success = importVersions(currentProjectId, importData.trim());
      if (success) {
        setImportData('');
        setShowImport(false);
        alert('版本历史导入成功');
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
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            版本控制 ({versions.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
              title="导出版本"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
              title="导入版本"
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
              placeholder="粘贴版本历史 JSON..."
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
        
        <div className="p-4 border-b bg-gray-50">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded"
            >
              <Plus className="w-4 h-4" />
              创建新版本
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="版本名称 (例如: v1.0 初稿)"
                className="w-full p-2 border rounded"
              />
              <textarea
                value={newVersionDesc}
                onChange={(e) => setNewVersionDesc(e.target.value)}
                placeholder="版本描述 (可选)"
                className="w-full p-2 border rounded text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateVersion}
                  disabled={!newVersionName.trim()}
                  className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {versions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无版本历史</p>
              <p className="text-sm mt-1">创建第一个版本</p>
            </div>
          ) : (
            <div className="divide-y">
              {versions.slice().reverse().map((version) => (
                <div key={version.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{version.name}</span>
                        {version.tags?.includes('branch') && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            分支
                          </span>
                        )}
                        {version.tags?.includes('merge') && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                            合并
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{version.description}</p>
                      <div className="text-xs text-gray-400">
                        <span>{formatTime(version.timestamp)}</span>
                        <span className="mx-2">•</span>
                        <span>{version.shots.length} 个镜头</span>
                        <span className="mx-2">•</span>
                        <span>{version.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRestore(version.id)}
                        className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                        title="恢复此版本"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVersion(currentProjectId, version.id)}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
