# Restructure to Single Application

## Current Issues
- Two separate `package.json` files (client + server)
- Complex build process with `--prefix` commands
- Vercel struggling with workspace structure
- Duplicate dependencies

## Proposed Structure

```
pizza-pos/
├── package.json          # Single package.json with all dependencies
├── tsconfig.json         # TypeScript config
├── vercel.json           # Simplified Vercel config
├── vite.config.ts        # Vite config for frontend
├── api/
│   └── index.js          # Vercel serverless entry point
├── src/                  # Backend source (renamed from server/src)
│   ├── index.ts
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── types/
├── client-src/           # Frontend source (renamed from client/src)
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── pages/
│   ├── stores/
│   └── hooks/
├── public/               # Static assets
└── dist/                 # Build output
    ├── client/           # Frontend build
    └── server/           # Backend build
```

## Benefits

1. **Single Build Process**
   - One `npm install`
   - One `npm run build`
   - Vercel handles it easily

2. **Shared Dependencies**
   - No duplicate packages
   - Smaller node_modules
   - Faster installs

3. **Simpler Deployment**
   - No workspace confusion
   - Standard Vercel setup
   - Easier debugging

4. **Better DX**
   - Single package.json to manage
   - Cleaner scripts
   - Standard project structure

## Migration Steps

### Step 1: Merge package.json files
Combine dependencies from `client/package.json` and `server/package.json` into root

### Step 2: Restructure directories
```bash
# Move backend
mv server/src src
mv server/tsconfig.json tsconfig.server.json

# Move frontend
mv client/src client-src
mv client/index.html index.html
mv client/vite.config.ts vite.config.ts
mv client/tsconfig.json tsconfig.client.json
```

### Step 3: Update scripts in package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "vite",
    "dev:server": "tsx watch src/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "vercel-build": "npm run build"
  }
}
```

### Step 4: Update vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 5: Update import paths
- Frontend: Update paths like `../../../shared/types` → `../../shared/types`
- Backend: Update paths (most should stay the same)

### Step 6: Update vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist/client',
    emptyOutDir: true
  },
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

## Estimate
- **Time:** 30-45 minutes
- **Risk:** Low (can keep backup of current structure)
- **Benefit:** Much easier deployment and maintenance

## Alternative: Keep Current Structure but Fix Build

If you want to keep the current structure, I can fix the build process to work better with Vercel by:
1. Creating proper workspace configuration
2. Adding a root-level build script that works
3. Simplifying the vercel.json

**Recommendation:** Go with the unified structure. It's cleaner and standard for full-stack Node.js apps.

Would you like me to:
1. **Restructure to single app** (recommended)
2. **Fix current structure** to work with Vercel (quicker)
