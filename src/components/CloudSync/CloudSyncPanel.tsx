import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Settings, CheckCircle, XCircle, AlertCircle, X, Clock, Download, Upload } from 'lucide-react';
import { useCloudSyncStore, SyncStatus } from '../../stores/cloudSyncStore';

interface CloudSyncPanelProps {
  onClose: () => void;
}

export const CloudSyncPanel: React.FC<CloudSyncPanelProps> = ({
  onClose,
}) => {
  const {
    status,
    lastSyncTime,
    autoSync,
    syncInterval,
    cloudProvider,
    apiEndpoint,
    apiKey,
    projectId,
    conflicts,
    logs,
    setAutoSync,
    setSyncInterval,
    setCloudProvider,
    setApiEndpoint,
    setApiKey,
    setProjectId,
    sync,
    getUnresolvedConflicts,
    clearLogs,
    getRecentLogs,
  } = useCloudSyncStore();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'settings' | 'logs'>('status');
  const unresolvedConflicts = getUnresolvedConflicts();
  const recentLogs = getRecentLogs(20);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoSync && status !== 'offline') {
      interval = setInterval(() => {
        sync();
      }, syncInterval * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [autoSync, syncInterval, status]);
  
  const handleSync = async () => {
    setIsSyncing(true);
    await sync();
    setIsSyncing(false);
  };
  
  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'offline':
        return <CloudOff className="w-5 h-5 text-gray-400" />;
      default:
        return <Cloud className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getStatusText = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return '已同步';
      case 'syncing':
        return '同步中...';
      case 'error':
        return '同步失败';
      case 'offline':
        return '离线模式';
      default:
        return '未同步';
    }
  };
  
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '从未';
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatLogTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            云端同步
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b">
          {(['status', 'settings', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'status' && '状态'}
              {tab === 'settings' && '设置'}
              {tab === 'logs' && '日志'}
            </button>
          ))}
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {getStatusIcon(status)}
                <div className="flex-1">
                  <p className="font-medium">{getStatusText(status)}</p>
                  <p className="text-sm text-gray-500">
                    上次同步: {formatTime(lastSyncTime)}
                  </p>
                </div>
                <button
                  onClick={handleSync}
                  disabled={isSyncing || status === 'offline'}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  立即同步
                </button>
              </div>
              
              {unresolvedConflicts.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <p className="font-medium text-amber-800">
                      有 {unresolvedConflicts.length} 个冲突需要解决
                    </p>
                  </div>
                  <p className="text-sm text-amber-700">
                    数据在本地和云端之间存在差异，请检查并解决冲突。
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">同步统计</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <p className="text-2xl font-semibold">{logs.filter(l => l.status === 'success').length}</p>
                    <p className="text-sm text-gray-500">成功</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <p className="text-2xl font-semibold">{logs.filter(l => l.status === 'error').length}</p>
                    <p className="text-sm text-gray-500">失败</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <p className="text-2xl font-semibold">{unresolvedConflicts.length}</p>
                    <p className="text-sm text-gray-500">冲突</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  云存储提供商
                </label>
                <select
                  value={cloudProvider}
                  onChange={(e) => setCloudProvider(e.target.value as typeof cloudProvider)}
                  className="w-full p-2 border rounded"
                >
                  <option value="local">本地存储（无云端同步）</option>
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="custom">自定义服务器</option>
                </select>
              </div>
              
              {cloudProvider !== 'local' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API 端点
                    </label>
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="https://api.example.com"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API 密钥
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="your-api-key"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目 ID
                    </label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="project-123"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">自动同步</p>
                  <p className="text-sm text-gray-500">定期自动同步数据</p>
                </div>
                <button
                  onClick={() => setAutoSync(!autoSync)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoSync ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoSync ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {autoSync && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    同步间隔（分钟）
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(parseInt(e.target.value) || 5)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">同步日志</h4>
                <button
                  onClick={clearLogs}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  清空日志
                </button>
              </div>
              
              {recentLogs.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无日志</p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded text-sm ${
                        log.status === 'success'
                          ? 'bg-green-50 text-green-800'
                          : log.status === 'error'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">{formatLogTime(log.timestamp)}</span>
                        <span className="font-medium capitalize">{log.operation}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          log.status === 'success'
                            ? 'bg-green-200'
                            : log.status === 'error'
                            ? 'bg-red-200'
                            : 'bg-amber-200'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="mt-1 opacity-80">{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
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
