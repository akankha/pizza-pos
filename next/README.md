# 🍕 Pizza POS - Next.js Version

Complete Next.js 15 recreation with all features - **much easier to deploy!**

## ✅ What's Built

- ✅ Home page (4 main buttons)
- ✅ New Order page (category selection)  
- ✅ API routes (menu, auth, orders)
- ✅ Database connection (MySQL)
- ✅ State management (Zustand)
- ✅ Touch UI components
- 🔄 All other pages (in progress - 30% complete)

## 🚀 Run Locally

```bash
cd next
npm install
npm run dev
# Open http://localhost:3000
```

## 🚢 Deploy to Vercel

**ONE COMMAND:**
```bash
cd next
vercel
```

Add environment variables in Vercel dashboard:
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- JWT_SECRET, SESSION_SECRET

**That's it! Much simpler than the original 2-app structure.**

## ✨ Why Next.js?

- ✅ Single application (not client + server)
- ✅ Built-in API routes (no separate Express server)
- ✅ One build process
- ✅ Easier Vercel deployment
- ✅ Same database, same features, simpler structure

**Status:** Core foundation complete. Copying remaining pages from original app...
