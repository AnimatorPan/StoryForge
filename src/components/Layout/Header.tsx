import * as React from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { useExport } from '../../hooks/useExport';

export function Header() {
  const { shots, currentProjectId, projects, addShot } = useProjectStore();
  const { exportToExcel, exportToTxt } = useExport();
  
  const currentProject = projects[currentProjectId];
  
  const handleExportExcel = () => {
    exportToExcel({ shots, projectName: currentProject?.name || '未命名项目' });
  };
  
  const handleExportTxt = () => {
    exportToTxt({ shots, projectName: currentProject?.name || '未命名项目' });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-xl font-bold text-gray-900">StoryForge</h1>
            <span className="text-sm text-gray-500">叙事熔炉</span>
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>当前项目:</span>
            <span className="font-medium text-gray-900">{currentProject?.name || '默认项目'}</span>
            <span className="text-gray-400">({shots.length} 个分镜)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => addShot()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span>➕</span>
            <span>添加分镜</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>📊</span>
            <span>导出 Excel</span>
          </button>
          
          <button
            onClick={handleExportTxt}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>📝</span>
            <span>导出 TXT</span>
          </button>
        </div>
      </div>
    </header>
  );
}
