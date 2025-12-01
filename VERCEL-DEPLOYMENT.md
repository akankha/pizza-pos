# 🚀 Vercel Deployment Guide - Pizza POS

Deploy your Pizza POS system to Vercel for FREE with full backend support.

---

## 🎯 What You Get

- ✅ **FREE** hosting (frontend + backend)
- ✅ **Serverless API** routes (Express → Vercel Functions)
- ✅ **MySQL** support (connect to Hostinger)
- ✅ **HTTPS** automatic SSL
- ✅ **Global CDN** - fast worldwide
- ✅ **Auto-deploy** from GitHub
- ⚠️ **No WebSocket** - Kitchen will auto-refresh instead

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Database

Since Vercel is serverless, you need a hosted MySQL database. Use your Hostinger MySQL:

1. **Login to Hostinger hPanel**
2. **Go to MySQL Databases**
3. **Create Database:**
   - Name: `pizza_pos`
   - Create user with password
   - **Important:** Note these details:
     - Host: `mysql.yourdomain.com` or IP address
     - Username: `u123456_pizza`
     - Password: 2@7EGtXdW
     - Database: `u123456_pizza_pos`

4. **Allow Remote Connections:**
   - In Hostinger → MySQL → Remote MySQL
   - Add `%` or Vercel IPs to allowed hosts

5. **Import Schema:**
   - Use phpMyAdmin or MySQL command line
   - Run your database migration scripts

### Step 2: Setup GitHub Repository

```bash
# If not already initialized
cd /Users/akankha/Documents/Code/pizza-pos
git init
git add .
git commit -m "Initial commit - Pizza POS"

# Create repo on GitHub and push
git remote add origin https://github.com/yourusername/pizza-pos.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Go to Vercel:** https://vercel.com
2. **Sign up** with GitHub
3. **Import Project:**
   - Click "Add New" → "Project"
   - Select your `pizza-pos` repository
   - Click "Import"

4. **Configure Build Settings:**

   **Framework Preset:** Other
   
   **Root Directory:** `./`
   
   **Build Command:**
   ```bash
   npm run build
   ```
   
   **Output Directory:** `client/dist`
   
   **Install Command:**
   ```bash
   npm install
   ```

5. **Add Environment Variables:**

Click "Environment Variables" and add:

```env
NODE_ENV=production
DB_HOST=mysql.yourdomain.com
DB_USER=u123456_pizza
DB_PASSWORD=your-database-password
DB_NAME=u123456_pizza_pos
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456
SESSION_SECRET=your-super-secret-session-key-change-this-too-789012
```

6. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://pizza-pos.vercel.app`

### Step 4: Configure Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Add your domain: `yourdomain.com`
   
2. **In Hostinger DNS:**
   - Add CNAME record:
     - Name: `@` or `www`
     - Value: `cname.vercel-dns.com`

---

## 🔧 Project Structure Updates Needed

Your current Express server needs minor modifications for Vercel's serverless functions.

### Update `package.json`:

Add these scripts:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm install && npm run build",
    "build:server": "cd server && npm install && npm run build",
    "vercel-build": "npm run build"
  }
}
```

### Create API Route Handlers

Vercel serverless functions work differently. Each route needs to be a separate file in `/api` directory.

---

## 🌐 Alternative: Netlify Deployment

Netlify also works but has limitations:

### Netlify Pros:
- ✅ FREE tier
- ✅ Netlify Functions (serverless)
- ✅ Good for static sites

### Netlify Cons:
- ❌ Functions limited to 10 seconds execution
- ❌ More complex backend setup
- ❌ Smaller free tier limits

### Vercel vs Netlify for Your App:

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **Backend API** | ✅ Excellent | ⚠️ Limited |
| **Build Time** | ✅ Fast | ✅ Fast |
| **Free Tier** | ✅ Generous | ⚠️ Smaller |
| **MySQL Support** | ✅ Yes | ✅ Yes |
| **Best For** | **Full-stack apps** | Static sites |

**Recommendation:** Use **Vercel** for your Pizza POS system.

---

## 🔄 Handling Real-time Updates (No WebSocket)

Since Vercel doesn't support persistent WebSocket connections, update your kitchen display:

### Update Kitchen to Poll Instead:

```typescript
// client/src/hooks/useSocket.ts
// Replace WebSocket with polling for Vercel deployment

import { useEffect, useState } from 'react';

export function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(true);
    
    // Poll for updates every 5 seconds
    const interval = setInterval(async () => {
      // Trigger kitchen refresh
      window.dispatchEvent(new CustomEvent('refreshOrders'));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { connected };
}
```

### Update Kitchen Page:

```typescript
// client/src/pages/KitchenViewPage.tsx
useEffect(() => {
  const handleRefresh = () => {
    // Reload orders
    loadOrders();
  };

  window.addEventListener('refreshOrders', handleRefresh);
  return () => window.removeEventListener('refreshOrders', handleRefresh);
}, []);
```

---

## 💡 Cost Comparison

### Free Options:

| Platform | Frontend | Backend | Database | Total |
|----------|----------|---------|----------|-------|
| **Vercel** | ✅ Free | ✅ Free | Hostinger MySQL | **$0** |
| **Netlify** | ✅ Free | ⚠️ Limited | Hostinger MySQL | **$0** |
| **Railway** | ❌ | ✅ Free 500hrs | Extra cost | **~$5** |

### Paid Options:

| Platform | Cost | Features |
|----------|------|----------|
| **Hostinger VPS** | $4-8/mo | Full Node.js + WebSocket |
| **DigitalOcean** | $6/mo | Full control |
| **Vercel Pro** | $20/mo | More serverless limits |

---

## 🎯 Recommended Setup

**For Your Restaurant (Production):**

1. **Hosting:** Vercel (FREE)
2. **Database:** Hostinger MySQL (included with your hosting)
3. **Domain:** Your Hostinger domain
4. **Total Cost:** $0/month (uses existing Hostinger plan)

**Upgrade Later If Needed:**
- More orders → Vercel Pro ($20/mo)
- Need WebSocket → Hostinger VPS ($4-8/mo)

---

## 🚀 Quick Deploy Commands

```bash
# 1. Install Vercel CLI (optional - for command line deploy)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd /Users/akankha/Documents/Code/pizza-pos
vercel

# 4. Set environment variables
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel env add JWT_SECRET
vercel env add SESSION_SECRET

# 5. Deploy to production
vercel --prod
```

---

## 📞 Next Steps

1. **Choose deployment method:**
   - Via GitHub (recommended - auto-deploy)
   - Via Vercel CLI (manual)

2. **Prepare database:**
   - Setup Hostinger MySQL
   - Import schema
   - Enable remote access

3. **Deploy & test:**
   - Push to GitHub or run `vercel`
   - Test all features
   - Configure custom domain

**Ready to deploy? Let me know if you need help with any step!**
