# 🚀 By and Sell Frontend - PART 4: Development Guide

## 📚 API Integration

### API Client Setup

**File:** `src/lib/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Functions

**Authentication:**
```javascript
export const authAPI = {
  sendOTP: (phoneNumber, role) => 
    api.post('/auth/send-otp', { phoneNumber, role }),
  
  verifyOTP: (phoneNumber, otp, role) => 
    api.post('/auth/verify-otp', { phoneNumber, otp, role }),
  
  login: (phoneNumber) => 
    api.post('/auth/login', { phoneNumber }),
  
  logout: () => 
    api.post('/auth/logout')
};
```

**Connections:**
```javascript
export const connectionsAPI = {
  getMyConnections: (params) => 
    api.get('/connections', { params }),
  
  getPendingRequests: (params) => 
    api.get('/connections/pending', { params }),
  
  getSentRequests: (params) => 
    api.get('/connections/sent', { params }),
  
  sendRequest: (userId, message) => 
    api.post('/connections/request', { userId, message }),
  
  respondToRequest: (requestId, status) => 
    api.put(`/connections/respond/${requestId}`, { status }),
  
  removeConnection: (connectionId) => 
    api.delete(`/connections/${connectionId}`)
};
```

**Messages:**
```javascript
export const messagesAPI = {
  getConversations: () => 
    api.get('/messages/conversations'),
  
  getMessages: (userId, page = 1) => 
    api.get(`/messages/${userId}`, { params: { page } }),
  
  sendMessage: (receiverId, content, type = 'text') => 
    api.post('/messages/send', { receiverId, content, type }),
  
  markAsRead: (conversationId) => 
    api.put(`/messages/read/${conversationId}`)
};
```

**Posts:**
```javascript
export const postsAPI = {
  getFeed: (page = 1, limit = 10) => 
    api.get('/posts', { params: { page, limit } }),
  
  createPost: (data) => 
    api.post('/posts', data),
  
  likePost: (postId) => 
    api.post(`/posts/${postId}/like`),
  
  commentOnPost: (postId, content) => 
    api.post(`/posts/${postId}/comment`, { content }),
  
  deletePost: (postId) => 
    api.delete(`/posts/${postId}`)
};
```

**Search:**
```javascript
export const searchAPI = {
  searchUsers: (params) => 
    api.get('/search/users', { params }),
  
  searchPosts: (params) => 
    api.get('/search/posts', { params })
};
```

**Profile:**
```javascript
export const profileAPI = {
  getProfile: (userId) => 
    api.get(`/users/${userId}`),
  
  updateProfile: (data) => 
    api.put('/users/profile', data),
  
  uploadAvatar: (formData) => 
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};
```

---

## 🔌 Socket.io Events Reference

### Connection Events

```javascript
// Client → Server
socket.emit('send_connection_request', {
  userId: targetUserId,
  message: 'Hi, let\'s connect!'
});

// Server → Client
socket.on('connection_request_received', (data) => {
  // data: { request: {...}, requester: {...} }
  setPendingRequests(prev => [...prev, data.request]);
  toast.info(`${data.requester.username} wants to connect`);
});

socket.on('connection_request_responded', (data) => {
  // data: { requestId, status: 'accept'|'reject', connection: {...} }
  if (data.status === 'accept') {
    setConnections(prev => [...prev, data.connection]);
  }
  setSentRequests(prev => prev.filter(r => r.id !== data.requestId));
});
```

### Message Events

```javascript
// Send message
socket.emit('send_message', {
  receiverId: userId,
  content: 'Hello!',
  type: 'text'
});

// Receive message
socket.on('message_received', (data) => {
  // data: { message: {...}, sender: {...} }
  setMessages(prev => [...prev, data.message]);
  playNotificationSound();
});

// Typing indicators
socket.emit('typing_start', { conversationId });
socket.emit('typing_stop', { conversationId });

socket.on('user_typing', (data) => {
  // data: { userId, conversationId }
  setTypingUsers(prev => [...prev, data.userId]);
});
```

### Online Status

```javascript
socket.on('user_online', (data) => {
  // data: { userId }
  setOnlineUsers(prev => [...prev, data.userId]);
});

socket.on('user_offline', (data) => {
  // data: { userId }
  setOnlineUsers(prev => prev.filter(id => id !== data.userId));
});

socket.on('online_users', (userIds) => {
  // Initial list of online users
  setOnlineUsers(userIds);
});
```

---

## 🎨 Component Development Guide

### Creating a New Component

**1. Create Component File:**
```jsx
// src/components/MyComponent.jsx
import React, { useState } from 'react';
import { Icon } from 'lucide-react';

const MyComponent = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold">{prop1}</h3>
      <p className="text-gray-600">{prop2}</p>
      <button onClick={onAction} className="btn-primary">
        <Icon className="w-4 h-4" />
        Action
      </button>
    </div>
  );
};

export default MyComponent;
```

**2. Add to Parent:**
```jsx
import MyComponent from '../components/MyComponent';

<MyComponent 
  prop1="Value" 
  prop2="Another value"
  onAction={handleAction}
/>
```

### Component Patterns

**Container/Presenter Pattern:**
```jsx
// Container (logic)
const UserListContainer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  return <UserListPresenter users={users} loading={loading} />;
};

// Presenter (UI)
const UserListPresenter = ({ users, loading }) => {
  if (loading) return <Spinner />;
  return users.map(user => <UserCard key={user.id} user={user} />);
};
```

**Compound Components:**
```jsx
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      {React.Children.map(children, (child, index) => 
        React.cloneElement(child, { 
          isActive: index === activeTab,
          onClick: () => setActiveTab(index)
        })
      )}
    </div>
  );
};

Tabs.Tab = ({ label, isActive, onClick }) => (
  <button className={isActive ? 'active' : ''} onClick={onClick}>
    {label}
  </button>
);

// Usage
<Tabs>
  <Tabs.Tab label="Tab 1" />
  <Tabs.Tab label="Tab 2" />
</Tabs>
```

---

## 🎨 Styling Guidelines

### TailwindCSS Classes

**Common Patterns:**

```jsx
// Buttons
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
  Primary Button
</button>

<button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition">
  Secondary Button
</button>

// Cards
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
  Card Content
</div>

// Inputs
<input 
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
  type="text"
/>

// Badges
<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
  Badge
</span>

// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Custom Utilities

**Add to `tailwind.config.js`:**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      spacing: {
        '128': '32rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  }
}
```

---

## 🔧 Custom Hooks Examples

### useDebounce
```javascript
// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

// Usage
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchUsers(debouncedSearch);
  }
}, [debouncedSearch]);
```

### useInfiniteScroll
```javascript
// src/hooks/useInfiniteScroll.js
import { useState, useEffect, useRef } from 'react';

const useInfiniteScroll = (callback) => {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef();

  useEffect(() => {
    if (isFetching) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsFetching(true);
        callback().then(() => setIsFetching(false));
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [callback, isFetching]);

  return [isFetching, observerRef];
};

export default useInfiniteScroll;

// Usage
const [isFetching, sentinelRef] = useInfiniteScroll(loadMore);

return (
  <div>
    {posts.map(post => <PostCard key={post.id} post={post} />)}
    <div ref={sentinelRef}>
      {isFetching && <Spinner />}
    </div>
  </div>
);
```

---

## 🧪 Testing

### Unit Tests (Vitest)

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Test Example:**
```javascript
// src/utils/__tests__/connectionHelpers.test.js
import { describe, it, expect } from 'vitest';
import { getMutualConnections } from '../connectionHelpers';

describe('getMutualConnections', () => {
  it('should return mutual connections', () => {
    const myConnections = [
      { id: 1, requester: { id: 1 }, receiver: { id: 2 } },
      { id: 2, requester: { id: 1 }, receiver: { id: 3 } }
    ];
    
    const targetUser = {
      id: 4,
      connections: [2, 3, 5]
    };
    
    const mutuals = getMutualConnections(myConnections, targetUser);
    expect(mutuals).toHaveLength(2);
  });
});
```

**Run tests:**
```bash
npm test
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

**Option 1: Drag & Drop**
1. Go to [netlify.com](https://netlify.com)
2. Drag `dist/` folder
3. Done!

**Option 2: CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Deploy to AWS S3 + CloudFront

**1. Build:**
```bash
npm run build
```

**2. Upload to S3:**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

**3. Invalidate CloudFront:**
```bash
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## 📝 Code Style Guide

### File Naming
- Components: `PascalCase.jsx` (e.g., `UserCard.jsx`)
- Hooks: `camelCase.js` with `use` prefix (e.g., `useSocket.js`)
- Utils: `camelCase.js` (e.g., `phoneUtils.js`)
- Pages: `PascalCase.jsx` (e.g., `Dashboard.jsx`)

### Component Structure
```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import CustomComponent from './CustomComponent';

// 2. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3. State
  const [state, setState] = useState(null);
  
  // 4. Effects
  useEffect(() => {
    // side effects
  }, []);
  
  // 5. Handlers
  const handleClick = () => {
    // logic
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 7. Export
export default MyComponent;
```

### Best Practices
- ✅ Use functional components with hooks
- ✅ Extract reusable logic into custom hooks
- ✅ Keep components small (< 300 lines)
- ✅ Use PropTypes or TypeScript for type checking
- ✅ Memoize expensive computations with `useMemo`
- ✅ Use `useCallback` for event handlers passed to children
- ✅ Lazy load routes with `React.lazy()`

---

## 🔍 Debugging Tips

### React DevTools
Install [React DevTools](https://react.dev/learn/react-developer-tools) browser extension

### Console Logging
```javascript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

### Network Requests
Check browser DevTools → Network tab for API calls

### Socket Events
```javascript
socket.onAny((event, ...args) => {
  console.log(`Socket event: ${event}`, args);
});
```

---

## 📚 Resources

### Documentation
- [React Docs](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev/guide/)

### Icons
- [Lucide Icons](https://lucide.dev) - Browse 1000+ icons

### Learning
- [React Patterns](https://reactpatterns.com)
- [JavaScript.info](https://javascript.info)

---

## ✅ Final Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Test on mobile, tablet, desktop
- [ ] Check all API endpoints work
- [ ] Verify Socket.io connection
- [ ] Test OTP flow end-to-end
- [ ] Confirm all 4 connection parts work
- [ ] Test real-time messaging
- [ ] Check for console errors
- [ ] Verify environment variables
- [ ] Review security (no API keys exposed)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Optimize images
- [ ] Add error boundaries
- [ ] Set up analytics (optional)
- [ ] Configure SEO meta tags

---

## 🎉 You're Ready!

Your frontend is fully documented and production-ready!

**Quick Start Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Main Features Working:**
✅ Phone OTP Authentication  
✅ 4-Part Connections System  
✅ Real-Time Messaging  
✅ Posts & Feed  
✅ User Search  
✅ Network Analytics  

**Happy Coding! 🚀**
