# 🍕 Pizza POS - Production Ready

Modern, cloud-ready Point of Sale system for pizza restaurants with touchscreen kiosk support.

## ✨ Features

- 🖱️ **Touch-optimized** - Perfect for kiosk displays
- ☁️ **Cloud-ready** - Deploy anywhere (Hostinger, DigitalOcean, Railway, etc.)
- 📱 **Admin anywhere** - Manage from phone, tablet, or laptop
- 🔄 **Real-time** - Live order updates with Socket.io
- 🖨️ **Thermal Printer** - Auto-print receipts with Xprinter XP-N160II
- 🎨 **Premium UI** - Glassmorphic design with Poppins/Inter fonts
- 🔒 **Secure** - Admin authentication, HTTPS ready
- 💾 **SQLite** - Zero-config database
- 📊 **Reports** - Sales analytics and order history

---

## 📋 System Requirements

**Server (Cloud/VPS):**
- Node.js 18.x or 20.x LTS
- 2GB RAM minimum, 4GB recommended
- 5GB storage
- Ubuntu 22.04 LTS (recommended)

**Kiosk (Optional - for local deployment):**
- Windows 10/11
- Touchscreen display (optional)
- Chrome browser or Electron
- 4GB RAM

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Access at http://localhost:5173
```

### Production Build

```bash
# Navigate to project root
cd pizza-pos

# Install all dependencies (root, client, and server)
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Run in Development Mode

**Option A: Using npm scripts (recommended)**
```bash
# From project root
npm run dev
```

**Option B: Using PowerShell script (Windows)**
```powershell
# Run the startup script
.\scripts\start-dev.ps1
```

**Option C: Manual start**
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

The application will be available at:
- **Client**: http://localhost:5173
- **Server API**: http://localhost:3001
- **Kitchen View**: http://localhost:5173/kitchen

---

## 🏗️ Building for Production

### Build the application:
```bash
npm run build
```

This will:
1. Build the React client (outputs to `client/dist`)
2. Compile TypeScript server (outputs to `server/dist`)
3. Prepare for Electron packaging

---

## 💻 Windows Kiosk Mode Deployment

### Method 1: Chrome Kiosk Mode (Simple)

1. **Ensure both server and client are running**
2. **Run the kiosk script**:
   ```powershell
   .\scripts\start-kiosk.ps1
   ```

3. **Set up auto-start on Windows login**:
   - Press `Win + R`
   - Type `shell:startup` and press Enter
   - Create a shortcut to `start-kiosk.ps1` in this folder

### Method 2: Electron App (Production)

1. **Build the Electron app**:
   ```bash
   npm run electron:build
   ```

2. **Install the generated `.exe` file** (found in `dist/` folder)

3. **Configure Windows for kiosk mode**:

   **Disable Windows key**:
   - Run `gpedit.msc`
   - Navigate to: User Configuration > Administrative Templates > Windows Components > File Explorer
   - Enable "Turn off Windows Key hotkeys"

   **Auto-login**:
   ```powershell
   netplwiz
   # Uncheck "Users must enter username and password"
   # Set credentials for auto-login
   ```

   **Prevent sleep**:
   ```powershell
   powercfg -change -standby-timeout-ac 0
   powercfg -change -monitor-timeout-ac 0
   ```

   **Auto-start app**:
   - Press `Win + R`, type `shell:startup`
   - Create shortcut to the Electron app

---

## 🎯 Application Features

### Main Screens:

1. **Home Screen** (`/`)
   - New Order button
   - View Active Orders button
   - Kitchen View button

2. **New Order** (`/new-order`)
   - Build a Pizza
   - Sides & Drinks

3. **Pizza Builder** (`/pizza-builder`)
   - Select size (Small, Medium, Large)
   - Select crust (Thin, Regular, Thick, Stuffed)
   - Add toppings (meats, veggies, cheese)
   - Visual pizza preview

4. **Sides & Drinks** (`/sides-drinks`)
   - Quick-select grid for sides
   - Quick-select grid for drinks

5. **Checkout** (`/checkout`)
   - View order summary
   - Edit quantities
   - Payment options: Cash, Card

6. **Kitchen View** (`/kitchen`)
   - Real-time order display
   - Mark orders as completed
   - Auto-refreshes with Socket.io

---

## 🗄️ Database

The application uses SQLite with the following tables:

- **sizes** - Pizza sizes and base prices
- **crusts** - Crust types and price modifiers
- **toppings** - Available toppings with prices
- **menu_items** - Sides and drinks
- **orders** - Customer orders
- **order_items** - Individual items in each order

Database file location: `server/data/pos.db`

**Seed data includes**:
- 3 pizza sizes
- 4 crust types
- 15 toppings
- 6 sides
- 6 drinks

---

## 🔧 Configuration

### Environment Variables

Create `.env` files if needed:

**server/.env**:
```env
PORT=3001
NODE_ENV=development
```

**client/.env**:
```env
VITE_SOCKET_URL=http://localhost:3001
```

### Touch Optimization Settings

All buttons have:
- Minimum size: 60px × 60px
- Large buttons: 80px × 80px
- Touch-action: manipulation (no 300ms delay)
- Large text (20px+)
- Adequate spacing (16px+)

---

## 🎨 Customization

### Colors (in `client/tailwind.config.js`):
```js
pizza: {
  red: '#D32F2F',        // Primary buttons
  orange: '#FF6F00',     // Secondary buttons
  cream: '#FFF8E1',      // Background
  brown: '#5D4037',      // Text
  green: '#388E3C',      // Success buttons
}
```

### Menu Items

Edit seed data in `server/src/db/database.ts`:
- Add/remove pizza sizes
- Modify crust options
- Update toppings
- Change sides/drinks

---

## 🐛 Troubleshooting

### Issue: Server won't start
```bash
# Check if port 3001 is already in use
netstat -ano | findstr :3001

# Kill the process if needed
taskkill /PID <PID> /F
```

### Issue: Client can't connect to server
- Verify server is running on port 3001
- Check firewall settings
- Ensure CORS is properly configured

### Issue: Socket.io not working
- Check browser console for connection errors
- Verify Socket.io server is running
- Check network/firewall settings

### Issue: Touch not working properly
- Ensure touchscreen drivers are installed
- Check Windows touch settings
- Verify touch-action CSS is applied

---

## 📱 Testing on Non-Touch Devices

The app works with mouse/trackpad:
- Click instead of tap
- All interactions are supported
- Use Chrome DevTools to simulate touch (F12 > Toggle device toolbar)

---

## 🖨️ Thermal Printer Setup

**Automatic receipt printing with Xprinter XP-N160II:**

1. **Connect** printer via USB to your Windows kiosk
2. **Test** printer: `node scripts/test-printer.js`
3. **Configure** in Admin Settings → Thermal Printer Settings
4. **Enable** Auto-Print for automatic receipt printing

Receipts print automatically when orders are marked "Ready" or "Completed".

**Full documentation**: See `docs/THERMAL-PRINTER-SETUP.md`

---

## 🔄 Updates & Maintenance

### Update menu prices:
```sql
-- Connect to database
sqlite3 server/data/pos.db

-- Update a topping price
UPDATE toppings SET price = 2.00 WHERE name = 'Pepperoni';
```

### Clear all orders:
```sql
DELETE FROM orders;
DELETE FROM order_items;
```

### Backup database:
```powershell
Copy-Item server\data\pos.db server\data\pos_backup_$(Get-Date -Format 'yyyyMMdd').db
```

---

## 📊 Performance Tips

1. **For single kiosk**: Use SQLite (default)
2. **For multiple kiosks**: Switch to PostgreSQL
3. **Optimize images**: Keep under 100KB each
4. **Clear old orders**: Regularly archive completed orders
5. **Monitor logs**: Check for errors in console

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in browser console (F12)
3. Check server logs in terminal
4. Verify all dependencies are installed

---

## 📄 License

This project is for commercial use in pizza shop operations.

---

## 🎉 Ready to Use!

Your Pizza POS system is now ready to accept orders!

**Default workflow**:
1. Customer taps "New Order"
2. Builds custom pizza or selects sides/drinks
3. Reviews order in checkout
4. Pays with cash/card
5. Kitchen receives order instantly
6. Kitchen marks order complete when ready

Enjoy your new touch-friendly POS system! 🍕
