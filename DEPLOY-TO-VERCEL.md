# 🚀 Quick Deployment Guide to Vercel

## ✅ Pre-Deployment Checklist

Your project is now ready for Vercel! Here's what was configured:

- ✅ `vercel.json` - Routing configuration
- ✅ `package.json` - Build scripts added
- ✅ `api/index.js` - Serverless function wrapper
- ✅ `.vercelignore` - Exclude unnecessary files
- ✅ `.env.production.example` - Environment variables template
- ✅ Kitchen polling - 5-second auto-refresh (no WebSocket needed)

---

## 📋 Step 1: Setup Hostinger MySQL Database

### 1.1 Create Database

1. Login to **Hostinger hPanel**: https://hpanel.hostinger.com
2. Go to: **Hosting** → **Manage** → **MySQL Databases**
3. Click **Create New Database**
4. Note these credentials:
   ```
   Host: mysql.yourdomain.com (or IP like 123.45.67.89)
   Username: u123456_pizza (auto-generated)
   Password: (your password)
   Database: u123456_pizza_pos
   Port: 3306
   ```

### 1.2 Enable Remote Access

1. In Hostinger → **MySQL Databases** → **Remote MySQL**
2. Add allowed host: `%` (allows all) or specific Vercel IPs
3. Save changes

### 1.3 Import Database Schema

Run this script to create tables:

```bash
# Connect to your Hostinger MySQL
mysql -h mysql.yourdomain.com -u u123456_pizza -p u123456_pizza_pos

# Or use phpMyAdmin in Hostinger hPanel
```

Then run the menu import:

```bash
cd /Users/akankha/Documents/Code/pizza-pos/server
npm run import-menu
```

---

## 📋 Step 2: Push to GitHub

```bash
cd /Users/akankha/Documents/Code/pizza-pos

# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for Vercel deployment"

# Create repository on GitHub
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/pizza-pos.git
git branch -M main
git push -u origin main
```

---

## 📋 Step 3: Deploy to Vercel

### 3.1 Via Vercel Website (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign Up/Login** with GitHub
3. **Click "Add New" → "Project"**
4. **Select your repository**: `pizza-pos`
5. **Configure Build Settings:**

   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `client/dist`
   - **Install Command:** `npm install`

6. **Add Environment Variables** (click "Environment Variables" tab):

   ```env
   NODE_ENV=production
   DB_HOST=mysql.yourdomain.com
   DB_USER=u123456_pizza
   DB_PASSWORD=your-database-password
   DB_NAME=u123456_pizza_pos
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-12345678901234567890
   SESSION_SECRET=your-super-secret-session-key-min-32-chars-09876543210987654321
   ```

   **Important:** Use strong, unique secrets! Generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

7. **Click "Deploy"**

8. **Wait 2-3 minutes** for deployment to complete

9. **Your app will be live at:**
   ```
   https://pizza-pos-YOUR_USERNAME.vercel.app
   ```

### 3.2 Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /Users/akankha/Documents/Code/pizza-pos
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? pizza-pos
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add DB_HOST
# Enter value: mysql.yourdomain.com

vercel env add DB_USER
# Enter value: u123456_pizza

vercel env add DB_PASSWORD
# Enter password

vercel env add DB_NAME
# Enter value: u123456_pizza_pos

vercel env add DB_PORT
# Enter value: 3306

vercel env add JWT_SECRET
# Enter strong secret (min 32 chars)

vercel env add SESSION_SECRET
# Enter strong secret (min 32 chars)

# Deploy to production
vercel --prod
```

---

## 📋 Step 4: Test Your Deployment

1. **Open your Vercel URL**: `https://pizza-pos-YOUR_USERNAME.vercel.app`

2. **Test these features:**
   - ✅ Home page loads
   - ✅ Create new order
   - ✅ Add custom pizza
   - ✅ Add specialty pizza
   - ✅ Add combo deal
   - ✅ Checkout process
   - ✅ Kitchen view (refreshes every 5 seconds)
   - ✅ Admin login

3. **Check Admin Panel:**
   - Login: `admin` / `admin123` (change this!)
   - Go to Users → Create new users
   - Test all admin features

---

## 📋 Step 5: Setup Custom Domain (Optional)

### 5.1 In Vercel Dashboard

1. Go to your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `yourdomain.com` or `pos.yourdomain.com`
4. Click **Add**

### 5.2 In Hostinger DNS

1. Go to **Hostinger hPanel** → **DNS / Name Servers**
2. Click **DNS Records**
3. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: @ (or subdomain like 'pos')
   Points to: cname.vercel-dns.com
   TTL: 3600
   ```
4. Save and wait 1-24 hours for DNS propagation

### 5.3 Verify

Vercel will automatically provision SSL certificate. Your site will be live at:
```
https://yourdomain.com
```

---

## 🔄 Updating Your Application

### Auto-Deploy (Recommended)

Every time you push to GitHub, Vercel automatically deploys:

```bash
cd /Users/akankha/Documents/Code/pizza-pos

# Make changes...

git add .
git commit -m "Update: description of changes"
git push

# Vercel auto-deploys in 2-3 minutes!
```

### Manual Deploy

```bash
vercel --prod
```

---

## 🐛 Troubleshooting

### Build Fails

**Check build logs in Vercel dashboard:**
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility
- Review error messages

**Common fixes:**
```bash
# Locally test build
npm run vercel-build

# If fails, check:
npm install
npm run build:client
npm run build:server
```

### Database Connection Issues

**Error:** "Cannot connect to database"

**Solutions:**
1. Verify environment variables in Vercel dashboard
2. Check Hostinger MySQL is accessible remotely
3. Verify credentials are correct
4. Test connection:
   ```bash
   mysql -h mysql.yourdomain.com -u u123456_pizza -p
   ```

### API Routes Not Working

**Check:**
1. Vercel logs for errors
2. API routes are under `/api/*`
3. Server built successfully (`server/dist/` exists)

### Kitchen Display Not Updating

**Expected behavior:**
- Kitchen auto-refreshes every 5 seconds
- Not instant (WebSocket not supported on Vercel)
- For real-time updates, consider Hostinger VPS

---

## 💰 Cost Breakdown

### Free Tier (Hobby Plan)

✅ **Included:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function executions
- Automatic HTTPS
- Global CDN

⚠️ **Limits:**
- 1 team member
- 6,000 build minutes/month
- 100 GB-hours serverless function execution

### If You Exceed Free Tier

Upgrade to **Pro Plan: $20/month**
- Increased limits
- Team collaboration
- Priority support

### Total Monthly Cost

- **Vercel:** $0 (or $20 if Pro)
- **Hostinger MySQL:** $0 (included with hosting)
- **Domain:** $0 (if using Hostinger domain)

**Total: $0-20/month**

---

## 🎉 You're Live!

Your Pizza POS is now deployed and accessible worldwide!

**Next Steps:**
1. Change default admin password
2. Add your menu items via Admin panel
3. Train staff on the system
4. Monitor performance in Vercel Analytics

**Need Help?**
- Check Vercel docs: https://vercel.com/docs
- Review deployment logs
- Test locally first: `npm run dev`

---

🍕 **Happy Pizza Making!** 🍕
