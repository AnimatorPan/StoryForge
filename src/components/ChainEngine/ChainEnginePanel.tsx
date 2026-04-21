import React from 'react';
import { useChainEngine } from '../../hooks/useChainEngine';
import { useProjectStore } from '../../stores/projectStore';

interface ChainEnginePanelProps {
  selectedShotIds: string[];
}

export function ChainEnginePanel({ selectedShotIds }: ChainEnginePanelProps) {
  const { state, startChain, pauseChain, resumeChain, cancelChain, resetChain } = useChainEngine();
  const { shots } = useProjectStore();

  const canStart = selectedShotIds.length > 0 && state.status === 'idle';
  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';

  const handleStart = (promptType: 'description' | 'seedance' | 'dialogue') => {
    startChain(selectedShotIds, promptType);
  };

  if (state.status === 'idle' && selectedShotIds.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        <p className="text-sm">请选择要批量生成的分镜</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* 状态栏 */}
      {state.status !== 'idle' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {state.status === 'running' && '🔄 链式生成中...'}
                {state.status === 'paused' && '⏸️ 已暂停'}
                {state.status === 'completed' && '✅ 已完成'}
                {state.status === 'cancelled' && '❌ 已取消'}
              </span>
              <span className="text-xs text-gray-500">
                ({state.currentIndex}/{state.totalCount})
              </span>
            </div>
            <span className="text-xs font-mono text-gray-500">{state.progress}%</span>
          </div>
          
          {/* 进度条 */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                state.status === 'completed' ? 'bg-green-500' :
                state.status === 'cancelled' ? 'bg-red-500' :
                'bg-primary-500'
              }`}
              style={{ width: `${state.progress}%` }}
            />
          </div>

          {/* 当前分镜 */}
          {state.currentShotId && (
            <p className="mt-2 text-xs text-gray-500">
              正在处理: {shots.find(s => s.id === state.currentShotId)?.sequence || '未知'}号分镜
            </p>
          )}

          {/* 控制按钮 */}
          <div className="flex gap-2 mt-3">
            {isRunning && (
              <>
                <button
                  onClick={pauseChain}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
                >
                  ⏸️ 暂停
                </button>
                <button
                  onClick={cancelChain}
                  className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                >
                  ⏹️ 取消
                </button>
              </>
            )}
            {isPaused && (
              <>
                <button
                  onClick={resumeChain}
                  className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                >
                  ▶️ 继续
                </button>
                <button
                  onClick={cancelChain}
                  className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                >
                  ⏹️ 取消
                </button>
              </>
            )}
            {(state.status === 'completed' || state.status === 'cancelled') && (
              <button
                onClick={resetChain}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
              >
                🔄 重置
              </button>
            )}
          </div>

          {/* 结果统计 */}
          {state.results.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex gap-4 text-xs">
                <span className="text-green-600">
                  ✅ 成功: {state.results.filter(r => r.success).length}
                </span>
                <span className="text-red-600">
                  ❌ 失败: {state.results.filter(r => !r.success).length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 启动选项 */}
      {state.status === 'idle' && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            链式引擎 - 批量生成 ({selectedShotIds.length} 个分镜)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStart('description')}
              disabled={!canStart}
              className="px-3 py-2 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎨 生成画面描述
            </button>
            <button
              onClick={() => handleStart('seedance')}
              disabled={!canStart}
              className="px-3 py-2 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎬 生成 SEEDANCE
            </button>
            <button
              onClick={() => handleStart('dialogue')}
              disabled={!canStart}
              className="px-3 py-2 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💬 生成台词
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            将按顺序逐个生成，支持暂停和取消
          </p>
        </div>
      )}
    </div>
  );
}
