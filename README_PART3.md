# 🚀 By and Sell Frontend - PART 3: Features & Components

## 🔐 Authentication System

### Overview
Phone-based OTP authentication for Ethiopian users with SMS verification.

### Registration Flow

**Component:** `src/pages/auth/ModernRegisterPage.jsx`

**3 Steps:**

#### Step 1: Role Selection
```jsx
const roles = [
  { id: 'buyer', label: 'Buyer', icon: ShoppingBag },
  { id: 'seller', label: 'Seller', icon: Store },
  { id: 'employee', label: 'Employee', icon: Users },
  { id: 'employer', label: 'Employer', icon: Briefcase }
];

<button onClick={() => setSelectedRole(role.id)}>
  {role.label}
</button>
```

#### Step 2: Phone Input
Supports multiple Ethiopian formats:
```javascript
// Accepted formats:
09XXXXXXXX      → Normalized to 251XXXXXXXXX
07XXXXXXXX      → Normalized to 251XXXXXXXXX
251XXXXXXXXX    → Already normalized
+251XXXXXXXXX   → Stripped + sign
2510XXXXXXXXX   → Extra 0 removed
```

**Phone validation:**
```javascript
const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    return '251' + cleaned.substring(1);
  }
  if (cleaned.startsWith('2510')) {
    return '251' + cleaned.substring(4);
  }
  return cleaned;
};
```

#### Step 3: OTP Verification
```javascript
const verifyOTP = async () => {
  const response = await api.post('/auth/verify-otp', {
    phoneNumber: normalizedPhone,
    otp: otpCode,
    role: selectedRole
  });
  
  if (response.data.success) {
    login(response.data.user, response.data.token);
    navigate('/dashboard');
  }
};
```

### Auth State Management

**File:** `src/store/useAuthStore.js`

```javascript
import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  // Login action
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  // Logout action
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  // Check auth on app load
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
      set({ user, token, isAuthenticated: true });
    }
  }
}));
```

### Protected Routes

**Component:** `src/components/layout/ProtectedRoute.jsx`

```javascript
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};
```

**Usage in App.jsx:**
```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/connections" element={<ConnectionsPageNew />} />
  <Route path="/messages" element={<MessagesPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>
```

---

## 🤝 4-Part Connections System

### Main Component

**File:** `src/pages/ConnectionsPageNew.jsx` (818 lines)

**State Management:**
```javascript
const [connections, setConnections] = useState([]);          // Your connections
const [pendingRequests, setPendingRequests] = useState([]);  // Requests received
const [sentRequests, setSentRequests] = useState([]);        // Requests sent
const [suggestedUsers, setSuggestedUsers] = useState([]);    // All users
const [showRelatedModal, setShowRelatedModal] = useState(false);
const [relatedModalUser, setRelatedModalUser] = useState(null);
```

**Tabs:**
1. **Discover** - Find all users
2. **May Know** - Smart suggestions (Part 2)
3. **Connected** - Your network
4. **Pending** - Incoming requests
5. **Sent** - Outgoing requests

### PART 1: Mutual Connections Display

**Component:** `src/components/connections/MutualConnectionsBadge.jsx`

**Shows:** "X mutual connections: Name1, Name2"

**Implementation:**
```jsx
export default function MutualConnectionsBadge({ count, names = [] }) {
  if (count === 0) return null;
  
  const displayNames = names.slice(0, 2);
  const remaining = count - displayNames.length;
  
  return (
    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
      <Users className="w-3 h-3" />
      {count === 1 && <span>1 mutual: {displayNames[0]}</span>}
      {count > 1 && (
        <span>
          {displayNames.join(', ')}
          {remaining > 0 && ` +${remaining} more`}
        </span>
      )}
    </div>
  );
}
```

**Algorithm:** `src/utils/connectionHelpers.js`

```javascript
export const getMutualConnections = (myConnections, targetUser) => {
  if (!myConnections || !targetUser?.connections) return [];
  
  // Get my connection IDs
  const myConnectionIds = myConnections.map(conn => {
    const otherId = conn.requester?.id === conn.requesterId 
      ? conn.receiver?.id 
      : conn.requester?.id;
    return otherId;
  }).filter(Boolean);

  // Get target's connection IDs
  const targetConnectionIds = targetUser.connections || [];
  
  // Find intersection (mutuals)
  const mutualIds = myConnectionIds.filter(id => 
    targetConnectionIds.includes(id)
  );
  
  // Return full connection objects
  return myConnections.filter(conn => {
    const otherId = conn.requester?.id === conn.requesterId 
      ? conn.receiver?.id 
      : conn.requester?.id;
    return mutualIds.includes(otherId);
  });
};

export const getMutualCount = (myConnections, targetUser) => {
  return getMutualConnections(myConnections, targetUser).length;
};
```

**Usage in UserCard:**
```jsx
<UserCard
  user={user}
  mutualCount={getMutualCount(myConnections, user)}
  mutualNames={['John', 'Jane']}
/>
```

### PART 2: People You May Know

**Tab:** "May Know" in ConnectionsPageNew

**Algorithm:** Smart scoring system

```javascript
export const getPeopleYouMayKnow = (myConnections, allUsers, currentUser) => {
  const suggestions = [];
  
  // Get IDs of people already connected
  const connectedIds = myConnections.map(conn => 
    conn.requester?.id === currentUser.id ? conn.receiver?.id : conn.requester?.id
  ).filter(Boolean);
  
  connectedIds.push(currentUser.id); // Exclude self
  
  allUsers.forEach(user => {
    if (connectedIds.includes(user.id)) return; // Skip if already connected
    
    let score = 0;
    let reasons = [];
    
    // 1. Mutual connections (highest weight)
    const mutualCount = getMutualCount(myConnections, user);
    if (mutualCount > 0) {
      score += mutualCount * 10;
      reasons.push(`${mutualCount} mutual connection${mutualCount > 1 ? 's' : ''}`);
    }
    
    // 2. Same role
    if (user.role === currentUser.role) {
      score += 5;
      reasons.push(`Also a ${user.role}`);
    }
    
    // 3. Same location
    if (user.location && user.location === currentUser.location) {
      score += 8;
      reasons.push(`From ${user.location}`);
    }
    
    // 4. Recently active
    if (user.lastActive) {
      const hoursSinceActive = (Date.now() - new Date(user.lastActive)) / (1000 * 60 * 60);
      if (hoursSinceActive < 24) {
        score += 3;
        reasons.push('Recently active');
      }
    }
    
    if (score > 0) {
      suggestions.push({
        ...user,
        suggestionScore: score,
        suggestionReasons: reasons
      });
    }
  });
  
  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.suggestionScore - a.suggestionScore);
};
```

**Display:**
```jsx
{activeTab === 'suggested' && (
  <div>
    <h3>People You May Know ({peopleYouMayKnow.length})</h3>
    {peopleYouMayKnow.map(user => (
      <div key={user.id}>
        <UserAvatar user={user} />
        <h4>{user.username}</h4>
        <p>{user.role}</p>
        
        {/* Show suggestion reasons */}
        {user.suggestionReasons.map(reason => (
          <span className="badge">{reason}</span>
        ))}
        
        <button onClick={() => connect(user)}>Connect</button>
        <button onClick={() => viewRelated(user)}>
          <Eye /> View Related
        </button>
      </div>
    ))}
  </div>
)}
```

### PART 3: Network Insights

**Function:** `getNetworkInsights(myConnections)`

```javascript
export const getNetworkInsights = (myConnections) => {
  const insights = {
    total: myConnections.length,
    byRole: {},
    recentGrowth: 0,
    topConnectors: [],
    avgConnectionsPerUser: 0
  };
  
  // Count connections by role
  myConnections.forEach(conn => {
    const other = conn.requester?.id === conn.requesterId 
      ? conn.receiver 
      : conn.requester;
    const role = other?.role || 'unknown';
    insights.byRole[role] = (insights.byRole[role] || 0) + 1;
  });
  
  // Calculate recent growth (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  insights.recentGrowth = myConnections.filter(conn => 
    new Date(conn.createdAt) > sevenDaysAgo
  ).length;
  
  return insights;
};
```

**Display in Stats Cards:**
```jsx
<div className="stats-grid">
  <StatCard 
    label="Connections" 
    value={connections.length}
    icon={UserCheck}
  />
  <StatCard 
    label="Pending" 
    value={pendingRequests.length}
    icon={Clock}
  />
  <StatCard 
    label="Sent" 
    value={sentRequests.length}
    icon={Star}
  />
  <StatCard 
    label="May Know" 
    value={peopleYouMayKnow.length}
    description={`+${networkInsights.recentGrowth} this week`}
    icon={TrendingUp}
  />
</div>
```

### PART 4: Related Connections Modal

**Component:** `src/components/connections/RelatedConnectionsModal.jsx`

**Trigger:**
```jsx
<button onClick={() => {
  setRelatedModalUser(user);
  setShowRelatedModal(true);
}}>
  <Eye className="w-4 h-4" /> View Related
</button>
```

**Function:** `getRelatedConnections()`

```javascript
export const getRelatedConnections = (myConnections, targetUser, allUsers) => {
  const related = {
    mutual: [],
    secondDegree: [],
    sameRole: [],
    sameLocation: []
  };
  
  // 1. Mutual connections
  related.mutual = getMutualConnections(myConnections, targetUser);
  
  // 2. Second degree (friends of friends)
  if (targetUser.connections) {
    const targetConnectionIds = targetUser.connections;
    const myConnectionIds = myConnections.map(conn => getOtherId(conn));
    
    related.secondDegree = allUsers.filter(u => 
      targetConnectionIds.includes(u.id) && 
      !myConnectionIds.includes(u.id) &&
      u.id !== targetUser.id
    ).slice(0, 10);
  }
  
  // 3. Same role connections
  related.sameRole = allUsers.filter(u => 
    u.role === targetUser.role && 
    u.id !== targetUser.id
  ).slice(0, 10);
  
  // 4. Same location
  if (targetUser.location) {
    related.sameLocation = allUsers.filter(u => 
      u.location === targetUser.location && 
      u.id !== targetUser.id
    ).slice(0, 10);
  }
  
  return related;
};
```

**Modal UI:**
```jsx
<RelatedConnectionsModal isOpen={showRelatedModal}>
  {/* Header with target user */}
  <UserCard user={relatedModalUser} />
  
  {/* Section 1: Mutual Connections */}
  {related.mutual.length > 0 && (
    <Section title="Mutual Connections" count={related.mutual.length}>
      {related.mutual.map(conn => <MiniUserCard user={conn} badge="Mutual" />)}
    </Section>
  )}
  
  {/* Section 2: Friends of Friends */}
  {related.secondDegree.length > 0 && (
    <Section title="Friends of Friends" count={related.secondDegree.length}>
      {related.secondDegree.map(user => (
        <MiniUserCard user={user} badge="2nd Degree" onConnect={() => connect(user)} />
      ))}
    </Section>
  )}
  
  {/* Section 3: Same Role */}
  {related.sameRole.length > 0 && (
    <Section title={`Other ${targetUser.role}s`}>
      {related.sameRole.map(user => <MiniUserCard user={user} badge="Same Role" />)}
    </Section>
  )}
  
  {/* Section 4: Same Location */}
  {related.sameLocation.length > 0 && (
    <Section title={`From ${targetUser.location}`}>
      {related.sameLocation.map(user => <MiniUserCard user={user} badge="Nearby" />)}
    </Section>
  )}
</RelatedConnectionsModal>
```

---

## 💬 Real-Time Messaging

### Socket Hook

**File:** `src/hooks/useSocket.js`

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  // Send message
  const sendMessage = (receiverId, message) => {
    socket?.emit('send_message', { receiverId, message });
  };

  // Send connection request
  const sendConnectionRequest = (userId, message) => {
    socket?.emit('send_connection_request', { userId, message });
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    sendConnectionRequest
  };
};

export default useSocket;
```

### Message Events

```javascript
// In MessagesPage.jsx
const { socket } = useSocket();

useEffect(() => {
  if (!socket) return;

  // Receive new message
  socket.on('message_received', (data) => {
    setMessages(prev => [...prev, data.message]);
  });

  // Typing indicator
  socket.on('typing_start', (data) => {
    setTypingUsers(prev => [...prev, data.userId]);
  });

  socket.on('typing_stop', (data) => {
    setTypingUsers(prev => prev.filter(id => id !== data.userId));
  });

  return () => {
    socket.off('message_received');
    socket.off('typing_start');
    socket.off('typing_stop');
  };
}, [socket]);
```

---

**Next:** See PART 4 for Development Guide & API Reference
