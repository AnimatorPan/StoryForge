import type { AIProvider, AIModel } from '../types/ai';

export const TEXT_PROVIDERS: AIProvider[] = [
  {
    id: 'qwen',
    name: '通义千问',
    icon: '🌐',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    keyHint: '在阿里云百炼控制台获取 API Key',
    keyLink: 'https://bailian.console.aliyun.com/',
    models: [
      { value: 'qwen-max', label: 'Qwen-Max · 最强推理' },
      { value: 'qwen-plus', label: 'Qwen-Plus · 均衡速度' },
    ],
    defaultModel: 'qwen-max',
    mode: 'openai',
  },
  {
    id: 'doubao',
    name: '豆包',
    icon: '🫘',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    keyHint: '在火山引擎控制台获取 API Key',
    keyLink: 'https://console.volcengine.com/ark',
    models: [
      { value: 'doubao-seed-2-0-pro-260215', label: 'Doubao-Seed-2.0-Pro' },
    ],
    defaultModel: 'doubao-seed-2-0-pro-260215',
    mode: 'openai',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔍',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    keyHint: '在 platform.deepseek.com 获取 API Key',
    keyLink: 'https://platform.deepseek.com/',
    models: [
      { value: 'deepseek-chat', label: 'DeepSeek-V3.2' },
      { value: 'deepseek-reasoner', label: 'DeepSeek-V3.2 推理模式' },
    ],
    defaultModel: 'deepseek-chat',
    mode: 'openai',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '♊',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    keyHint: '在 Google AI Studio 获取 API Key',
    keyLink: 'https://aistudio.google.com/app/apikey',
    models: [
      { value: 'gemini-2.5-pro-preview-05-06', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.5-flash-preview-05-06', label: 'Gemini 2.5 Flash' },
    ],
    defaultModel: 'gemini-2.5-pro-preview-05-06',
    mode: 'gemini',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyHint: '在 platform.openai.com 获取 API Key',
    keyLink: 'https://platform.openai.com/api-keys',
    models: [
      { value: 'gpt-4.1', label: 'GPT-4.1' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    ],
    defaultModel: 'gpt-4.1',
    mode: 'openai',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    icon: '🌙',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    keyHint: '在 platform.moonshot.cn 获取 API Key',
    keyLink: 'https://platform.moonshot.cn/',
    models: [
      { value: 'moonshot-v1-128k', label: 'Moonshot-128k' },
      { value: 'moonshot-v1-32k', label: 'Moonshot-32k' },
    ],
    defaultModel: 'moonshot-v1-128k',
    mode: 'openai',
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    icon: '🧠',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    keyHint: '在 open.bigmodel.cn 获取 API Key',
    keyLink: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
    models: [
      { value: 'glm-4.7', label: 'GLM-4.7' },
      { value: 'glm-4.5-air', label: 'GLM-4.5-Air' },
    ],
    defaultModel: 'glm-4.7',
    mode: 'openai',
  },
  {
    id: 'custom',
    name: '自定义',
    icon: '🔧',
    endpoint: '',
    keyHint: '填写任何兼容 OpenAI 格式的 API 端点',
    keyLink: '',
    models: [{ value: 'custom', label: '手动输入模型名...' }],
    defaultModel: '',
    mode: 'openai',
  },
];

export const IMAGE_PROVIDERS: AIProvider[] = [
  {
    id: 't8star',
    name: 'T8Star',
    icon: '⭐',
    endpoint: 'https://api.t8star.com/v1/images/generations',
    keyHint: '在 T8Star 控制台获取 API Key',
    keyLink: 'https://t8star.com/',
    models: [
      { value: 't8star-v1', label: 'T8Star V1' },
    ],
    defaultModel: 't8star-v1',
    mode: 'openai',
  },
  {
    id: 'volcano',
    name: '火山引擎',
    icon: '🌋',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
    keyHint: '在火山引擎控制台获取 API Key',
    keyLink: 'https://console.volcengine.com/ark',
    models: [
      { value: 'doubao-image-1.0', label: 'Doubao Image 1.0' },
    ],
    defaultModel: 'doubao-image-1.0',
    mode: 'openai',
  },
  {
    id: 'gemini-image',
    name: 'Gemini',
    icon: '♊',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent',
    keyHint: '在 Google AI Studio 获取 API Key',
    keyLink: 'https://aistudio.google.com/app/apikey',
    models: [
      { value: 'gemini-2.0-flash-exp-image-generation', label: 'Gemini 2.0 Flash' },
    ],
    defaultModel: 'gemini-2.0-flash-exp-image-generation',
    mode: 'gemini',
  },
  {
    id: 'doubao-image',
    name: '豆包',
    icon: '🫘',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
    keyHint: '在火山引擎控制台获取 API Key',
    keyLink: 'https://console.volcengine.com/ark',
    models: [
      { value: 'doubao-image-1.0', label: 'Doubao Image 1.0' },
    ],
    defaultModel: 'doubao-image-1.0',
    mode: 'openai',
  },
];

export const DIRECTOR_STYLES = [
  { id: 'anime', name: '动漫风格', icon: '🎌', description: '日式动漫，色彩鲜明，线条流畅' },
  { id: 'pixar_3d', name: '皮克斯3D', icon: '🎬', description: '高质量3D渲染，圆润可爱' },
  { id: 'watercolor', name: '水彩风格', icon: '🎨', description: '柔和水彩，艺术感强' },
  { id: 'oil_painting', name: '油画风格', icon: '🖼️', description: '古典油画，厚重质感' },
  { id: 'ink_wash', name: '水墨风格', icon: '⛰️', description: '中国传统水墨，意境深远' },
  { id: 'comic', name: '美漫风格', icon: '💥', description: '美式漫画，强烈对比' },
  { id: 'pixel_art', name: '像素风格', icon: '👾', description: '复古像素，游戏感' },
  { id: 'claymation', name: '黏土动画', icon: '🏺', description: '定格动画，手工质感' },
  { id: 'ukiyoe', name: '浮世绘', icon: '🌊', description: '日本浮世绘，平面装饰' },
  { id: 'gongbi', name: '工笔画', icon: '🏮', description: '中国传统工笔，精细描绘' },
  { id: 'paper_cut', name: '剪纸风格', icon: '✂️', description: '中国民间剪纸，红色喜庆' },
  { id: 'donghua_xianxia', name: '仙侠国漫', icon: '⚔️', description: '中国仙侠动画，飘逸唯美' },
  { id: 'noir', name: '黑色电影', icon: '🕵️', description: '经典黑色电影，高对比光影' },
  { id: 'surreal', name: '超现实主义', icon: '🌀', description: '梦境般超现实，奇幻意象' },
  { id: 'french_illus', name: '法式插画', icon: '🥐', description: '法式优雅插画，细腻浪漫' },
];

export const SHOT_TYPES = ['特写', '近景', '中景', '全景', '远景', '大远景', '航拍'];

export const CAMERA_MOVES = [
  '固定机位',
  '推镜头',
  '拉镜头',
  '摇镜头',
  '移镜头',
  '跟镜头',
  '升降镜头',
  '旋转镜头',
  '手持晃动',
  '斯坦尼康',
  '无人机航拍',
];

export const IMAGE_SIZES = [
  { value: '1792x1024', label: '16:9 横屏', description: '电影/视频' },
  { value: '1024x1024', label: '1:1 方形', description: '社交媒体' },
  { value: '1024x1792', label: '9:16 竖屏', description: '短视频/手机' },
];
