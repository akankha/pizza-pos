# ⚡ Quick Deployment Guide - Hostinger + Vercel Setup

## 🎯 What Goes Where

```
Hostinger:  Client (HTML/CSS/JS) + MySQL Database
Vercel:     Server API only
Electron:   Loads from Hostinger website
```

---

## 📝 Step-by-Step Deployment

### STEP 1: Deploy Server to Vercel (10 mins)

```bash
# Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin master
```

**In Vercel Dashboard:**

1. Import your GitHub repo
2. Add environment variables:
   ```
   NODE_ENV=production
   DB_HOST=your-hostinger-mysql-host
   DB_USER=your-mysql-username
   DB_PASSWORD=your-mysql-password
   DB_NAME=your-database-name
   DB_PORT=3306
   JWT_SECRET=your-secret-key
   CLIENT_URL=https://yourdomain.com
   ```
3. Deploy

**Your API will be at:** `https://your-app.vercel.app/api/*`

---

### STEP 2: Build Client for Hostinger (5 mins)

**Create** `client/.env.production`:

```
VITE_API_URL=https://your-app.vercel.app
```

**Build:**

```bash
npm run deploy:hostinger
```

This creates `client/dist` folder.

---

### STEP 3: Upload Client to Hostinger (10 mins)

1. **Login to Hostinger hPanel**
2. **File Manager** → Go to `public_html`
3. **Upload everything from** `client/dist/`:
   - `index.html`
   - `assets/` folder
   - All files

**Your website will be at:** `https://yourdomain.com`

---

### STEP 4: Test Everything (5 mins)

✅ **Main site:** `https://yourdomain.com`  
✅ **Kitchen:** `https://yourdomain.com/kitchen`  
✅ **Admin:** `https://yourdomain.com/admin/login`  
✅ **API:** `https://your-app.vercel.app/api/health`

---

### STEP 5: Build Electron App (Optional - for POS kiosk)

**Windows:**

```cmd
set CLIENT_URL=https://yourdomain.com
npm run deploy:electron
```

**PowerShell:**

```powershell
$env:CLIENT_URL="https://yourdomain.com"
npm run deploy:electron
```

Install the `.exe` on your Windows POS PC.

---

## 🔄 Update Workflow

### Update Website (UI changes):

```bash
npm run deploy:hostinger
# Then upload client/dist to Hostinger
```

### Update API (Backend changes):

```bash
git push origin master
# Vercel auto-deploys
```

### Update Electron:

```bash
npm run deploy:electron
# Then reinstall on POS PC
```

---

## 🌐 Final Setup

```
┌──────────────────────────────────────┐
│         yourdomain.com               │
│      (Hostinger - Client)            │
│  - Main website                      │
│  - Kitchen display                   │
│  - Admin panel                       │
└──────────────────────────────────────┘
              ↓ API calls
┌──────────────────────────────────────┐
│    your-app.vercel.app/api           │
│      (Vercel - Server)               │
│  - All API endpoints                 │
└──────────────────────────────────────┘
              ↓ Database
┌──────────────────────────────────────┐
│      Hostinger MySQL                 │
│  - Stores all data                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│    POS Kiosk (Electron)              │
│  Loads: yourdomain.com               │
│  Connects to: vercel API             │
└──────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Vercel deployed with environment variables
- [ ] Client built with correct VITE_API_URL
- [ ] Client uploaded to Hostinger
- [ ] Database configured in Hostinger
- [ ] Website loads at yourdomain.com
- [ ] API works at your-app.vercel.app/api/health
- [ ] Electron app built with CLIENT_URL
- [ ] Everything tested

**Done!** Your POS system is live! 🎉
