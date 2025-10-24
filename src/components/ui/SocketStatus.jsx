import React from 'react';
import { Wifi, WifiOff, Users } from 'lucide-react';

const SocketStatus = ({ isConnected, onlineUsers }) => {
  return (
    <div className="flex items-center space-x-3 text-sm">
      {/* Connection Status */}
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </div>

      {/* Online Users Count */}
      {isConnected && onlineUsers.length > 0 && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          <Users className="h-3 w-3" />
          <span>{onlineUsers.length} online</span>
        </div>
      )}
    </div>
  );
};

export default SocketStatus;
