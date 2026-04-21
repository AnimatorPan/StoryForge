import { useCallback, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';

interface ChainEngineState {
  isRunning: boolean;
  currentIndex: number;
  totalCount: number;
  currentShotId: string | null;
  progress: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';
  results: Array<{
    shotId: string;
    success: boolean;
    prompt?: string;
    error?: string;
  }>;
}

interface UseChainEngineReturn {
  state: ChainEngineState;
  startChain: (shotIds: string[], promptType: 'description' | 'seedance' | 'dialogue') => Promise<void>;
  pauseChain: () => void;
  resumeChain: () => void;
  cancelChain: () => void;
  resetChain: () => void;
}

export function useChainEngine(): UseChainEngineReturn {
  const { shots, updateShot } = useProjectStore();
  const getState = useProjectStore.getState;
  
  const [state, setState] = useState<ChainEngineState>({
    isRunning: false,
    currentIndex: 0,
    totalCount: 0,
    currentShotId: null,
    progress: 0,
    status: 'idle',
    results: [],
  });

  const resetChain = useCallback(() => {
    setState({
      isRunning: false,
      currentIndex: 0,
      totalCount: 0,
      currentShotId: null,
      progress: 0,
      status: 'idle',
      results: [],
    });
  }, []);

  const startChain = useCallback(async (
    shotIds: string[],
    promptType: 'description' | 'seedance' | 'dialogue'
  ) => {
    if (shotIds.length === 0) return;
    
    // 模拟链式生成
    setState({
      isRunning: true,
      currentIndex: 0,
      totalCount: shotIds.length,
      currentShotId: shotIds[0],
      progress: 0,
      status: 'running',
      results: [],
    });

    const results: ChainEngineState['results'] = [];

    for (let i = 0; i < shotIds.length; i++) {
      // 检查是否被取消
      if (state.status === 'cancelled') {
        break;
      }

      // 检查是否暂停
      while (true) {
        // 使用闭包获取最新状态
        let shouldBreak = false;
        setState(prev => {
          if (prev.status === 'cancelled') shouldBreak = true;
          if (prev.status !== 'paused') shouldBreak = true;
          return prev;
        });
        if (shouldBreak) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const shotId = shotIds[i];
      const shot = shots.find(s => s.id === shotId);
      
      if (!shot) continue;

      setState(prev => ({
        ...prev,
        currentIndex: i,
        currentShotId: shotId,
        progress: Math.round((i / shotIds.length) * 100),
      }));

      try {
        // 模拟生成延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟生成结果
        const mockResult = `[模拟生成] ${promptType} for shot ${shot.sequence}`;
        
        // 更新分镜
        const updateField = promptType === 'description' ? 'description' :
                           promptType === 'seedance' ? 'seedancePrompt' : 'dialogue';
        updateShot(shotId, { [updateField]: mockResult });
        
        results.push({
          shotId,
          success: true,
          prompt: mockResult,
        });

        // 添加延迟避免请求过快
        if (i < shotIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        results.push({
          shotId,
          success: false,
          error: error instanceof Error ? error.message : '生成失败',
        });
      }
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      currentIndex: shotIds.length,
      currentShotId: null,
      progress: 100,
      status: state.status === 'cancelled' ? 'cancelled' : 'completed',
      results,
    }));
  }, [shots, updateShot, state.status]);

  const pauseChain = useCallback(() => {
    setState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeChain = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }));
  }, []);

  const cancelChain = useCallback(() => {
    setState(prev => ({ ...prev, status: 'cancelled' }));
  }, []);

  return {
    state,
    startChain,
    pauseChain,
    resumeChain,
    cancelChain,
    resetChain,
  };
}

// 构建链式提示词
function buildChainPrompt(
  shot: any,
  promptType: 'description' | 'seedance' | 'dialogue',
  index: number,
  total: number
): string {
  const baseInfo = `分镜 ${index + 1}/${total}:\n` +
    `时间段: ${shot.timeCode || '未设定'}\n` +
    `景别: ${shot.shotType || '未设定'}\n` +
    `运镜: ${shot.cameraMove || '未设定'}\n`;

  switch (promptType) {
    case 'description':
      return `请根据以下分镜信息生成画面描述:\n${baseInfo}\n` +
        `要求: 详细描述画面内容、构图、色彩、氛围，适合用于 AI 图像生成。`;
    
    case 'seedance':
      return `请根据以下分镜信息生成 SEEDANCE 提示词:\n${baseInfo}\n` +
        `画面描述: ${shot.description || '无'}\n` +
        `要求: 生成适合 SEEDANCE 视频生成的英文提示词，包含主体、动作、场景、风格、光影等要素。`;
    
    case 'dialogue':
      return `请根据以下分镜信息生成台词:\n${baseInfo}\n` +
        `画面描述: ${shot.description || '无'}\n` +
        `要求: 生成符合场景氛围的角色台词，简洁有力，适合配音。`;
    
    default:
      return baseInfo;
  }
}
