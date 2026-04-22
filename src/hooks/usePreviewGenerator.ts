import { useState, useCallback } from 'react';
import { useAIStore } from '../stores/aiStore';
import { useHistoryStore } from '../stores/historyStore';

export interface PreviewImage {
  id: string;
  shotId: string;
  url: string;
  prompt: string;
  provider: string;
  model: string;
  status: 'generating' | 'completed' | 'error';
  errorMessage?: string;
  createdAt: number;
}

interface UsePreviewGeneratorReturn {
  generatePreview: (shotId: string, prompt: string) => Promise<PreviewImage | null>;
  generateBatchPreviews: (shots: { id: string; prompt: string }[]) => Promise<PreviewImage[]>;
  isGenerating: boolean;
  currentShotId: string | null;
  progress: number;
  abortGeneration: () => void;
}

export const usePreviewGenerator = (): UsePreviewGeneratorReturn => {
  const { imageConfig } = useAIStore();
  const { addGeneration, updateGeneration } = useHistoryStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentShotId, setCurrentShotId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  const generatePreview = useCallback(async (
    shotId: string,
    prompt: string
  ): Promise<PreviewImage | null> => {
    if (!imageConfig.apiKey) {
      throw new Error('请先配置图像生成 API 密钥');
    }
    
    setIsGenerating(true);
    setCurrentShotId(shotId);
    
    const generationId = addGeneration({
      shotId,
      type: 'image',
      prompt,
      provider: imageConfig.providerId,
      model: imageConfig.model,
      status: 'pending',
    });
    
    const startTime = Date.now();
    abortControllerRef.current = new AbortController();
    
    try {
      // Simulate API call - replace with actual implementation
      const previewImage: PreviewImage = {
        id: `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shotId,
        url: '', // Would be populated by actual API
        prompt,
        provider: imageConfig.providerId,
        model: imageConfig.model,
        status: 'generating',
        createdAt: Date.now(),
      };
      
      // Mock generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the image generation API
      // const response = await fetch('/api/generate-image', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt, provider: imageConfig.providerId, model: imageConfig.model }),
      //   signal: abortControllerRef.current.signal,
      // });
      
      previewImage.status = 'completed';
      previewImage.url = `https://picsum.photos/400/300?random=${previewImage.id}`;
      
      updateGeneration(generationId, {
        status: 'success',
        duration: Date.now() - startTime,
      });
      
      return previewImage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      
      updateGeneration(generationId, {
        status: 'error',
        errorMessage,
        duration: Date.now() - startTime,
      });
      
      return {
        id: `preview_${Date.now()}`,
        shotId,
        url: '',
        prompt,
        provider: imageConfig.providerId,
        model: imageConfig.model,
        status: 'error',
        errorMessage,
        createdAt: Date.now(),
      };
    } finally {
      setIsGenerating(false);
      setCurrentShotId(null);
      abortControllerRef.current = null;
    }
  }, [imageConfig, addGeneration, updateGeneration]);
  
  const generateBatchPreviews = useCallback(async (
    shots: { id: string; prompt: string }[]
  ): Promise<PreviewImage[]> => {
    const results: PreviewImage[] = [];
    setProgress(0);
    
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      setProgress(Math.round((i / shots.length) * 100));
      
      try {
        const result = await generatePreview(shot.id, shot.prompt);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Failed to generate preview for shot ${shot.id}:`, error);
      }
    }
    
    setProgress(100);
    return results;
  }, [generatePreview]);
  
  const abortGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setCurrentShotId(null);
  }, []);
  
  return {
    generatePreview,
    generateBatchPreviews,
    isGenerating,
    currentShotId,
    progress,
    abortGeneration,
  };
};

// Need to import React for useRef
import React from 'react';
