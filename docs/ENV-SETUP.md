# Environment Variables Setup Guide

## Overview

This project uses environment variables to configure API URLs for different environments (development, production).

## Files Created

1. `client/src/utils/api.ts` - Centralized API configuration
2. `client/.env.production` - Production environment variables
3. `client/.env.local` - Local development environment variables (git-ignored)

## How It Works

### Development (Local)

- Uses `client/.env.local`
- API calls go to `http://localhost:3001`
- Vite dev server automatically loads `.env.local` file

### Production (Vercel)

- Uses `VITE_API_URL` environment variable set in Vercel dashboard
- API calls go to your deployed API server (e.g., `https://pizza-pos-server.vercel.app`)

## Setting Up Environment Variables in Vercel

### For Client Deployment (pos.akankha.com)

1. **Go to Vercel Dashboard**

   - Navigate to your client project: https://vercel.com/akankha/pizza-pos (or your client project)

2. **Go to Settings → Environment Variables**

   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add Environment Variables**

   | Name              | Value                                 | Environment |
   | ----------------- | ------------------------------------- | ----------- |
   | `VITE_API_URL`    | `https://pizza-pos-server.vercel.app` | Production  |
   | `VITE_SOCKET_URL` | `https://pizza-pos-server.vercel.app` | Production  |

4. **Important Settings**

   - Select **"Production"** environment
   - Do NOT select "Preview" or "Development" unless needed
   - Click "Save"

5. **Redeploy**
   - After adding environment variables, you MUST redeploy
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"
   - OR push a new commit to trigger deployment

### For API Server Deployment (pizza-pos-server.vercel.app)

Already configured with database credentials:

| Name          | Value                  |
| ------------- | ---------------------- |
| `DB_HOST`     | `82.180.138.204`       |
| `DB_PORT`     | `3306`                 |
| `DB_USER`     | `u794866438_pizza_pos` |
| `DB_PASSWORD` | `2@7EGtXdW`            |
| `DB_NAME`     | `u794866438_pizza_pos` |
| `JWT_SECRET`  | `your-secret-key-here` |

## Using API Utils in Client Code

### Import the utility

```typescript
import { apiUrl, authFetch } from "../utils/api";
```

### For public endpoints (no auth required)

```typescript
const response = await fetch(apiUrl("/api/menu/sizes"));
```

### For protected endpoints (requires auth token)

```typescript
const response = await authFetch("/api/admin/stats");
```

## Migration Checklist

To update all client pages to use environment variables:

- [x] Created `client/src/utils/api.ts`
- [x] Created `client/.env.production`
- [x] Created `client/.env.local`
- [x] Updated `KitchenViewPage.tsx`
- [ ] Update `CheckoutPage.tsx`
- [ ] Update `AdminLoginPage.tsx`
- [ ] Update `AdminDashboardPage.tsx`
- [ ] Update `AdminUsersPage.tsx`
- [ ] Update `AdminSettingsPage.tsx`
- [ ] Update `AdminReportsPage.tsx`
- [ ] Update `AdminMenuPage.tsx`
- [ ] Update all other pages with API calls

## Testing

### Local Development

```bash
cd client
npm run dev
# Should use http://localhost:3001 for API calls
```

### Production Build (Local Test)

```bash
cd client
npm run build
npm run preview
# Should use https://pizza-pos-server.vercel.app for API calls
```

### Verify in Browser

Open browser console and check Network tab:

- **Local dev**: API calls should go to `localhost:3001`
- **Production**: API calls should go to `pizza-pos-server.vercel.app`

## Troubleshooting

### Issue: API calls still going to pos.akankha.com/api

**Solution**: Environment variables not set in Vercel or deployment not triggered after setting them.

1. Verify variables are set in Vercel dashboard
2. Redeploy the application
3. Check build logs for environment variable loading

### Issue: CORS errors

**Solution**: Make sure API server has CORS configured for your client domain:

```javascript
// In api/index.js
app.use(
  cors({
    origin: ["https://pos.akankha.com", "http://localhost:5173"],
    credentials: true,
  })
);
```

### Issue: Environment variables not loading

**Solution**:

- Environment variables MUST start with `VITE_` prefix
- Rebuild the application after changing `.env` files
- For Vercel, ensure variables are set in dashboard, not just in `.env` files

## Security Notes

- `.env.local` is git-ignored (don't commit it)
- `.env.production` can be committed (contains public API URL)
- Never commit sensitive keys (use Vercel dashboard for secrets)
- API URL is public information (not sensitive)
