import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string;
  permissions: PluginPermission[];
  hooks: PluginHook[];
  config?: Record<string, unknown>;
  enabled: boolean;
  installedAt: number;
  updatedAt: number;
  icon?: string;
  tags: string[];
  rating: number;
  downloads: number;
}

export type PluginPermission = 
  | 'read:shots'
  | 'write:shots'
  | 'read:projects'
  | 'write:projects'
  | 'read:settings'
  | 'write:settings'
  | 'ui:panel'
  | 'ui:toolbar'
  | 'ai:generate'
  | 'export:file'
  | 'import:file';

export interface PluginHook {
  type: 'beforeGenerate' | 'afterGenerate' | 'onExport' | 'onImport' | 'onShotChange';
  handler: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  permissions: PluginPermission[];
  hooks?: PluginHook[];
  icon?: string;
  tags?: string[];
}

interface PluginState {
  plugins: Plugin[];
  activePluginId: string | null;
  registryUrl: string;
  sandboxMode: boolean;
}

interface PluginActions {
  installPlugin: (manifest: PluginManifest, code: string) => Promise<void>;
  uninstallPlugin: (id: string) => void;
  enablePlugin: (id: string) => void;
  disablePlugin: (id: string) => void;
  updatePlugin: (id: string, manifest: PluginManifest, code: string) => Promise<void>;
  setActivePlugin: (id: string | null) => void;
  executeHook: (type: PluginHook['type'], context: unknown) => Promise<unknown>;
  setRegistryUrl: (url: string) => void;
  toggleSandboxMode: () => void;
  getPluginConfig: (id: string) => Record<string, unknown> | undefined;
  setPluginConfig: (id: string, config: Record<string, unknown>) => void;
}

const validatePluginCode = (code: string): boolean => {
  const forbiddenPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /document\.write/,
    /window\.location\s*=/,
    /<script/i,
  ];
  return !forbiddenPatterns.some(pattern => pattern.test(code));
};

export const usePluginStore = create<PluginState & PluginActions>()(
  persist(
    (set, get) => ({
      plugins: [],
      activePluginId: null,
      registryUrl: 'https://registry.storyforge.dev',
      sandboxMode: true,

      installPlugin: async (manifest, code) => {
        if (get().sandboxMode && !validatePluginCode(code)) {
          throw new Error('Plugin code contains forbidden patterns');
        }

        const existing = get().plugins.find(p => p.id === manifest.id);
        if (existing) {
          throw new Error(`Plugin ${manifest.id} already installed`);
        }

        const plugin: Plugin = {
          ...manifest,
          entryPoint: manifest.entry,
          hooks: manifest.hooks || [],
          tags: manifest.tags || [],
          enabled: false,
          installedAt: Date.now(),
          updatedAt: Date.now(),
          rating: 0,
          downloads: 0,
        };

        set(state => ({ plugins: [...state.plugins, plugin] }));

        localStorage.setItem(`plugin:code:${manifest.id}`, code);
      },

      uninstallPlugin: (id) => {
        set(state => ({
          plugins: state.plugins.filter(p => p.id !== id),
          activePluginId: state.activePluginId === id ? null : state.activePluginId,
        }));
        localStorage.removeItem(`plugin:code:${id}`);
        localStorage.removeItem(`plugin:config:${id}`);
      },

      enablePlugin: (id) => {
        set(state => ({
          plugins: state.plugins.map(p =>
            p.id === id ? { ...p, enabled: true } : p
          ),
        }));
      },

      disablePlugin: (id) => {
        set(state => ({
          plugins: state.plugins.map(p =>
            p.id === id ? { ...p, enabled: false } : p
          ),
          activePluginId: state.activePluginId === id ? null : state.activePluginId,
        }));
      },

      updatePlugin: async (id, manifest, code) => {
        if (get().sandboxMode && !validatePluginCode(code)) {
          throw new Error('Plugin code contains forbidden patterns');
        }

        set(state => ({
          plugins: state.plugins.map(p =>
            p.id === id
              ? {
                  ...p,
                  ...manifest,
                  entryPoint: manifest.entry,
                  hooks: manifest.hooks || p.hooks,
                  tags: manifest.tags || p.tags,
                  updatedAt: Date.now(),
                }
              : p
          ),
        }));

        localStorage.setItem(`plugin:code:${id}`, code);
      },

      setActivePlugin: (id) => {
        set({ activePluginId: id });
      },

      executeHook: async (type, context) => {
        const enabledPlugins = get().plugins.filter(p => p.enabled);
        let result = context;

        for (const plugin of enabledPlugins) {
          const hook = plugin.hooks.find(h => h.type === type);
          if (hook) {
            const code = localStorage.getItem(`plugin:code:${plugin.id}`);
            if (code) {
              try {
                const sandbox = new Function('context', 'plugin', `
                  ${code}
                  return typeof ${hook.handler} !== 'undefined' ? ${hook.handler}(context, plugin) : context;
                `);
                result = await sandbox(result, plugin) ?? result;
              } catch (error) {
                console.error(`Plugin hook error in ${plugin.id}:`, error);
              }
            }
          }
        }

        return result;
      },

      setRegistryUrl: (url) => {
        set({ registryUrl: url });
      },

      toggleSandboxMode: () => {
        set(state => ({ sandboxMode: !state.sandboxMode }));
      },

      getPluginConfig: (id) => {
        const config = localStorage.getItem(`plugin:config:${id}`);
        return config ? JSON.parse(config) : undefined;
      },

      setPluginConfig: (id, config) => {
        localStorage.setItem(`plugin:config:${id}`, JSON.stringify(config));
        set(state => ({
          plugins: state.plugins.map(p =>
            p.id === id ? { ...p, config } : p
          ),
        }));
      },
    }),
    {
      name: 'storyforge-plugins',
      partialize: (state) => ({
        plugins: state.plugins.map(p => ({ ...p, config: undefined })),
        activePluginId: state.activePluginId,
        registryUrl: state.registryUrl,
        sandboxMode: state.sandboxMode,
      }),
    }
  )
);
