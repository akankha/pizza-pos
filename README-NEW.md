# 🍕 Pizza POS System - PRODUCTION READY

Complete Point of Sale system for pizza restaurants with Windows kiosk support, cloud backend, and web-based management.

---

## 📋 QUICK START

### For Deployment:

1. **Read**: [DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md) ← **START HERE**
2. **Architecture**: [FINAL-DEPLOYMENT-PLAN.md](FINAL-DEPLOYMENT-PLAN.md)
3. **Cleanup**: [CLEANUP-LIST.txt](CLEANUP-LIST.txt)

### For Development:

```bash
npm run install:all    # Install dependencies
npm run dev           # Start development servers
```

---

## 🏗️ DEPLOYMENT ARCHITECTURE

```
POS Kiosk (Windows PC) → Vercel API → Hostinger MySQL
                    ↓
            Kitchen Display (Browser)
                    ↓
            Admin Panel (Browser)
```

**What goes where:**

- ✅ **Hostinger**: MySQL database only
- ✅ **Vercel**: Backend API + web interfaces
- ✅ **Windows PC**: Electron POS app (kiosk mode)

---

## 🚀 DEPLOYMENT COMMANDS

```bash
# 1. Deploy backend to Vercel
git push origin master

# 2. Build POS kiosk app
npm run deploy:electron

# 3. Done! Install .exe on Windows PC
```

**Full guide**: [DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md)

---

## 💻 LOCAL DEVELOPMENT

```bash
# Install everything
npm run install:all

# Start development
npm run dev              # Both client + server
npm run dev:client       # Client only (port 5173)
npm run dev:server       # Server only (port 3001)
npm run electron:dev     # Electron development mode
```

---

## 📱 ACCESS POINTS

| What                | Where                                     | Who     |
| ------------------- | ----------------------------------------- | ------- |
| **POS Kiosk**       | Windows Electron App                      | Staff   |
| **Kitchen Display** | `https://your-app.vercel.app/kitchen`     | Kitchen |
| **Admin Panel**     | `https://your-app.vercel.app/admin/login` | Manager |

---

## ✨ FEATURES

### POS Kiosk (Touchscreen)

- Build custom pizzas
- Specialty pizzas & combos
- Sides & drinks
- Shopping cart & checkout
- Receipt generation

### Kitchen Display

- Real-time order queue
- Mark orders complete
- Auto-refresh every 3 seconds

### Admin Panel

- Menu management
- Sales reports
- User management
- Settings configuration

---

## 🛠️ TECH STACK

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MySQL
- **Desktop**: Electron (kiosk mode)
- **Hosting**: Vercel (serverless) + Hostinger (database)
- **State**: Zustand
- **Auth**: JWT

---

## 📂 PROJECT STRUCTURE

```
pizza-pos/
├── client/         # React frontend
├── server/         # Express backend
├── electron/       # Electron wrapper
├── api/           # Vercel serverless entry
├── shared/        # TypeScript types
└── docs/          # Documentation
```

---

## 🔐 ENVIRONMENT VARIABLES

### Vercel (Production):

```
NODE_ENV=production
DB_HOST=your-hostinger-mysql-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306
JWT_SECRET=your-secret-key
```

### Client Build:

Create `client/.env.production`:

```
VITE_API_URL=https://your-app.vercel.app
```

---

## 🔧 MAINTENANCE

### Update Menu:

- Login to admin panel
- Edit items in Menu Management

### Update Backend:

```bash
git push origin master  # Auto-deploys to Vercel
```

### Update POS App:

```bash
npm run deploy:electron
# Then reinstall on Windows PC
```

---

## 🆘 TROUBLESHOOTING

**Problem**: API not working  
**Solution**: Check Vercel environment variables

**Problem**: Database connection failed  
**Solution**: Enable remote MySQL in Hostinger

**Problem**: Electron app won't start  
**Solution**: Rebuild with `npm run deploy:electron`

**Full troubleshooting**: See [DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md#troubleshooting)

---

## 📖 DOCUMENTATION

- **[DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md)** - Complete deployment guide
- **[FINAL-DEPLOYMENT-PLAN.md](FINAL-DEPLOYMENT-PLAN.md)** - Architecture details
- **[CLEANUP-LIST.txt](CLEANUP-LIST.txt)** - Files to keep/delete
- **[docs/](docs/)** - Technical documentation

---

## 📞 SUPPORT

1. Check deployment guides
2. Review Vercel function logs
3. Test API endpoints directly
4. Check browser console (F12)

---

**Ready to deploy?** Follow [DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md) step-by-step.
