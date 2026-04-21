import { useState, useCallback } from 'react';
import type { AIProvider } from '../types/ai';
import type { ImageSize } from '../types/image';

interface ImageGenParams {
  provider: AIProvider;
  apiKey: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  imageSize: ImageSize;
  referenceImages?: string[];
}

interface ImageGenResult {
  url: string;
  prompt: string;
}

interface UseImageGenResult {
  generateImage: (params: ImageGenParams) => Promise<ImageGenResult>;
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

export function useImageGen(): UseImageGenResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (params: ImageGenParams): Promise<ImageGenResult> => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      const { provider, apiKey, model, prompt, negativePrompt, imageSize } = params;
      
      // 基础负面提示词
      const baseNegative = 'no text, no typography, no letters, no words, no subtitles, no watermark, no logo, no captions, no speech bubbles, no chinese characters, no english words';
      const finalNegative = negativePrompt ? `${baseNegative}, ${negativePrompt}` : baseNegative;

      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 500);

      let response;
      
      if (provider.id === 'gemini-image') {
        // Gemini 特殊处理
        response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              responseModalities: ['IMAGE', 'TEXT'],
            }
          }),
        });
      } else {
        // OpenAI 格式
        response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            prompt: `${prompt}\n\nNegative prompt: ${finalNegative}`,
            n: 1,
            size: imageSize,
            response_format: 'url',
          }),
        });
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `生成失败: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = extractImageUrl(data, provider.id);
      
      return { url: imageUrl, prompt };
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, []);

  return { generateImage, isGenerating, progress, error };
}

function extractImageUrl(data: unknown, providerId: string): string {
  if (providerId === 'gemini-image') {
    // Gemini 格式解析
    const candidates = (data as { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string } }> } }> })?.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      const imagePart = candidates[0].content.parts.find((p) => p.inlineData);
      if (imagePart?.inlineData?.data) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
    }
    return '';
  }
  
  // OpenAI 格式
  return (data as { data?: Array<{ url?: string }> })?.data?.[0]?.url || '';
}
