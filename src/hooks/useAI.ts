import { useState, useCallback } from 'react';
import type { AIProvider } from '../types/ai';
import { useAIStore } from '../stores/aiStore';

interface GenerateParams {
  provider: AIProvider;
  apiKey: string;
  model: string;
  directorStyle: string;
  shotContext: {
    timeCode?: string;
    shotType?: string;
    cameraMove?: string;
    description?: string;
    lighting?: string;
    drama?: string;
    dialogue?: string;
  };
}

interface UseAIResult {
  generateShotPrompt: (params: GenerateParams) => Promise<string>;
  isGenerating: boolean;
  error: string | null;
}

export function useAI(): UseAIResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShotPrompt = useCallback(async (params: GenerateParams): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { provider, apiKey, model, directorStyle, shotContext } = params;
      
      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(directorStyle),
            },
            {
              role: 'user',
              content: buildUserPrompt(shotContext),
            },
          ],
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 错误: ${response.status}`);
      }

      const data = await response.json();
      return extractContent(data, provider.mode);
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateShotPrompt, isGenerating, error };
}

function buildSystemPrompt(style: string): string {
  const styleDescriptions: Record<string, string> = {
    anime: '日式动漫风格，色彩鲜明，线条流畅，情感表达丰富',
    pixar_3d: '皮克斯3D动画风格，高质量渲染，角色圆润可爱，光影细腻',
    watercolor: '水彩画风格，色彩柔和，笔触自然，艺术感强',
    oil_painting: '古典油画风格，色彩厚重，质感丰富，光影层次强',
    ink_wash: '中国传统水墨风格，黑白灰层次，意境深远，留白讲究',
    comic: '美式漫画风格，线条粗犷，色彩对比强烈，动态感强',
    pixel_art: '复古像素艺术风格，8-bit或16-bit游戏感',
    claymation: '黏土定格动画风格，手工质感，温暖可爱',
    ukiyoe: '日本浮世绘风格，平面装饰，线条流畅，色彩鲜明',
    gongbi: '中国传统工笔风格，精细描绘，色彩艳丽，细节丰富',
    paper_cut: '中国民间剪纸风格，红色喜庆，镂空装饰',
    donghua_xianxia: '中国仙侠动画风格，飘逸唯美，仙气缭绕',
    noir: '经典黑色电影风格，高对比光影，神秘氛围',
    surreal: '超现实主义风格，梦境般奇幻，意象独特',
    french_illus: '法式插画风格，细腻优雅，浪漫唯美',
  };

  return `你是一位专业的分镜导演，擅长${styleDescriptions[style] || '多种'}视觉风格。

请根据提供的场景信息，生成详细的 SEEDANCE 提示词。提示词应包含以下要素：

1. 镜头 (Shot): 景别、角度、运镜方式
2. 环境 (Environment): 场景设置、时代背景、天气
3. 空间 (Space): 空间关系、深度、构图
4. 角色分动 (Character Action): 角色动作、表情、互动
5. 细节 (Details): 服装、道具、纹理、材质
6. 光影 (Lighting): 光源、氛围、色调、时间
7. 音效暗示 (Sound): 环境音、动作音效氛围
8. 戏剧张力 (Drama): 情绪、冲突、节奏

输出格式要求：
- 使用中文描述
- 每个要素用 @标签 标记
- 描述要具体、可执行
- 避免抽象概念，使用具象描述

当前风格：${styleDescriptions[style] || '通用'}`;
}

function buildUserPrompt(context: GenerateParams['shotContext']): string {
  const parts = [];
  
  if (context.timeCode) parts.push(`时间段: ${context.timeCode}`);
  if (context.shotType) parts.push(`景别: ${context.shotType}`);
  if (context.cameraMove) parts.push(`运镜: ${context.cameraMove}`);
  if (context.description) parts.push(`画面描述: ${context.description}`);
  if (context.lighting) parts.push(`光影氛围: ${context.lighting}`);
  if (context.drama) parts.push(`戏剧张力: ${context.drama}`);
  if (context.dialogue) parts.push(`台词: ${context.dialogue}`);

  return parts.join('\n') || '请生成一个通用的分镜描述';
}

function extractContent(data: unknown, mode: string): string {
  if (mode === 'gemini') {
    return (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  
  return (data as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content || '';
}
