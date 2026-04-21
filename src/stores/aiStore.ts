import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIConfig } from '../types/ai';
import { TEXT_PROVIDERS, IMAGE_PROVIDERS } from '../constants';

interface AIState {
  textConfig: AIConfig;
  imageConfig: AIConfig;
  customEndpoint: string;
  customModel: string;
  
  setTextProvider: (providerId: string) => void;
  setTextApiKey: (apiKey: string) => void;
  setTextModel: (model: string) => void;
  setImageProvider: (providerId: string) => void;
  setImageApiKey: (apiKey: string) => void;
  setImageModel: (model: string) => void;
  setCustomEndpoint: (endpoint: string) => void;
  setCustomModel: (model: string) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      textConfig: {
        providerId: 'qwen',
        apiKey: '',
        model: 'qwen-max',
      },
      imageConfig: {
        providerId: 't8star',
        apiKey: '',
        model: 't8star-v1',
      },
      customEndpoint: '',
      customModel: '',
      
      setTextProvider: (providerId) => {
        const provider = TEXT_PROVIDERS.find((p) => p.id === providerId);
        if (provider) {
          set({
            textConfig: {
              ...get().textConfig,
              providerId,
              model: provider.defaultModel,
            },
          });
        }
      },
      
      setTextApiKey: (apiKey) => {
        set({ textConfig: { ...get().textConfig, apiKey } });
      },
      
      setTextModel: (model) => {
        set({ textConfig: { ...get().textConfig, model } });
      },
      
      setImageProvider: (providerId) => {
        const provider = IMAGE_PROVIDERS.find((p) => p.id === providerId);
        if (provider) {
          set({
            imageConfig: {
              ...get().imageConfig,
              providerId,
              model: provider.defaultModel,
            },
          });
        }
      },
      
      setImageApiKey: (apiKey) => {
        set({ imageConfig: { ...get().imageConfig, apiKey } });
      },
      
      setImageModel: (model) => {
        set({ imageConfig: { ...get().imageConfig, model } });
      },
      
      setCustomEndpoint: (endpoint) => {
        set({ customEndpoint: endpoint });
      },
      
      setCustomModel: (model) => {
        set({ customModel: model });
      },
    }),
    {
      name: 'soullens-ai-config',
    }
  )
);
