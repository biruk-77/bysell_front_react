import React, { useState, useEffect } from 'react';
import useSocket from '../../lib/useSocket';
import useAuthStore from '../../store/useAuthStore';
import { Wifi, WifiOff, Send, CheckCircle, XCircle } from 'lucide-react';

const SocketTest = () => {
  const { isConnected, socket, sendMessage } = useSocket();
  const { user } = useAuthStore();
  const [testMessage, setTestMessage] = useState('');
  const [testUserId, setTestUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    addLog('Component mounted');
    
    // Listen for new messages
    const handleNewMessage = (e) => {
      addLog(`Received message: ${JSON.stringify(e.detail)}`);
      setMessages(prev => [...prev, e.detail]);
    };

    window.addEventListener('new_message', handleNewMessage);

    return () => {
      window.removeEventListener('new_message', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    addLog(`Socket connection status: ${isConnected ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}`);
  }, [isConnected]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-10)); // Keep last 10 logs
  };

  const handleSendTest = async () => {
    if (!testUserId || !testMessage) {
      addLog('ERROR: User ID and message required');
      return;
    }

    addLog(`Attempting to send message to ${testUserId}`);
    
    try {
      const result = await sendMessage(testUserId, testMessage);
      addLog(`SUCCESS: Message sent - ${JSON.stringify(result)}`);
      setTestMessage('');
    } catch (error) {
      addLog(`ERROR: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🔌 Socket.io Test Panel</h2>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="text-green-500" size={24} />
              <span className="text-green-600 font-semibold">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="text-red-500" size={24} />
              <span className="text-red-600 font-semibold">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Your Info:</h3>
        <p className="text-sm text-blue-700">
          <strong>User ID:</strong> {user?.id || 'Not logged in'}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Username:</strong> {user?.username || 'N/A'}
        </p>
      </div>

      {/* Send Test Message */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Send Test Message:</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Receiver User ID"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Test message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendTest()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendTest}
              disabled={!isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Received Messages */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-3">Received Messages ({messages.length}):</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-green-600">No messages received yet</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="text-sm text-green-800 bg-white p-2 rounded">
                <strong>From:</strong> {msg.senderUsername || msg.senderId} | <strong>Content:</strong> {msg.content}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Debug Logs */}
      <div className="p-4 bg-gray-900 rounded-lg">
        <h3 className="font-semibold text-white mb-3">🐛 Debug Logs:</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="text-xs font-mono text-green-400">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">💡 Quick Test Steps:</h3>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li>Make sure backend is running (npm start in test-project folder)</li>
          <li>Check that socket shows "Connected" above</li>
          <li>Open this page in two browser windows (or incognito)</li>
          <li>Login as different users in each window</li>
          <li>Copy your User ID from one window</li>
          <li>Paste it in the "Receiver User ID" field in the other window</li>
          <li>Type a message and click Send</li>
          <li>You should see the message appear in "Received Messages" in both windows!</li>
        </ol>
      </div>
    </div>
  );
};

export default SocketTest;
