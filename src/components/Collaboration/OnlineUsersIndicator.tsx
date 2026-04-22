import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import { useCollaborationStore } from '../../stores/collaborationStore';

export const OnlineUsersIndicator: React.FC = () => {
  const { getOnlineUsers, updateUserPresence, currentUser } = useCollaborationStore();
  const onlineUsers = getOnlineUsers();
  
  useEffect(() => {
    // Update presence every 30 seconds
    const interval = setInterval(() => {
      updateUserPresence();
    }, 30000);
    
    // Initial presence update
    updateUserPresence();
    
    return () => clearInterval(interval);
  }, [updateUserPresence]);
  
  if (onlineUsers.length <= 1) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
      <Users className="w-4 h-4 text-gray-600" />
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0)}
          </div>
        ))}
        {onlineUsers.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
            +{onlineUsers.length - 3}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-600">
        {onlineUsers.length} 人在线
      </span>
    </div>
  );
};
