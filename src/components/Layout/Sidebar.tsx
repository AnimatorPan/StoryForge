import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useProjectStore } from '../../stores/projectStore';

type TabType = 'shots' | 'ai-settings' | 'image-gen' | 'styles';

interface TabItem {
  id: TabType;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'shots', label: '分镜脚本', icon: '🎬' },
  { id: 'ai-settings', label: 'AI 设置', icon: '⚙️' },
  { id: 'image-gen', label: '图片生成', icon: '🖼️' },
  { id: 'styles', label: '导演风格', icon: '🎨' },
];

export function Sidebar() {
  const { activeTab, setActiveTab, isSidebarOpen, toggleSidebar } = useUIStore();
  const { shots, selectedShotIds } = useProjectStore();

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-white border border-gray-200 rounded-r-lg shadow-lg hover:bg-gray-50"
      >
        <span className="text-lg">▶️</span>
      </button>
    );
  }

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">导航</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <span className="text-lg">◀️</span>
        </button>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {TABS.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 space-y-2">
          <div className="flex justify-between">
            <span>总分镜数:</span>
            <span className="font-medium text-gray-900">{shots.length}</span>
          </div>
          <div className="flex justify-between">
            <span>已选择:</span>
            <span className="font-medium text-primary-600">{selectedShotIds.length}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
