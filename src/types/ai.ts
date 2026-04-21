export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  keyHint: string;
  keyLink: string;
  models: AIModel[];
  defaultModel: string;
  mode: 'openai' | 'gemini' | 'anthropic';
}

export interface AIModel {
  value: string;
  label: string;
}

export interface AIConfig {
  providerId: string;
  apiKey: string;
  model: string;
}
