import React, { useState } from 'react';
import { MessageSquare, X, Send, Check, Trash2, Reply } from 'lucide-react';
import { useCollaborationStore, Comment } from '../../stores/collaborationStore';

interface CommentPanelProps {
  shotId: string;
  onClose: () => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  shotId,
  onClose,
}) => {
  const {
    getShotComments,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    currentUser,
  } = useCollaborationStore();
  
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showResolved, setShowResolved] = useState(true);
  
  const comments = getShotComments(shotId);
  const unresolvedCount = comments.filter((c) => !c.resolved && !c.parentId).length;
  
  const handleSubmit = () => {
    if (newComment.trim()) {
      addComment(shotId, newComment.trim(), replyTo);
      setNewComment('');
      setReplyTo(null);
    }
  };
  
  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };
  
  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      updateComment(shotId, editingId, { content: editContent.trim() });
      setEditingId(null);
      setEditContent('');
    }
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`p-3 rounded-lg ${
        comment.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'
      } ${isReply ? 'ml-8 mt-2' : 'border-b'}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={{ backgroundColor: comment.authorId === currentUser.id ? '#3B82F6' : '#6B7280' }}
        >
          {comment.author.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author}</span>
            <span className="text-xs text-gray-400">{formatTime(comment.timestamp)}</span>
            {comment.resolved && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                已解决
              </span>
            )}
          </div>
          
          {editingId === comment.id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-gray-900 text-white rounded text-sm"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-sm">{comment.content}</p>
          )}
          
          {editingId !== comment.id && (
            <div className="flex items-center gap-3 mt-2">
              {!isReply && !comment.resolved && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Reply className="w-3 h-3" />
                  回复
                </button>
              )}
              {!comment.resolved && comment.authorId === currentUser.id && (
                <button
                  onClick={() => handleEdit(comment)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  编辑
                </button>
              )}
              {!isReply && !comment.resolved && (
                <button
                  onClick={() => resolveComment(shotId, comment.id)}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                >
                  <Check className="w-3 h-3" />
                  解决
                </button>
              )}
              {comment.authorId === currentUser.id && (
                <button
                  onClick={() => deleteComment(shotId, comment.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Group comments by parent
  const topLevelComments = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);
  
  const filteredComments = showResolved
    ? topLevelComments
    : topLevelComments.filter((c) => !c.resolved);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            评论 ({unresolvedCount} 未解决)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded"
            />
            显示已解决的评论
          </label>
        </div>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无评论</p>
              <p className="text-sm mt-1">添加第一条评论</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredComments.map((comment) => (
                <div key={comment.id}>
                  {renderComment(comment)}
                  {replies
                    .filter((r) => r.parentId === comment.id)
                    .map((reply) => renderComment(reply, true))}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <span>回复评论</span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="添加评论..."
              className="flex-1 p-2 border rounded text-sm resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Cmd + Enter 发送</p>
        </div>
      </div>
    </div>
  );
};
