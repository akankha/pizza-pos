# 🚀 Vercel Deployment - Quick Commands

## Initial Setup (One-Time)

```bash
# 1. Push to GitHub
cd /Users/akankha/Documents/Code/pizza-pos
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/pizza-pos.git
git push -u origin main

# 2. Deploy to Vercel (visit vercel.com and import your GitHub repo)
```

## Environment Variables to Add in Vercel

```env
NODE_ENV=production
DB_HOST=mysql.yourdomain.com
DB_USER=u123456_pizza
DB_PASSWORD=your-password
DB_NAME=u123456_pizza_pos
DB_PORT=3306
JWT_SECRET=your-32-char-secret-here-min-32-chars-1234567890
SESSION_SECRET=your-32-char-secret-here-min-32-chars-0987654321
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Test Build Locally

```bash
npm run vercel-build
```

## Update Deployment

```bash
git add .
git commit -m "Your update message"
git push
# Vercel auto-deploys!
```

## Your URLs

- **Vercel Default:** https://pizza-pos-YOUR_USERNAME.vercel.app
- **Custom Domain:** https://yourdomain.com (after DNS setup)
- **API Endpoint:** https://your-domain.com/api/*
- **Admin Panel:** https://your-domain.com/admin/login

## Default Admin Login

- Username: `admin`
- Password: `admin123`
- **⚠️ CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!**

## Features

✅ Full restaurant POS system
✅ 4 order types (custom, specialty, combos, sides)
✅ Kitchen display (auto-refresh 5 sec)
✅ Admin panel with RBAC
✅ Order management
✅ Menu management
✅ User management
✅ Reports & analytics

## Support

- 📖 Full Guide: `DEPLOY-TO-VERCEL.md`
- 🌐 Vercel Docs: https://vercel.com/docs
- 💬 Issues: Check deployment logs in Vercel dashboard
