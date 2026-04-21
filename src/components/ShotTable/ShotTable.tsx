import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import type { Shot, ShotColumn } from '../../types/shot';

const COLUMNS: ShotColumn[] = [
  { key: 'sequence', label: '#', width: '50px', editable: false },
  { key: 'timeCode', label: '时间段', width: '100px', editable: true },
  { key: 'shotType', label: '景别', width: '80px', editable: true },
  { key: 'cameraMove', label: '运镜', width: '120px', editable: true },
  { key: 'description', label: '画面描述', width: '200px', editable: true, highlight: true },
  { key: 'lighting', label: '光影氛围', width: '120px', editable: true },
  { key: 'drama', label: '戏剧张力', width: '120px', editable: true },
  { key: 'dialogue', label: '台词', width: '150px', editable: true, highlight: true },
  { key: 'seedancePrompt', label: 'SEEDANCE', width: '300px', editable: true, highlight: true },
];

export function ShotTable() {
  const { shots, selectedShotIds, selectShot, updateShot, deleteShot, duplicateShot } = useProjectStore();
  const [editingCell, setEditingCell] = useState<{ shotId: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellClick = (shotId: string, key: string, value: string) => {
    const column = COLUMNS.find((c) => c.key === key);
    if (!column?.editable) return;
    
    setEditingCell({ shotId, key });
    setEditValue(value || '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    
    updateShot(editingCell.shotId, { [editingCell.key]: editValue });
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const highlightTags = (text: string) => {
    if (!text) return text;
    
    const tags: Record<string, string> = {
      '@镜头': 'bg-tag-shot',
      '@环境': 'bg-tag-env',
      '@空间': 'bg-tag-space',
      '@角色': 'bg-tag-character',
      '@细节': 'bg-tag-detail',
      '@光影': 'bg-tag-lighting',
      '@音效': 'bg-tag-sound',
      '@戏剧': 'bg-tag-drama',
      '@台词': 'bg-tag-dialogue',
      '@收尾': 'bg-tag-ending',
    };
    
    return text;
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="p-3 w-10 border-b border-gray-200">
              <input
                type="checkbox"
                checked={selectedShotIds.length === shots.length && shots.length > 0}
                onChange={(e) => selectShot(e.target.checked ? 'all' : 'none')}
                className="rounded border-gray-300"
              />
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="p-3 text-left font-medium text-gray-700 whitespace-nowrap border-b border-gray-200"
                style={{ width: col.width, minWidth: col.width }}
              >
                {col.label}
              </th>
            ))}
            <th className="p-3 w-24 border-b border-gray-200">操作</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {shots.map((shot) => (
            <tr
              key={shot.id}
              className={`hover:bg-gray-50 ${selectedShotIds.includes(shot.id) ? 'bg-primary-50' : ''}`}
            >
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selectedShotIds.includes(shot.id)}
                  onChange={() => selectShot(shot.id, true)}
                  className="rounded border-gray-300"
                />
              </td>
              
              {COLUMNS.map((col) => {
                const isEditing = editingCell?.shotId === shot.id && editingCell?.key === col.key;
                const value = shot[col.key] as string;
                
                return (
                  <td
                    key={col.key}
                    className={`p-2 border-r border-gray-100 ${col.highlight ? 'bg-gray-50/50' : ''}`}
                    style={{ width: col.width, minWidth: col.width }}
                    onClick={() => handleCellClick(shot.id, col.key, value)}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellSave}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-200"
                        autoFocus
                      />
                    ) : (
                      <div
                        className={`min-h-[1.5rem] px-2 py-1 rounded cursor-pointer hover:bg-white hover:shadow-sm transition-all ${
                          col.highlight ? 'font-medium' : ''
                        }`}
                        title={value || '点击编辑'}
                      >
                        {col.key === 'sequence' ? (
                          <span className="font-mono text-gray-500">{shot.sequence}</span>
                        ) : (
                          <span className="text-gray-700 line-clamp-2">
                            {highlightTags(value)}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
              
              <td className="p-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicateShot(shot.id)}
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                    title="复制"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteShot(shot.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {shots.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-lg font-medium mb-2">暂无分镜</p>
          <p className="text-sm">点击"添加分镜"开始创作您的故事</p>
        </div>
      )}
    </div>
  );
}
