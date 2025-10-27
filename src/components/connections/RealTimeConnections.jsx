import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Clock, Users } from 'lucide-react';
import useSocket from '../../lib/useSocket';
import { toast } from 'react-hot-toast';

const RealTimeConnections = () => {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('online');
  const { isConnected, onlineUsers, updateStatus, getOnlineUsers } = useSocket();

  // Load online users when component mounts
  useEffect(() => {
    if (isConnected) {
      getOnlineUsers();
    }
  }, [isConnected, getOnlineUsers]);

  // Listen for real-time connection events
  useEffect(() => {
    const handleConnectionRequestReceived = (event) => {
      const data = event.detail;
      
      // Add to pending requests
      setConnectionRequests(prev => [{
        id: data.connection.id,
        requester: data.connection.requester,
        message: data.message,
        timestamp: new Date(),
        status: 'pending'
      }, ...prev]);
    };

    const handleConnectionRequestResponded = (event) => {
      const data = event.detail;
      
      // Update sent requests status
      setSentRequests(prev => prev.map(req => 
        req.id === data.connection.id 
          ? { ...req, status: data.action, respondedAt: new Date() }
          : req
      ));

      // Remove from pending if it was there
      setConnectionRequests(prev => 
        prev.filter(req => req.id !== data.connection.id)
      );
    };

    // Add event listeners
    window.addEventListener('connection_request_received', handleConnectionRequestReceived);
    window.addEventListener('connection_request_responded', handleConnectionRequestResponded);

    // Cleanup
    return () => {
      window.removeEventListener('connection_request_received', handleConnectionRequestReceived);
      window.removeEventListener('connection_request_responded', handleConnectionRequestResponded);
    };
  }, []);

  // Handle accepting/rejecting connection requests
  const handleConnectionResponse = async (requestId, action) => {
    try {
      // This would normally call your API
      // const response = await connectionsAPI.respondToRequest(requestId, action);
      
      // Update local state
      setConnectionRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action, respondedAt: new Date() }
            : req
        )
      );

      toast.success(`Connection request ${action}ed successfully`);
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Failed to respond to connection request');
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    updateStatus(newStatus, (response) => {
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update status');
        setCurrentStatus('online'); // Reset on failure
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Control */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Your Status</h3>
        <div className="flex items-center space-x-4">
          {['online', 'away', 'busy', 'offline'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize flex items-center space-x-2 ${
                currentStatus === status
                  ? status === 'online' ? 'bg-green-100 text-green-800'
                  : status === 'away' ? 'bg-yellow-100 text-yellow-800'
                  : status === 'busy' ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                status === 'online' ? 'bg-green-500'
                : status === 'away' ? 'bg-yellow-500'
                : status === 'busy' ? 'bg-red-500'
                : 'bg-gray-400'
              }`} />
              <span>{status}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Online Users */}
      {isConnected && onlineUsers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900">Users Online Now</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {onlineUsers.length}
              </span>
            </div>
            <button
              onClick={() => getOnlineUsers()}
              className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineUsers.map((user) => (
              <div key={user.userId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                    user.status === 'online' ? 'bg-green-500'
                    : user.status === 'away' ? 'bg-yellow-500'
                    : user.status === 'busy' ? 'bg-red-500'
                    : 'bg-green-500'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.status || 'online'}
                  </p>
                </div>
                <button className="p-1 text-gray-400 hover:text-blue-500">
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Connection Requests */}
      {connectionRequests.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-medium text-gray-900">Pending Connection Requests</h3>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {connectionRequests.filter(req => req.status === 'pending').length}
            </span>
          </div>

          <div className="space-y-4">
            {connectionRequests
              .filter(req => req.status === 'pending')
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {request.requester.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {request.requester.username}
                      </h4>
                      <p className="text-sm text-gray-600">{request.message}</p>
                      <p className="text-xs text-gray-500">
                        {request.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleConnectionResponse(request.id, 'accept')}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-1"
                    >
                      <Check className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">Accept</span>
                    </button>
                    <button
                      onClick={() => handleConnectionResponse(request.id, 'reject')}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">Reject</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sent Requests Status */}
      {sentRequests.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900">Sent Connection Requests</h3>
          </div>

          <div className="space-y-3">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {request.receiver?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.receiver?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sent {request.timestamp?.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {request.status === 'pending' && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  {request.status === 'accept' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Accepted
                    </span>
                  )}
                  {request.status === 'reject' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Real-time updates active' : 'Reconnecting...'}
            </span>
          </div>
          
          {isConnected && (
            <span className="text-xs text-gray-500">
              {onlineUsers.length} users online
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeConnections;
