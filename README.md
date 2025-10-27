# 🚀 By and Sell - React Frontend Application

**Complete Modern React App with Real-Time Features, OTP Authentication, and 4-Part Enhanced Connections System**

---

## 📋 Quick Navigation

**This is ONE complete documentation file with 4 comprehensive parts (2309 lines total):**

### 📖 PART 1: Overview & Architecture
- Introduction & Tech Stack
- Project Structure
- Key Features Overview
- Design Patterns
- Application Flow
- Core Files Reference

### ⚙️ PART 2: Setup & Configuration
- Prerequisites & Installation
- Environment Variables
- Running the Application
- Building for Production
- Troubleshooting
- Deployment Options

### 🎯 PART 3: Features & Components
- Authentication System (Phone OTP)
- 4-Part Connections System (Detailed)
- Real-Time Messaging
- Posts & Feed
- Component Documentation
- Code Examples

### 🛠️ PART 4: Development Guide
- API Integration Reference
- Socket.io Events
- Custom Hooks
- Styling Guidelines
- Testing
- Deployment

**Scroll down to read each section ↓**

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd c:/Users/biruk/Desktop/byandsell/byandsellbyreact
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_NAME=By and Sell
VITE_ENABLE_SOCKET=true
```

### 3. Start Development Server
```bash
npm run dev
```

Opens at: `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

Output in: `dist/` folder

---

## ✨ Key Features at a Glance

### 🔐 Authentication
- **Phone OTP** with Ethiopian number support
- SMS via GeezSMS API
- Role-based registration
- JWT token authentication

### 🤝 4-Part Connections System

#### Part 1: Mutual Connections
Shows shared friends on user cards with names

#### Part 2: People You May Know
Smart suggestions using scoring algorithm:
- Mutual friends × 10 points
- Same role × 5 points  
- Same location × 8 points

#### Part 3: Network Insights
Analytics dashboard showing:
- Total connections
- Weekly growth
- Role breakdown

#### Part 4: Related Connections Modal
Deep relationship viewer with:
- Mutual connections list
- Friends of friends
- Same role/location users
- One-click connect

### 💬 Real-Time Features
- Socket.io messaging
- Typing indicators
- Online status
- Live connection updates

### 📝 Social Features
- Posts with images
- Like, comment, share
- Infinite scroll feed
- Category filters

---

## 📁 Project Structure

```
byandsellbyreact/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Login, Register, OTP
│   │   ├── connections/   # UserCard, MutualBadge, RelatedModal
│   │   ├── chat/          # Message components
│   │   └── layout/        # Navbar, Sidebar, Protected routes
│   │
│   ├── pages/             # Route-level pages
│   │   ├── auth/          # Auth pages
│   │   ├── ConnectionsPageNew.jsx  # Main connections (4 parts)
│   │   ├── Dashboard.jsx
│   │   └── MessagesPage.jsx
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useSocket.js   # Socket.io logic
│   │   └── useAuth.js
│   │
│   ├── store/             # Zustand state management
│   │   ├── useAuthStore.js
│   │   └── useConnectionsStore.js
│   │
│   ├── lib/               # Core utilities
│   │   ├── api.js         # API functions
│   │   └── socket.js      # Socket setup
│   │
│   ├── utils/             # Helper functions
│   │   ├── connectionHelpers.js  # 4-part connection logic
│   │   └── phoneUtils.js
│   │
│   └── App.jsx            # Root component with routing
│
├── .env                   # Environment variables (dev)
├── .env.production        # Environment variables (prod)
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── package.json           # Dependencies & scripts
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Library |
| Vite | Latest | Build tool & dev server |
| TailwindCSS | 3.x | Utility-first CSS |
| Socket.io Client | 4.x | Real-time communication |
| Zustand | 4.x | State management |
| Axios | 1.x | HTTP client |
| React Router | 6.x | Routing |
| Lucide React | Latest | Icons (1000+) |
| React Hot Toast | 2.x | Notifications |

---

## 🎯 Core Files Reference

| File | Lines | Description |
|------|-------|-------------|
| `pages/ConnectionsPageNew.jsx` | 818 | Main connections page with 4 parts integrated |
| `utils/connectionHelpers.js` | 250 | All connection algorithms & helpers |
| `hooks/useSocket.js` | 150 | Socket.io connection & event management |
| `lib/api.js` | 200 | Centralized API functions |
| `components/connections/UserCard.jsx` | 430 | User display with actions & mutuals |
| `components/connections/RelatedConnectionsModal.jsx` | 220 | Deep insights modal |
| `pages/auth/ModernRegisterPage.jsx` | 300 | Multi-step registration flow |
| `store/useAuthStore.js` | 80 | Authentication state management |

---

## 📊 4-Part Connections Breakdown

### Implementation Files

**Part 1: Mutual Connections Display**
- `components/connections/MutualConnectionsBadge.jsx`
- Function: `getMutualConnections()` in `connectionHelpers.js`
- Displays: "2 mutual: John, Jane"

**Part 2: People You May Know**
- Tab in `ConnectionsPageNew.jsx`
- Function: `getPeopleYouMayKnow()` in `connectionHelpers.js`
- Shows: Smart suggestions with reasons

**Part 3: Network Insights**
- Stats cards in `ConnectionsPageNew.jsx`
- Function: `getNetworkInsights()` in `connectionHelpers.js`
- Displays: Growth, breakdown, analytics

**Part 4: Related Connections Modal**
- `components/connections/RelatedConnectionsModal.jsx`
- Function: `getRelatedConnections()` in `connectionHelpers.js`
- Shows: 4 categories of related users

---

## 🚀 Available Scripts

```bash
npm run dev       # Start development server (port 5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

---

## 🌐 Environment Variables

**Required Variables:**
```env
VITE_API_BASE_URL=<backend_api_url>
VITE_SOCKET_URL=<socket_server_url>
```

**Optional Variables:**
```env
VITE_APP_NAME=<app_name>
VITE_APP_ENV=development|production
VITE_ENABLE_CONSOLE_LOGS=true|false
VITE_ENABLE_SOCKET=true|false
VITE_GEEZSMS_TOKEN=<sms_api_token>
```

---

## 🔗 API Endpoints Used

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP SMS
- `POST /api/v1/auth/verify-otp` - Verify OTP & login

### Connections
- `GET /api/v1/connections` - Get my connections
- `GET /api/v1/connections/pending` - Get pending requests
- `GET /api/v1/connections/sent` - Get sent requests
- `POST /api/v1/connections/request` - Send connection request
- `PUT /api/v1/connections/respond/:id` - Accept/reject request
- `DELETE /api/v1/connections/:id` - Remove connection

### Messages
- `GET /api/v1/messages/conversations` - Get conversations
- `GET /api/v1/messages/:userId` - Get messages with user
- `POST /api/v1/messages/send` - Send message

### Posts
- `GET /api/v1/posts` - Get feed
- `POST /api/v1/posts` - Create post
- `POST /api/v1/posts/:id/like` - Like post
- `POST /api/v1/posts/:id/comment` - Comment on post

### Search
- `GET /api/v1/search/users` - Search users
- `GET /api/v1/search/posts` - Search posts

---

## 🔌 Socket.io Events

### Emitted by Client
- `send_connection_request` - Send connection request
- `send_message` - Send chat message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Received by Client
- `connection_request_received` - New connection request
- `connection_request_responded` - Request accepted/rejected
- `message_received` - New message
- `user_typing` - Someone is typing
- `user_online` - User came online
- `user_offline` - User went offline
- `online_users` - List of online users

---

## 📖 Documentation Structure

This is ONE complete file with all 4 parts integrated:

- **PART 1** (Overview): Project intro, tech stack, architecture
- **PART 2** (Setup): Installation, config, running, building
- **PART 3** (Features): Detailed feature & component documentation
- **PART 4** (Development): API reference, hooks, testing, deployment

**Total Documentation:** 2309 lines in ONE file for easy reference

---

## 🎨 UI/UX Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Modern gradient designs
- ✅ Smooth animations & transitions
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Skeleton loaders
- ✅ Hover effects
- ✅ Badge indicators
- ✅ Modal overlays
- ✅ Infinite scroll

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Protected routes
- ✅ Automatic logout on 401
- ✅ Token refresh handling
- ✅ Input validation
- ✅ XSS prevention
- ✅ CORS configuration
- ✅ Secure Socket.io connection

---

## 🧪 Testing (Coming Soon)

```bash
npm test              # Run unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 📦 Deployment Options

### Netlify (Recommended)
```bash
npm run build
# Drag dist/ to netlify.com
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Traditional Hosting
Upload `dist/` contents via FTP/cPanel

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For questions or issues:
- Check the detailed documentation in PART 1-4
- Review code comments
- Check browser console for errors
- Verify backend API is running
- Ensure environment variables are set

---

## 🎉 Summary

This is a **production-ready** React application with:

✅ **3 Major Systems:**
1. Phone OTP Authentication
2. 4-Part Enhanced Connections
3. Real-Time Messaging

✅ **20+ Components** organized by feature

✅ **Custom Hooks** for reusable logic

✅ **Zustand Stores** for state management

✅ **Comprehensive API Layer** with interceptors

✅ **Socket.io Integration** for real-time updates

✅ **TailwindCSS Styling** with responsive design

✅ **Complete Documentation** in 4 parts (~2500 lines)

---

## 🚀 Ready to Code!

**Next Steps:**
1. Scroll down to **PART 2** for setup instructions
2. Explore **PART 3** for detailed features & components
3. Reference **PART 4** while coding (API, hooks, deployment)

**Start Development:**
```bash
npm install
npm run dev
```

**Everything you need is in this ONE file! 📄**

**Happy Coding! 🎨✨**
# 🚀 By and Sell Frontend - PART 1: Overview & Architecture

## 📋 Introduction

Complete React application with real-time features, OTP authentication, and social networking.

### Key Capabilities
- 📱 Phone OTP authentication (Ethiopian numbers)
- 🤝 4-part enhanced connections with mutual friends
- 💬 Real-time chat with Socket.io
- 📝 Posts, comments, likes
- 🔍 Advanced user search
- 📊 Network analytics
- 👥 Smart suggestions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| TailwindCSS | Styling |
| Socket.io | Real-time communication |
| Zustand | State management |
| Axios | API client |
| React Router 6 | Routing |
| Lucide Icons | Icon library |
| React Hot Toast | Notifications |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Login, register, OTP
│   ├── connections/    # UserCard, MutualBadge, RelatedModal
│   ├── chat/           # Message components
│   ├── posts/          # Post components
│   └── layout/         # Navbar, sidebar, protected routes
│
├── pages/              # Route-level pages
│   ├── auth/           # Login/Register pages
│   ├── ConnectionsPageNew.jsx  # Main connections (4 parts)
│   ├── Dashboard.jsx
│   ├── MessagesPage.jsx
│   └── PostsPage.jsx
│
├── hooks/              # Custom React hooks
│   ├── useSocket.js    # Socket.io logic
│   ├── useAuth.js
│   └── useDebounce.js
│
├── store/              # Zustand stores
│   ├── useAuthStore.js
│   ├── useConnectionsStore.js
│   └── useMessagesStore.js
│
├── lib/                # Core utilities
│   ├── api.js          # API functions
│   ├── socket.js       # Socket setup
│   └── constants.js
│
├── utils/              # Helper functions
│   ├── connectionHelpers.js  # 4-part connection logic
│   ├── phoneUtils.js
│   └── validators.js
│
└── App.jsx             # Root with routing
```

---

## ✨ Key Features

### 1. Phone OTP Authentication
- Ethiopian phone formats: 09, 07, 251, +251
- SMS via GeezSMS API
- Auto-login after verification
- Role selection: Buyer, Seller, Employee, Employer

**Files:** `pages/auth/ModernRegisterPage.jsx`, `store/useAuthStore.js`

### 2. 4-Part Connections System

#### Part 1: Mutual Connections
Shows shared friends on user cards
- Badge: "2 mutual: John, Jane"
- **File:** `components/connections/MutualConnectionsBadge.jsx`

#### Part 2: People You May Know
Smart suggestions with scoring algorithm
- Mutual friends × 10 points
- Same role × 5 points
- Same location × 8 points
- **File:** "May Know" tab in ConnectionsPageNew

#### Part 3: Network Insights
Analytics dashboard
- Total connections
- Growth this week
- Breakdown by role
- **Function:** `getNetworkInsights()` in connectionHelpers.js

#### Part 4: Related Connections Modal
Deep relationship viewer
- Mutual connections list
- Friends of friends (2nd degree)
- Same role/location users
- One-click connect
- **File:** `components/connections/RelatedConnectionsModal.jsx`

### 3. Real-Time Messaging
- Socket.io powered
- Typing indicators
- Online status
- Unread counts
- **Hook:** `hooks/useSocket.js`

### 4. Posts & Feed
- Create, like, comment
- Image upload
- Infinite scroll
- Category filters

### 5. Advanced Search
- Debounced search (300ms)
- Filter by role, location
- Sort by relevance

---

## 🏗️ Design Patterns

### 1. Component Composition
Small reusable pieces → larger features

### 2. Custom Hooks
Business logic separated from UI

### 3. Zustand State
Lightweight global state without Redux

### 4. API Abstraction
Centralized API layer in `lib/api.js`

### 5. Protected Routes
Auth guards for private pages

---

## 📊 Application Flow

```
Landing → Register (select role → phone → OTP) → Dashboard
                                                     ↓
Dashboard → Connections → Messages → Posts → Profile
             ├─ Discover
             ├─ May Know (smart suggestions)
             ├─ Connected
             ├─ Pending
             └─ Sent
```

---

## 🎯 Core Files

| File | Lines | Purpose |
|------|-------|---------|
| ConnectionsPageNew.jsx | 818 | Main connections with 4 parts |
| connectionHelpers.js | 250 | All connection algorithms |
| useSocket.js | 150 | Socket.io hook |
| api.js | 200 | All API calls |
| UserCard.jsx | 430 | Display user with actions |
| RelatedConnectionsModal.jsx | 220 | Deep insights modal |

---

# 🚀 By and Sell Frontend - PART 2: Setup & Configuration

## 📋 Prerequisites

### Required Software
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** v8+ (comes with Node.js)
- **Git** (optional, for version control)

### Backend Requirements
- Backend API running on `http://localhost:5001`
- GeezSMS account for OTP (Ethiopian SMS)

### Check Versions
```bash
node --version   # Should show v16 or higher
npm --version    # Should show v8 or higher
```

---

## 🚀 Installation Steps

### 1. Navigate to Project
```bash
cd c:/Users/biruk/Desktop/byandsell/byandsellbyreact
```

### 2. Install Dependencies
```bash
npm install
```

**Time:** 2-5 minutes

**Installs:**
- React, React DOM, React Router
- TailwindCSS, PostCSS, Autoprefixer
- Socket.io client
- Axios, Zustand
- Lucide icons, React Hot Toast
- All other dependencies from `package.json`

### 3. Verify Installation
```bash
npm list --depth=0
```

Should show all packages installed.

---

## 🔐 Environment Variables

### Development Environment

Create `.env` file in root:

```env
# API URLs
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001

# App Config
VITE_APP_NAME=By and Sell
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_CONSOLE_LOGS=true
VITE_ENABLE_SOCKET=true

# Optional: GeezSMS
VITE_GEEZSMS_TOKEN=your_token_here
```

### Production Environment

Create `.env.production`:

```env
# API URLs (Replace with your domain)
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_SOCKET_URL=https://api.yourdomain.com

# App Config
VITE_APP_NAME=By and Sell
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_CONSOLE_LOGS=false
VITE_ENABLE_SOCKET=true
```

### Accessing Variables

In your code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;
```

**Important Rules:**
- All variables MUST start with `VITE_`
- Restart dev server after changing `.env`
- Add `.env` to `.gitignore` (never commit secrets)

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

**What happens:**
- Vite dev server starts on port 5173
- Hot Module Replacement (HMR) enabled
- Fast refresh on code changes
- Opens at `http://localhost:5173`

**Console output:**
```
  VITE v5.0.0  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Custom Port

```bash
npm run dev -- --port 3000
```

Now runs on `http://localhost:3000`

### Expose to Network

```bash
npm run dev -- --host
```

Access from other devices on same WiFi using Network URL.

---

## 🏗️ Building for Production

### Step 1: Build

```bash
npm run build
```

**Process:**
1. Compiles React components
2. Bundles JavaScript
3. Processes CSS with TailwindCSS
4. Minifies everything
5. Optimizes assets
6. Outputs to `dist/` folder

**Output example:**
```
vite v5.0.0 building for production...
✓ 324 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-abc123.css      24.32 kB │ gzip: 6.12 kB
dist/assets/index-abc123.js       156.87 kB │ gzip: 52.43 kB
✓ built in 3.45s
```

### Step 2: Preview Build

```bash
npm run preview
```

Serves production build locally at `http://localhost:4173`

Test before deploying!

### Step 3: Deploy

Upload `dist/` folder to hosting:

#### Netlify (Easiest)
```bash
# Drag & drop dist/ folder to netlify.com
# OR use CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Traditional Hosting (cPanel, FTP)
```bash
# Upload dist/ contents to public_html/
# Ensure .htaccess for SPA routing:
```

Create `.htaccess` in `dist/` before upload:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 📦 NPM Scripts

```json
{
  "scripts": {
    "dev": "vite",                  // Start dev server
    "build": "vite build",          // Production build
    "preview": "vite preview",      // Preview build locally
    "lint": "eslint src",           // Check code quality
    "format": "prettier --write src" // Format code
  }
}
```

---

## ⚙️ Configuration Files

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001' // Proxy API calls
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

### tailwind.config.js

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6'
      }
    }
  },
  plugins: []
}
```

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3000
```

### Environment Variables Not Loading
1. Ensure variables start with `VITE_`
2. Restart dev server
3. Check `.env` file location (must be in root)

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### Socket Connection Failed
1. Check backend is running
2. Verify VITE_SOCKET_URL in `.env`
3. Check browser console for errors
4. Ensure CORS enabled on backend

---

## 📚 Additional Setup

### ESLint (Code Quality)

```bash
npm install -D eslint
npx eslint --init
```

### Prettier (Code Formatting)

```bash
npm install -D prettier
```

Create `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Git Ignore

Ensure `.gitignore` includes:
```
node_modules/
dist/
.env
.env.local
.env.production
.DS_Store
```

---

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
