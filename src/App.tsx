import * as React from 'react';
import { useUIStore } from './stores/uiStore';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ShotTable } from './components/ShotTable/ShotTable';
import { AISettingsPanel } from './components/AISettings/AISettingsPanel';
import { ImageGenPanel } from './components/ImageGen/ImageGenPanel';
import { DirectorStyles } from './components/DirectorStyles/DirectorStyles';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

function App() {
  const { activeTab } = useUIStore();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 p-6 overflow-auto">
            {activeTab === 'shots' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">分镜脚本</h2>
                </div>
                <ShotTable />
              </div>
            )}
            
            {activeTab === 'ai-settings' && <AISettingsPanel />}
            {activeTab === 'image-gen' && <ImageGenPanel />}
            {activeTab === 'styles' && <DirectorStyles />}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
