# Rate Limit Fix - Deployment Instructions

## Problem

The POS app is hitting rate limits (429 Too Many Requests) because the default limit was too low for a busy POS system.

## Changes Made

### 1. Server Rate Limits Updated (`server/src/index.ts`)

- **General API calls**: Increased from 100 to 500 requests per 15 minutes
- **Login attempts**: Increased from 5 to 20 attempts per 15 minutes
- **Skip rate limiting** for health checks and settings endpoints
- **skipSuccessfulRequests**: Successful logins don't count toward the limit

### 2. API Rate Limits Updated (`api/index.js`)

- **General API calls**: Increased from 100 to 500 requests per 15 minutes
- **Login attempts**: Separate limiter with 20 attempts per 15 minutes
- **Skip rate limiting** for health check endpoints

### 3. CORS Headers Added (`vercel.json`)

- Added explicit CORS headers for all API routes
- Allows credentials and proper methods/headers

## Deployment Steps

### Step 1: Commit Changes

```bash
git add .
git commit -m "Fix: Increase rate limits for POS operations and add CORS headers"
git push origin master
```

### Step 2: Deploy to Vercel

```bash
# If you have Vercel CLI installed:
vercel --prod

# Or push to GitHub and let Vercel auto-deploy
```

### Step 3: Verify Deployment

1. Open https://pizza-pos-server.vercel.app/api/health
2. Check the response - should show current timestamp
3. Try logging in from https://pos.akankha.com
4. Should work without 429 errors now

## Alternative: Manual Vercel Deployment

1. Go to https://vercel.com/dashboard
2. Select your pizza-pos-server project
3. Click "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Select "Use existing Build Cache" = No
6. Click "Redeploy"

## Testing After Deployment

1. Clear browser cache or use incognito mode
2. Go to https://pos.akankha.com
3. Try to login
4. Should work without CORS or rate limit errors

## Rate Limit Breakdown

### Before (Too Strict)

- 100 requests per 15 minutes = ~6.6 requests/minute
- 5 login attempts per 15 minutes
- No skip for health checks

### After (More Reasonable)

- 500 requests per 15 minutes = ~33 requests/minute
- 20 login attempts per 15 minutes
- Successful logins don't count
- Health checks skipped

## Notes

- A busy POS can easily make 30-50 requests/minute during peak hours
- Successful logins now don't count toward the limit
- Health checks and settings fetches are excluded from rate limiting
- CORS is now properly configured for cross-origin requests

## If Issues Persist

### Check Current Rate Limit

Open browser console and check response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the limit resets

### Temporary Fix

If you need immediate relief, you can disable rate limiting temporarily by commenting out the limiter middleware in `server/src/index.ts`:

```typescript
// app.use("/api/", limiter); // Temporarily disabled
```

**Warning**: Only do this temporarily and restore it after fixing the root cause!
