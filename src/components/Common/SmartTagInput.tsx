import React, { useState, useRef, useCallback } from 'react';

interface SmartTagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

// 智能标签类型
const SMART_TAGS = [
  { tag: '@人物', label: '人物', description: '插入人物库中的人物', color: 'bg-blue-100 text-blue-700' },
  { tag: '@道具', label: '道具', description: '插入道具库中的道具', color: 'bg-green-100 text-green-700' },
  { tag: '@图片', label: '图片', description: '插入图片链接', color: 'bg-purple-100 text-purple-700' },
  { tag: '@关键帧', label: '关键帧', description: '插入关键帧描述', color: 'bg-orange-100 text-orange-700' },
  { tag: '@场景', label: '场景', description: '插入场景描述', color: 'bg-cyan-100 text-cyan-700' },
  { tag: '@动作', label: '动作', description: '插入动作描述', color: 'bg-red-100 text-red-700' },
  { tag: '@表情', label: '表情', description: '插入表情描述', color: 'bg-pink-100 text-pink-700' },
  { tag: '@服装', label: '服装', description: '插入服装描述', color: 'bg-indigo-100 text-indigo-700' },
];

export function SmartTagInput({
  value,
  onChange,
  placeholder = '支持 @人物 @道具 @图片 @关键帧 等智能标签',
  rows = 3,
  className = '',
  disabled = false,
}: SmartTagInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    
    // 检测是否输入了 @
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // 如果 @ 后面没有空格，显示标签菜单
      if (!textAfterAt.includes(' ') && textAfterAt.length <= 10) {
        setTagSearch(textAfterAt);
        setShowTagMenu(true);
      } else {
        setShowTagMenu(false);
      }
    } else {
      setShowTagMenu(false);
    }
  }, [onChange]);

  const insertTag = useCallback((tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const textBefore = value.slice(0, start);
    const textAfter = value.slice(end);
    
    // 找到最近的 @ 位置
    const lastAtIndex = textBefore.lastIndexOf('@');
    const newText = textBefore.slice(0, lastAtIndex) + tag + ' ' + textAfter;
    
    onChange(newText);
    setShowTagMenu(false);
    
    // 设置光标位置
    setTimeout(() => {
      const newCursorPos = lastAtIndex + tag.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  const filteredTags = SMART_TAGS.filter(t => 
    t.label.includes(tagSearch) || t.tag.includes(tagSearch)
  );

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full px-3 py-2 
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          resize-y min-h-[80px]
          text-sm
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
      />
      
      {/* 标签提示菜单 */}
      {showTagMenu && filteredTags.length > 0 && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            选择智能标签
          </div>
          {filteredTags.map((tag) => (
            <button
              key={tag.tag}
              onClick={() => insertTag(tag.tag)}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
            >
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}>
                {tag.tag}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{tag.label}</div>
                <div className="text-xs text-gray-400">{tag.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* 快捷标签按钮 */}
      <div className="flex flex-wrap gap-1 mt-2">
        {SMART_TAGS.slice(0, 4).map((tag) => (
          <button
            key={tag.tag}
            onClick={() => {
              const textarea = textareaRef.current;
              if (textarea) {
                const start = textarea.selectionStart || 0;
                const textBefore = value.slice(0, start);
                const textAfter = value.slice(start);
                onChange(textBefore + tag.tag + ' ' + textAfter);
              }
            }}
            disabled={disabled}
            className={`
              px-2 py-1 text-xs rounded-full
              ${tag.color}
              hover:opacity-80 transition-opacity
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tag.tag}
          </button>
        ))}
        <span className="text-xs text-gray-400 px-1">输入 @ 查看更多</span>
      </div>
    </div>
  );
}
