# 🌐 Deploy Client to Hostinger

## Step 1: Build the Client

In your project folder, run:

```bash
cd client
npm install
npm run build
```

This creates the `client/dist` folder with all your static files.

---

## Step 2: Upload to Hostinger

### Option A: Using File Manager (Easier)

1. **Login to Hostinger hPanel**
2. **Go to File Manager**
3. **Navigate to** `public_html` (or your domain folder)
4. **Upload entire `client/dist` folder contents**:
   - `index.html`
   - `assets/` folder
   - All other files from `client/dist`

### Option B: Using FTP

1. **Get FTP credentials** from Hostinger hPanel
2. **Use FileZilla or similar FTP client**
3. **Upload `client/dist/*` to** `public_html/`

---

## Step 3: Configure Environment Variables

### A. For Vercel (Backend API)

Add this in Vercel Dashboard → Settings → Environment Variables:

```
CLIENT_URL=https://yourdomain.com
```

Replace `yourdomain.com` with your actual Hostinger domain!

### B. Update Client Build

Before building, create `client/.env.production`:

```
VITE_API_URL=https://your-vercel-app.vercel.app
```

Then rebuild:

```bash
cd client
npm run build
```

And re-upload to Hostinger.

---

## Step 4: Configure Electron for Hostinger

Before building Electron app, set environment variable:

**Windows PowerShell:**

```powershell
$env:CLIENT_URL="https://yourdomain.com"
npm run deploy:electron
```

**Or create a file** `electron/.env`:

```
CLIENT_URL=https://yourdomain.com
```

Then build:

```bash
npm run deploy:electron
```

---

## Step 5: Test Everything

### Test Website:

```
https://yourdomain.com/
```

Should show your POS interface

### Test Kitchen:

```
https://yourdomain.com/kitchen
```

### Test Admin:

```
https://yourdomain.com/admin/login
```

### Test API:

```
https://your-vercel-app.vercel.app/api/health
```

---

## 🔄 Update Workflow

### Update Client (UI changes):

1. Make changes in code
2. Run: `npm run build` (in client folder)
3. Upload `client/dist/*` to Hostinger
4. Electron app will automatically use new version!

### Update Server (API changes):

1. Make changes in code
2. Run: `git push origin master`
3. Vercel auto-deploys

---

## 📁 Hostinger File Structure

```
public_html/
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-def456.css
│   └── ...
└── .htaccess (optional)
```

---

## 🔧 Optional: .htaccess for React Router

Create `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures React Router works with direct URL access.

---

## ✅ Complete Setup Summary

```
┌─────────────────────────────────┐
│  POS Kiosk (Electron)          │
│  Loads: https://yourdomain.com │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Hostinger                      │
│  - Client files (HTML/JS/CSS)  │
│  - MySQL Database              │
└─────────────────────────────────┘
           ↓ API Calls
┌─────────────────────────────────┐
│  Vercel                         │
│  - Backend API only            │
│  - /api/* endpoints            │
└─────────────────────────────────┘
```

**Benefits:**

- ✅ Easy to update UI (just re-upload to Hostinger)
- ✅ No need to reinstall Electron app
- ✅ Kitchen/Admin accessible from anywhere
- ✅ Everything on your own domain
