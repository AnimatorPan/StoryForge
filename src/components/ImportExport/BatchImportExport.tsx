import React, { useState, useRef } from 'react';
import { Upload, Download, FileJson, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useBatchImportExport, ImportResult } from '../../hooks/useBatchImportExport';

interface BatchImportExportProps {
  onClose: () => void;
}

export const BatchImportExport: React.FC<BatchImportExportProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    importFromFile,
    importFromJSON,
    exportToFile,
    isProcessing,
    progress,
  } = useBatchImportExport();
  
  const [exportOptions, setExportOptions] = useState({
    format: 'json' as 'json' | 'csv' | 'excel',
    selectedOnly: false,
  });
  
  const handleFileSelect = async (file: File) => {
    const result = await importFromFile(file);
    setImportResult(result);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleExport = async () => {
    await exportToFile({
      format: exportOptions.format,
      selectedOnly: exportOptions.selectedOnly,
      includeImages: false,
    });
  };
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const result = importFromJSON(text);
      setImportResult(result);
    } catch {
      alert('无法读取剪贴板内容');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">批量导入/导出</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'import' ? (
            <div className="space-y-4">
              {!importResult ? (
                <>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">拖放文件到此处</p>
                    <p className="text-sm text-gray-400 mb-4">支持 JSON、CSV 格式</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-900 text-white rounded text-sm"
                    >
                      选择文件
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={handlePaste}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      或从剪贴板粘贴 JSON
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    importResult.success ? 'bg-green-50' : 'bg-amber-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {importResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className={`font-medium ${
                        importResult.success ? 'text-green-700' : 'text-amber-700'
                      }`}>
                        {importResult.success ? '导入成功' : '导入完成但有警告'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      成功导入 {importResult.imported} 个镜头
                    </p>
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        错误 ({importResult.errors.length})
                      </p>
                      <ul className="text-sm text-red-600 space-y-1">
                        {importResult.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>...还有 {importResult.errors.length - 5} 个错误</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setImportResult(null)}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      继续导入
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-900 text-white rounded"
                    >
                      完成
                    </button>
                  </div>
                </div>
              )}
              
              {isProcessing && (
                <div className="text-center py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">正在处理...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  导出格式
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['json', 'csv', 'excel'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setExportOptions({ ...exportOptions, format })}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        exportOptions.format === format
                          ? 'border-gray-900 bg-gray-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {format === 'json' ? (
                        <FileJson className="w-6 h-6" />
                      ) : (
                        <FileSpreadsheet className="w-6 h-6" />
                      )}
                      <span className="text-sm font-medium uppercase">{format}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.selectedOnly}
                    onChange={(e) => setExportOptions({ ...exportOptions, selectedOnly: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">仅导出选中的镜头</span>
                </label>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="font-medium mb-2">导出说明:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>JSON 格式包含完整的镜头数据</li>
                  <li>CSV 格式适合在 Excel 中编辑</li>
                  <li>导出文件将自动下载到本地</li>
                </ul>
              </div>
              
              {isProcessing && (
                <div className="text-center py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">正在导出...</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
