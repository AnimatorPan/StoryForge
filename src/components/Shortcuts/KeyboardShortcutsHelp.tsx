import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts,
  onClose,
}) => {
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('Cmd');
    parts.push(shortcut.key === ' ' ? 'Space' : shortcut.key);
    return parts.join(' + ');
  };
  
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    let category = '其他';
    if (shortcut.key === 'n' && shortcut.ctrl) category = '编辑';
    if (shortcut.key === 'd' && shortcut.ctrl) category = '编辑';
    if (shortcut.key === 'Delete') category = '编辑';
    if (shortcut.key === 's' && shortcut.ctrl) category = '文件';
    if (shortcut.key === 'e' && shortcut.ctrl) category = '文件';
    if (shortcut.key === 'i' && shortcut.ctrl) category = '文件';
    if (shortcut.key === 'z') category = '编辑';
    if (shortcut.key === 'a' && shortcut.ctrl) category = '选择';
    if (shortcut.key === 'Escape') category = '选择';
    if (shortcut.key === 'g' && shortcut.ctrl) category = '生成';
    if (shortcut.key === 'f' && shortcut.ctrl) category = '搜索';
    if (shortcut.key === '?') category = '帮助';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);
  
  const categoryOrder = ['文件', '编辑', '选择', '生成', '搜索', '帮助', '其他'];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            键盘快捷键
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh] p-6">
          <div className="space-y-6">
            {categoryOrder.map((category) => {
              const categoryShortcuts = groupedShortcuts[category];
              if (!categoryShortcuts || categoryShortcuts.length === 0) return null;
              
              return (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-gray-700">{shortcut.description}</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-600">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
