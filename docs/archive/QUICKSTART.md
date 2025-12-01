# Pizza POS - Quick Reference

## 🚀 Quick Commands

```bash
# Install everything
npm install && cd client && npm install && cd ../server && npm install && cd ..

# Run development mode
npm run dev

# Build for production
npm run build

# Run in Chrome kiosk mode (Windows)
.\scripts\start-kiosk.ps1

# Build Electron app
npm run electron:build
```

## 🌐 URLs

- **Main App**: http://localhost:5173
- **Kitchen Display**: http://localhost:5173/kitchen
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📁 Project Structure

```
pizza-pos/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main screens
│   │   ├── stores/        # Zustand state management
│   │   ├── contexts/      # React contexts
│   │   └── hooks/         # Custom hooks
│   └── public/
├── server/                # Node.js backend
│   ├── src/
│   │   ├── db/           # Database setup
│   │   ├── routes/       # API endpoints
│   │   └── services/     # Business logic
│   └── data/             # SQLite database
├── shared/               # Shared TypeScript types
│   └── types/
├── electron/             # Electron wrapper
│   ├── main.js
│   └── preload.js
└── scripts/              # Deployment scripts
    ├── start-kiosk.ps1
    └── start-dev.ps1
```

## 🎯 Key Features

✅ Touch-optimized UI (60-80px buttons)
✅ Custom pizza builder with visual preview
✅ Sides and drinks quick-select
✅ Real-time kitchen display (WebSocket)
✅ Multiple payment methods
✅ SQLite database
✅ Full-screen kiosk mode
✅ Auto-restart on crash

## 🔧 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, Socket.io
- **Database**: SQLite (better-sqlite3)
- **Deployment**: Electron, Chrome Kiosk Mode
- **Build**: Vite, TypeScript Compiler

## 💡 Tips

- Use F11 to exit kiosk mode during testing
- Kitchen display auto-refreshes
- Database resets on server restart (for development)
- All touch targets are 60px minimum
- Works with mouse/trackpad for testing
