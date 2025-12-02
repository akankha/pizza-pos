# 🚀 STEP-BY-STEP DEPLOYMENT GUIDE

## Pizza POS System - Production Deployment

---

## 📋 PREREQUISITES

Before starting, have ready:

1. ✅ Hostinger MySQL Database details:

   - Database host (e.g., `mysql123.hostinger.com`)
   - Database name (e.g., `u123456_pizza_pos`)
   - Database username (e.g., `u123456_pizza`)
   - Database password

2. ✅ GitHub account with your code pushed

3. ✅ Vercel account (free) - sign up at https://vercel.com

4. ✅ Windows PC for POS kiosk

---

## 🗄️ STEP 1: PREPARE HOSTINGER DATABASE (5 minutes)

### 1.1 Login to Hostinger

- Go to: https://hpanel.hostinger.com/
- Login with your credentials

### 1.2 Access MySQL Databases

- Click **Databases** in sidebar
- Click **MySQL Databases**

### 1.3 Note Your Database Details

Write down these details (you'll need them for Vercel):

```
DB_HOST: ____________________________
DB_NAME: ____________________________
DB_USER: ____________________________
DB_PASSWORD: ________________________
```

### 1.4 Enable Remote Access

- Find **Remote MySQL** section
- Click **Add New Host**
- Enter: `%` (allows access from anywhere)
- Click **Add Host**

✅ **Done!** Database is ready for connections

---

## 🌐 STEP 2: DEPLOY BACKEND TO VERCEL (10 minutes)

### 2.1 Push Code to GitHub

Open your terminal and run:

```bash
# Navigate to project folder
cd c:\Users\mahmed\Desktop\Practice\pizza-pos

# Add all files
git add .

# Commit changes
git commit -m "Production deployment ready"

# Push to GitHub
git push origin master
```

### 2.2 Connect GitHub to Vercel

1. Go to: https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Click **Import Git Repository**
4. Select **pizza-pos** repository
5. Click **Import**

### 2.3 Configure Build Settings

- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: (leave as default - uses vercel.json)
- **Output Directory**: (leave as default)

Click **Deploy** (will fail first time - that's OK, we need to add variables)

### 2.4 Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add each variable below:

| Key           | Value                  | Where to get it     |
| ------------- | ---------------------- | ------------------- |
| `NODE_ENV`    | `production`           | (type exactly)      |
| `DB_HOST`     | Your Hostinger host    | From Step 1.3       |
| `DB_NAME`     | Your database name     | From Step 1.3       |
| `DB_USER`     | Your database username | From Step 1.3       |
| `DB_PASSWORD` | Your database password | From Step 1.3       |
| `DB_PORT`     | `3306`                 | (type exactly)      |
| `JWT_SECRET`  | `pizza-secret-2025`    | (any random string) |

**IMPORTANT**: For each variable, select:

- ✅ Production
- ✅ Preview
- ✅ Development

Then click **Save**

### 2.5 Redeploy

1. Go to **Deployments** tab
2. Click **•••** on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

### 2.6 Test Your API

Your Vercel URL will be something like:

```
https://pizza-pos-xyz.vercel.app
```

Test these endpoints in your browser:

1. Health check:

```
https://pizza-pos-xyz.vercel.app/api/health
```

Should show: `{"status":"ok","timestamp":"..."}`

2. Menu API:

```
https://pizza-pos-xyz.vercel.app/api/menu
```

Should show: Menu data from database

✅ **Done!** Backend is deployed and working

---

## 💻 STEP 3: BUILD ELECTRON APP FOR POS KIOSK (15 minutes)

### 3.1 Create Production Environment File

In your project folder, create file: `client\.env.production`

```bash
# Replace with your actual Vercel URL from Step 2
VITE_API_URL=https://pizza-pos-xyz.vercel.app
```

**IMPORTANT**: Replace `pizza-pos-xyz.vercel.app` with your actual Vercel URL!

### 3.2 Install Dependencies

Open terminal:

```bash
# Navigate to project
cd c:\Users\mahmed\Desktop\Practice\pizza-pos

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Go back to root
cd ..
```

### 3.3 Build Electron Application

```bash
npm run deploy:electron
```

This will:

- Build the React client
- Create Windows installer
- Output to `dist/` folder

**Wait for build to complete** (takes 2-5 minutes)

### 3.4 Find Your Installer

The installer will be at:

```
dist\pizza-pos Setup 1.0.0.exe
```

Copy this file to a USB drive to install on your POS kiosk PC

✅ **Done!** Electron app is built

---

## 🖥️ STEP 4: INSTALL ON POS KIOSK (10 minutes)

### 4.1 Install the Application

1. Copy `pizza-pos Setup 1.0.0.exe` to your Windows touchscreen PC
2. Run the installer
3. Follow installation wizard
4. App installs to: `C:\Program Files\pizza-pos\`

### 4.2 Test the Application

1. Launch **Pizza POS** from Start Menu
2. App should open fullscreen
3. Test:
   - Browse menu
   - Add items to cart
   - Create test order
   - Check kitchen display (on any browser: https://your-app.vercel.app/kitchen)

### 4.3 Setup Auto-Start (Optional but Recommended)

1. Press `Win + R`
2. Type: `shell:startup` and press Enter
3. Right-click in folder → **New** → **Shortcut**
4. Browse to: `C:\Program Files\pizza-pos\pizza-pos.exe`
5. Click **Next** → **Finish**

Now app auto-starts when Windows boots!

### 4.4 Configure Kiosk Mode (Optional)

For true kiosk mode (prevent users from exiting):

1. Use Windows Shell Launcher
2. Or use third-party kiosk software
3. Set pizza-pos.exe as shell replacement

✅ **Done!** POS is installed and running

---

## 🧪 STEP 5: FINAL TESTING (5 minutes)

### Test Checklist:

From **POS Kiosk**:

- [ ] App loads and shows menu
- [ ] Can add pizzas to cart
- [ ] Can customize pizzas
- [ ] Can add sides/drinks
- [ ] Checkout creates order
- [ ] Order is saved to database

From **Kitchen Display** (https://your-app.vercel.app/kitchen):

- [ ] Can see pending orders
- [ ] Orders auto-refresh every 3 seconds
- [ ] Can mark orders as complete

From **Admin Panel** (https://your-app.vercel.app/admin/login):

- [ ] Can login with default admin (create first user if needed)
- [ ] Can view dashboard
- [ ] Can edit menu items
- [ ] Can view reports
- [ ] Can manage settings

---

## 🎯 ACCESS POINTS SUMMARY

### POS Kiosk (Local Windows App):

```
Electron App on Touchscreen PC
- Fullscreen kiosk mode
- Touch-optimized interface
- Connects to Vercel API
```

### Kitchen Display (Any Browser):

```
https://your-app.vercel.app/kitchen
- View pending orders
- Mark complete
- Auto-refreshes
```

### Admin Panel (Any Browser):

```
https://your-app.vercel.app/admin/login
- Menu management
- Reports
- Settings
- User management
```

---

## 🔧 MAINTENANCE

### Update Menu:

1. Login to admin: https://your-app.vercel.app/admin/login
2. Go to **Menu Management**
3. Edit items, prices, availability

### Update Electron App:

1. Make changes in code
2. Run: `npm run deploy:electron`
3. Copy new installer to POS PC
4. Reinstall

### Update Server (Vercel):

1. Make changes in code
2. Run: `git push origin master`
3. Vercel auto-deploys

### View Logs:

- **Vercel**: Dashboard → Deployments → Function Logs
- **Database**: Hostinger hPanel → phpMyAdmin

---

## 🆘 TROUBLESHOOTING

### Problem: "500 Internal Server Error"

**Solution**:

1. Check Vercel function logs
2. Verify all environment variables are set
3. Check database connection

### Problem: "Cannot connect to API"

**Solution**:

1. Verify `VITE_API_URL` in `client/.env.production`
2. Check Vercel URL is correct
3. Ensure internet connection

### Problem: "Database connection failed"

**Solution**:

1. Verify Hostinger database details
2. Check remote MySQL access is enabled
3. Test connection from phpMyAdmin

### Problem: "Menu not loading"

**Solution**:

1. Check if database has menu items
2. Test API: https://your-app.vercel.app/api/menu
3. Check browser console for errors

---

## ✅ DEPLOYMENT COMPLETE!

Your Pizza POS system is now:

- ✅ Running on local POS kiosk
- ✅ Connected to cloud database (Hostinger)
- ✅ Backend API hosted on Vercel
- ✅ Kitchen display accessible from anywhere
- ✅ Admin panel accessible from anywhere

**Next Steps**:

1. Train staff on POS interface
2. Customize menu in admin panel
3. Test with real orders
4. Monitor system for first week

**Support**: Check FINAL-DEPLOYMENT-PLAN.md for architecture details
