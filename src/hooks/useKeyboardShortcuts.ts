import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  target?: HTMLElement | Window | null;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
  target = window,
}: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef(shortcuts);
  
  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    const targetElement = event.target as HTMLElement;
    if (
      targetElement.tagName === 'INPUT' ||
      targetElement.tagName === 'TEXTAREA' ||
      targetElement.isContentEditable
    ) {
      // Allow Escape even in input fields
      if (event.key !== 'Escape') return;
    }
    
    for (const shortcut of shortcutsRef.current) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      const altMatch = !!shortcut.alt === event.altKey;
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [enabled]);
  
  useEffect(() => {
    if (!target) return;
    
    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [target, handleKeyDown]);
};

// Common shortcuts preset
export const createCommonShortcuts = (actions: {
  onNewShot?: () => void;
  onDuplicateShot?: () => void;
  onDeleteShot?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onGenerate?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'n',
    ctrl: true,
    description: '新建镜头',
    action: actions.onNewShot || (() => {}),
  },
  {
    key: 'd',
    ctrl: true,
    description: '复制镜头',
    action: actions.onDuplicateShot || (() => {}),
  },
  {
    key: 'Delete',
    description: '删除选中镜头',
    action: actions.onDeleteShot || (() => {}),
  },
  {
    key: 's',
    ctrl: true,
    description: '保存',
    action: actions.onSave || (() => {}),
    preventDefault: true,
  },
  {
    key: 'z',
    ctrl: true,
    description: '撤销',
    action: actions.onUndo || (() => {}),
  },
  {
    key: 'z',
    ctrl: true,
    shift: true,
    description: '重做',
    action: actions.onRedo || (() => {}),
  },
  {
    key: 'a',
    ctrl: true,
    description: '全选',
    action: actions.onSelectAll || (() => {}),
  },
  {
    key: 'Escape',
    description: '取消选择',
    action: actions.onDeselectAll || (() => {}),
  },
  {
    key: 'g',
    ctrl: true,
    description: '生成提示词',
    action: actions.onGenerate || (() => {}),
  },
  {
    key: 'e',
    ctrl: true,
    description: '导出',
    action: actions.onExport || (() => {}),
  },
  {
    key: 'i',
    ctrl: true,
    description: '导入',
    action: actions.onImport || (() => {}),
  },
  {
    key: 'f',
    ctrl: true,
    description: '搜索',
    action: actions.onSearch || (() => {}),
  },
  {
    key: '?',
    description: '显示快捷键帮助',
    action: actions.onHelp || (() => {}),
  },
];
