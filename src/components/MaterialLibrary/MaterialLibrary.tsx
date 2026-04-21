import React, { useState, useRef } from 'react';
import { useMaterialStore, type MaterialImage } from '../../stores/materialStore';

interface MaterialLibraryProps {
  associatedShotId?: string;
  onSelect?: (image: MaterialImage) => void;
  onClose?: () => void;
}

const IMAGE_TYPES = [
  { value: 'character', label: '👤 人物', color: 'bg-blue-100 text-blue-700' },
  { value: 'prop', label: '📦 道具', color: 'bg-green-100 text-green-700' },
  { value: 'scene', label: '🏞️ 场景', color: 'bg-purple-100 text-purple-700' },
  { value: 'reference', label: '📚 参考', color: 'bg-orange-100 text-orange-700' },
  { value: 'other', label: '📎 其他', color: 'bg-gray-100 text-gray-700' },
];

export function MaterialLibrary({ associatedShotId, onSelect, onClose }: MaterialLibraryProps) {
  const {
    images,
    tags,
    addImage,
    removeImage,
    updateImage,
    associateWithShot,
    disassociateFromShot,
    getImagesByShotId,
    searchByName,
  } = useMaterialStore();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 过滤图片
  const filteredImages = React.useMemo(() => {
    let result = images;
    
    // 按类型过滤
    if (filterType !== 'all') {
      result = result.filter((img) => img.type === filterType);
    }
    
    // 按搜索词过滤
    if (searchQuery) {
      result = result.filter((img) =>
        img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // 按标签过滤
    if (selectedTags.length > 0) {
      result = result.filter((img) =>
        selectedTags.some((tag) => img.tags.includes(tag))
      );
    }
    
    // 如果有关联分镜ID，优先显示关联的图片
    if (associatedShotId) {
      const associated = result.filter((img) =>
        img.associatedShotIds.includes(associatedShotId)
      );
      const notAssociated = result.filter(
        (img) => !img.associatedShotIds.includes(associatedShotId)
      );
      result = [...associated, ...notAssociated];
    }
    
    return result;
  }, [images, filterType, searchQuery, selectedTags, associatedShotId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        addImage({
          url,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'reference',
          tags: [],
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    });

    setShowUpload(false);
  };

  const handleAssociate = (imageId: string) => {
    if (associatedShotId) {
      const image = images.find((img) => img.id === imageId);
      if (image?.associatedShotIds.includes(associatedShotId)) {
        disassociateFromShot(imageId, associatedShotId);
      } else {
        associateWithShot(imageId, associatedShotId);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">素材库</h2>
          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
            {images.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
          >
            ⬆️ 上传
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="px-6 py-3 border-b border-gray-200 space-y-3">
        {/* 类型筛选 */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              filterType === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {IMAGE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                filterType === type.value
                  ? type.color.replace('bg-', 'bg-opacity-100 ')
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="搜索素材名称或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 标签筛选 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 图片网格 */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredImages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm">暂无素材</p>
            <p className="text-xs mt-1">点击上方上传按钮添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredImages.map((image) => {
              const isAssociated = associatedShotId
                ? image.associatedShotIds.includes(associatedShotId)
                : false;

              return (
                <div
                  key={image.id}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                    isAssociated
                      ? 'border-primary-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* 图片 */}
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 信息 */}
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {image.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded">
                        {
                          IMAGE_TYPES.find((t) => t.value === image.type)
                            ?.label.split(' ')[1] || image.type
                        }
                      </span>
                      {isAssociated && (
                        <span className="text-[10px] px-1 py-0.5 bg-primary-100 text-primary-600 rounded">
                          已关联
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {associatedShotId && (
                      <button
                        onClick={() => handleAssociate(image.id)}
                        className={`w-6 h-6 flex items-center justify-center rounded text-xs ${
                          isAssociated
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                        title={isAssociated ? '取消关联' : '关联到分镜'}
                      >
                        {isAssociated ? '✓' : '+'}
                      </button>
                    )}
                    {onSelect && (
                      <button
                        onClick={() => onSelect(image)}
                        className="w-6 h-6 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-100 rounded text-xs"
                        title="选择"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="w-6 h-6 flex items-center justify-center bg-white text-red-500 hover:bg-red-50 rounded text-xs"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 上传弹窗 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">上传素材</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="w-full mb-4"
            />
            <p className="text-xs text-gray-500 mb-4">
              支持 JPG、PNG、GIF、WebP 格式
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                选择文件
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
