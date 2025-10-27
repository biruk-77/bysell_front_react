# Socket System Documentation

## 📁 Folder Structure

```
src/sockets/
├── core/
│   └── socketConnection.js     # Core socket connection management
├── messaging/
│   └── useMessaging.js         # Real-time messaging functionality  
├── connections/
│   └── useConnections.js       # Connection requests & networking
├── notifications/
│   └── useNotifications.js     # Push notifications & alerts
├── presence/
│   └── usePresence.js          # User online/offline status
├── trading/
│   └── useTrading.js           # Marketplace & trading features
├── employment/
│   └── useEmployment.js        # Job applications & hiring
├── index.js                    # Main exports & combined hook
└── README.md                   # This documentation
```

## 🚀 Usage Examples

### Import Individual Hooks
```javascript
import { useMessaging } from '../sockets/messaging/useMessaging';
import { useConnections } from '../sockets/connections/useConnections';
import { useNotifications } from '../sockets/notifications/useNotifications';

// In component
const { sendMessage, joinConversation } = useMessaging();
const { sendConnectionRequest } = useConnections();
const { markNotificationAsRead } = useNotifications();
```

### Import Combined Hook (Backward Compatible)
```javascript
import useSocket from '../sockets';

// In component - same API as before
const { 
  isConnected, 
  sendMessage, 
  sendConnectionRequest,
  onlineUsers 
} = useSocket();
```

### Import from Central Index
```javascript
import { 
  useMessaging,
  useConnections, 
  useNotifications,
  usePresence,
  useTrading,
  useEmployment 
} from '../sockets';
```

## 🔧 Core Features

### 1. **Core Connection** (`core/socketConnection.js`)
- Socket.IO connection management
- Authentication with JWT tokens
- Connection status tracking
- Error handling

### 2. **Messaging** (`messaging/useMessaging.js`)
- Send/receive real-time messages
- Join/leave conversations
- Typing indicators
- Message read receipts

### 3. **Connections** (`connections/useConnections.js`)
- Send connection requests
- Accept/reject requests
- Cancel pending requests
- Real-time notifications

### 4. **Notifications** (`notifications/useNotifications.js`)
- Toast notifications
- Mark as read/unread
- Clear notifications
- Custom notification types

### 5. **Presence** (`presence/usePresence.js`)
- Online/offline status
- User status updates
- Online users list
- Status indicators

### 6. **Trading** (`trading/useTrading.js`)
- Trade requests
- Product listings
- Purchase notifications
- Trade completion

### 7. **Employment** (`employment/useEmployment.js`)
- Job applications
- Interview scheduling
- Job offers
- Application responses

## 📡 Socket Events

### Messaging Events
- `new_message` - New message received
- `message_read` - Message marked as read
- `user_typing` - User typing indicator
- `join_conversation` - Join chat room
- `leave_conversation` - Leave chat room

### Connection Events
- `connection_request_received` - New connection request
- `connection_request_responded` - Request accepted/rejected
- `connection_request_cancelled` - Request cancelled

### Presence Events
- `user_online` - User came online
- `user_offline` - User went offline
- `user_status_changed` - Status update

### Trading Events
- `trade_request_received` - New trade request
- `product_sold` - Product purchased
- `trade_completed` - Trade finalized

### Employment Events
- `job_application_received` - New job application
- `interview_scheduled` - Interview scheduled
- `job_offer_received` - Job offer received

## 🔄 Migration Guide

### From Old useSocket Hook
```javascript
// OLD WAY
import useSocket from '../lib/useSocket';

// NEW WAY - still works!
import useSocket from '../sockets';

// OR - more specific
import { useMessaging } from '../sockets/messaging/useMessaging';
```

### No Breaking Changes
- Existing components will continue to work
- Same API and method names
- Backward compatible imports

## 🎯 Benefits

1. **Modular**: Each feature in its own file
2. **Maintainable**: Easy to find and update specific functionality
3. **Scalable**: Add new socket features easily
4. **Testable**: Test individual modules
5. **Type-safe**: Better TypeScript support potential
6. **Clean**: Organized by feature domain

## 🛠️ Development

### Adding New Socket Features
1. Create new folder in `src/sockets/`
2. Add `use[FeatureName].js` hook
3. Export from `index.js`
4. Update this README

### Testing
Each hook can be tested independently:
```javascript
import { renderHook } from '@testing-library/react-hooks';
import { useMessaging } from '../messaging/useMessaging';

test('should send message', () => {
  const { result } = renderHook(useMessaging);
  // Test messaging functionality
});
```
