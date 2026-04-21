export interface ImageGenConfig {
  providerId: string;
  apiKey: string;
  model: string;
  imageSize: string;
  negativePrompt?: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  provider: string;
  model: string;
  createdAt: number;
}

export type ImageSize = '1792x1024' | '1024x1024' | '1024x1792';
