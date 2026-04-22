import { useState, useEffect, useCallback } from 'react';
import { usePluginStore, Plugin, PluginManifest } from '../stores/pluginStore';

interface UsePluginManagerReturn {
  plugins: Plugin[];
  activePlugin: Plugin | null;
  registryUrl: string;
  sandboxMode: boolean;
  isInstalling: boolean;
  installError: string | null;
  installPlugin: (manifest: PluginManifest, code: string) => Promise<void>;
  uninstallPlugin: (id: string) => void;
  enablePlugin: (id: string) => void;
  disablePlugin: (id: string) => void;
  setActivePlugin: (id: string | null) => void;
  setRegistryUrl: (url: string) => void;
  toggleSandboxMode: () => void;
  searchRegistry: (query: string) => Promise<PluginManifest[]>;
  fetchPluginCode: (id: string) => Promise<string>;
}

const MOCK_REGISTRY: PluginManifest[] = [
  {
    id: 'storyforge-ai-enhancer',
    name: 'AI Prompt Enhancer',
    version: '1.0.0',
    description: '使用 GPT-4 自动优化提示词质量',
    author: 'StoryForge Team',
    entry: 'main.js',
    permissions: ['read:shots', 'ai:generate', 'ui:panel'],
    icon: 'wand-2',
    tags: ['AI', 'productivity'],
  },
  {
    id: 'storyforge-batch-exporter',
    name: 'Batch Exporter Pro',
    version: '2.1.0',
    description: '批量导出多种格式（PDF, Word, Final Draft）',
    author: 'Studio Tools',
    entry: 'index.js',
    permissions: ['read:shots', 'read:projects', 'export:file', 'ui:toolbar'],
    icon: 'download',
    tags: ['export', 'productivity'],
  },
  {
    id: 'storyforge-character-db',
    name: 'Character Database',
    version: '1.2.0',
    description: '管理角色库并与镜头自动关联',
    author: 'Narrative Tools',
    entry: 'character-db.js',
    permissions: ['read:shots', 'write:shots', 'ui:panel'],
    icon: 'users',
    tags: ['characters', 'database'],
  },
  {
    id: 'storyforge-story-analyzer',
    name: 'Story Structure Analyzer',
    version: '1.0.5',
    description: '分析剧本结构，检测情节漏洞',
    author: 'Script Doctor',
    entry: 'analyzer.js',
    permissions: ['read:shots', 'read:projects', 'ui:panel'],
    icon: 'search',
    tags: ['analysis', 'story'],
  },
  {
    id: 'storyforge-voice-input',
    name: 'Voice Input',
    version: '0.9.0',
    description: '语音输入转提示词',
    author: 'Accessibility First',
    entry: 'voice.js',
    permissions: ['write:shots', 'ui:toolbar'],
    icon: 'mic',
    tags: ['accessibility', 'input'],
  },
];

export function usePluginManager(): UsePluginManagerReturn {
  const store = usePluginStore();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  const activePlugin = store.activePluginId
    ? store.plugins.find(p => p.id === store.activePluginId)
    : null;

  const installPlugin = useCallback(async (manifest: PluginManifest, code: string) => {
    setIsInstalling(true);
    setInstallError(null);
    try {
      await store.installPlugin(manifest, code);
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : '安装失败');
      throw error;
    } finally {
      setIsInstalling(false);
    }
  }, [store]);

  const searchRegistry = useCallback(async (query: string): Promise<PluginManifest[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const lowerQuery = query.toLowerCase();
    return MOCK_REGISTRY.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, []);

  const fetchPluginCode = useCallback(async (id: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return `
      // Plugin: ${id}
      // Auto-generated code
      function beforeGenerate(context, plugin) {
        console.log('Plugin ${id} hook executed');
        return context;
      }
      
      function afterGenerate(context, plugin) {
        return context;
      }
    `;
  }, []);

  return {
    plugins: store.plugins,
    activePlugin,
    registryUrl: store.registryUrl,
    sandboxMode: store.sandboxMode,
    isInstalling,
    installError,
    installPlugin,
    uninstallPlugin: store.uninstallPlugin,
    enablePlugin: store.enablePlugin,
    disablePlugin: store.disablePlugin,
    setActivePlugin: store.setActivePlugin,
    setRegistryUrl: store.setRegistryUrl,
    toggleSandboxMode: store.toggleSandboxMode,
    searchRegistry,
    fetchPluginCode,
  };
}
