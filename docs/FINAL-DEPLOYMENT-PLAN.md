# 🚀 Pizza POS - Final Deployment Plan

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     POS KIOSK (Windows)                     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │         Electron App (Desktop Application)        │    │
│  │  - Runs locally on touchscreen Windows PC        │    │
│  │  - React frontend embedded                        │    │
│  │  - Fullscreen kiosk mode                         │    │
│  │  - Auto-start on boot                            │    │
│  └───────────────────────────────────────────────────┘    │
│                          │                                  │
│                          │ API Requests                     │
│                          ▼                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
              ┌────────────────────────┐
              │   Vercel (Backend)     │
              │  - Serverless API      │
              │  - /api/* endpoints    │
              └────────────┬───────────┘
                           │
                           │ MySQL Connection
                           ▼
              ┌────────────────────────┐
              │  Hostinger (Database)  │
              │  - MySQL Database      │
              │  - Stores all data     │
              └────────────────────────┘

ADDITIONAL ACCESS:
┌──────────────────┐          ┌──────────────────┐
│  Kitchen Display │  ──────► │   Admin Panel    │
│  (Any Browser)   │          │  (Any Browser)   │
└──────────────────┘          └──────────────────┘
        │                              │
        └──────────────┬───────────────┘
                       │
                       ▼
          https://your-app.vercel.app
```

---

## 📦 What Gets Deployed Where

### 1. **Hostinger** (Database Only)

- ✅ MySQL Database
- ✅ Stores: Menu items, orders, users, settings
- ✅ Accessible remotely by Vercel

### 2. **Vercel** (Backend API + Web Access)

- ✅ Server API (`/api/*` endpoints)
- ✅ Client build (for web access to kitchen/admin)
- ✅ Connects to Hostinger MySQL

### 3. **Local POS Kiosk** (Electron App)

- ✅ Windows touchscreen PC
- ✅ Electron wrapper (fullscreen mode)
- ✅ Connects to Vercel API
- ✅ Auto-starts on boot

---

## 🔧 Deployment Steps

### STEP 1: Setup Hostinger Database (5 minutes)

1. **Login to Hostinger hPanel**
2. **Go to MySQL Databases**
3. **Note your existing database details**:
   ```
   Database: u??????_??????
   Username: u??????_??????
   Password: (your password)
   Host: mysql???.hostinger.com
   ```
4. **Enable Remote MySQL**:

   - Add `%` to allowed hosts
   - This lets Vercel connect

5. **Keep database empty** - Tables will be created automatically

---

### STEP 2: Deploy Backend to Vercel (10 minutes)

#### A. Commit Your Code

```bash
git add .
git commit -m "Final deployment configuration"
git push origin master
```

#### B. Configure Vercel Environment Variables

Go to: **Vercel Dashboard** → **pizza-pos** → **Settings** → **Environment Variables**

Add these (from your Hostinger):

```
DB_HOST=mysql???.hostinger.com
DB_USER=u??????_??????
DB_PASSWORD=your-password-here
DB_NAME=u??????_??????
DB_PORT=3306
NODE_ENV=production
JWT_SECRET=pizza-secret-key-2025-change-this
```

**Important**: Select **Production**, **Preview**, and **Development** for each!

#### C. Redeploy

- Vercel auto-deploys when you push to GitHub
- Or manually: **Deployments** → **Redeploy**

#### D. Test API

```
https://your-app.vercel.app/api/health
```

Should return: `{"status":"ok"}`

---

### STEP 3: Build Electron App for POS Kiosk (15 minutes)

#### A. Update Environment Variables

Create `client/.env.production`:

```
VITE_API_URL=https://your-app.vercel.app
```

Replace `your-app.vercel.app` with your actual Vercel URL!

#### B. Build the Application

Run these commands:

```bash
npm install
npm run build
npm run electron:build
```

This creates Windows installer in `dist/` folder

#### C. Install on POS Kiosk

1. Copy the `.exe` installer to your Windows touchscreen PC
2. Run installer
3. App will be installed to `C:\Program Files\pizza-pos\`

---

### STEP 4: Configure Kiosk Mode (5 minutes)

#### Auto-start on Boot:

1. Press `Win + R`
2. Type: `shell:startup`
3. Create shortcut to: `C:\Program Files\pizza-pos\pizza-pos.exe`

#### Set to Fullscreen Kiosk:

- App automatically opens in fullscreen
- Press `Alt + F4` to exit (for maintenance)
- Or `Ctrl + Q` (if configured)

---

## 🌐 Access Points

### For Staff (POS Kiosk):

```
Local Electron App on Touchscreen PC
- Take orders
- View menu
- Process payments
```

### For Kitchen Display (Any Device):

```
https://your-app.vercel.app/kitchen
- View pending orders
- Mark orders complete
- Auto-refreshes every 3 seconds
```

### For Admin (Any Device):

```
https://your-app.vercel.app/admin/login
- Manage menu
- View reports
- User management
- Settings
```

---

## 📁 Files to Keep vs Delete

### ✅ KEEP (Essential):

- `client/` - Frontend React app
- `server/` - Backend API
- `api/` - Vercel serverless handler
- `electron/` - Electron wrapper for POS
- `shared/` - Shared TypeScript types
- `scripts/` - Build scripts
- `package.json` - Main project config
- `vercel.json` - Vercel deployment config
- `.env.example` - Environment template
- `README.md` - Main documentation

### ❌ DELETE (Unnecessary):

- All other `.md` files (outdated deployment docs)
- `next/` folder (not using Next.js)
- `build.sh`, `install.sh` (if not needed)
- `ecosystem.config.js` (PM2 not needed with Vercel)

---

## 🔐 Environment Variables Summary

### Vercel (Backend):

```env
NODE_ENV=production
DB_HOST=mysql???.hostinger.com
DB_USER=u??????_??????
DB_PASSWORD=your-db-password
DB_NAME=u??????_database
DB_PORT=3306
JWT_SECRET=your-secret-key
```

### Client (Build time):

```env
VITE_API_URL=https://your-app.vercel.app
```

---

## 🚀 Quick Deploy Commands

```bash
# 1. Commit all changes
git add .
git commit -m "Production deployment"
git push origin master

# 2. Build Electron app (run locally)
npm install
npm run build
npm run electron:build

# 3. Deploy complete!
```

---

## ✅ Testing Checklist

After deployment:

- [ ] API health check works
- [ ] Menu loads in Electron app
- [ ] Can create test order
- [ ] Order appears in kitchen display
- [ ] Admin login works
- [ ] Database stores orders correctly
- [ ] Kiosk auto-starts on boot

---

## 🔧 Maintenance

### Update Menu Items:

- Login to admin panel: `https://your-app.vercel.app/admin/login`
- Go to Menu Management
- Add/edit items

### View Orders:

- Kitchen: `https://your-app.vercel.app/kitchen`
- Active orders: `https://your-app.vercel.app/active-orders`

### Update Electron App:

1. Make changes in code
2. Run `npm run electron:build`
3. Reinstall on POS kiosk

---

## 💡 Pro Tips

1. **Backup Database**: Hostinger has automatic backups
2. **Monitor API**: Check Vercel dashboard for errors
3. **Kiosk Restart**: Add restart button in admin panel if needed
4. **Multiple Kiosks**: Install Electron app on multiple PCs, all connect to same Vercel API

---

## 🆘 Support

If something breaks:

1. Check Vercel function logs
2. Check browser console (F12)
3. Verify environment variables
4. Test API endpoints directly
