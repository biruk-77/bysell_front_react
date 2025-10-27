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

**Next:** See PART 3 for Features & Components Documentation
