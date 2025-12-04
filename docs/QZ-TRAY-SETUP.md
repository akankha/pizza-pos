# QZ Tray Setup Guide - Auto-Print from Browser

## What is QZ Tray?

QZ Tray is a **free, open-source** tool that allows web browsers to communicate directly with USB printers (including thermal printers like MUNBYN).

### Why QZ Tray is Perfect for Your Setup:

✅ **Works in ANY web browser** (Chrome, Edge, Firefox)  
✅ **No Electron app needed** - Use pos.akankha.com directly  
✅ **Direct USB printer access** from browser  
✅ **Supports ESC/POS thermal printers**  
✅ **Free for commercial use**  
✅ **Easy deployment** - Just install and run  
✅ **Works on kiosk touchscreen**

---

## Setup Instructions

### Step 1: Deploy Updated Client Code

On your **development machine**:

```cmd
cd c:\Users\mahmed\Desktop\Practice\pizza-pos\client
npm install
npm run build
```

Then deploy the `dist` folder to Vercel:

```cmd
# Commit and push changes
cd c:\Users\mahmed\Desktop\Practice\pizza-pos
git add .
git commit -m "Add QZ Tray printing support"
git push origin master
```

Vercel will auto-deploy to https://pos.akankha.com

---

### Step 2: Install QZ Tray on Production Machine

On the **production machine** (kiosk with MUNBYN printer):

1. **Download QZ Tray:**

   - Visit: https://qz.io/download/
   - Download: **QZ Tray for Windows**
   - File: `qz-tray-X.X.X.exe` (about 50 MB)

2. **Install QZ Tray:**

   - Double-click the installer
   - Click "Next" → "Install"
   - Leave "Start QZ Tray" checked
   - Click "Finish"

3. **Verify QZ Tray is Running:**
   - Look for QZ Tray icon in system tray (bottom-right)
   - Icon looks like: 📦 (cube icon)
   - Should show "QZ Tray is running"

---

### Step 3: Connect MUNBYN Printer

1. **Plug in printer:**

   - Connect MUNBYN printer via USB
   - Power ON the printer
   - Wait for Windows to detect it

2. **Set as Default Printer (Optional but recommended):**
   - Settings → Devices → Printers & Scanners
   - Find MUNBYN printer
   - Click → Set as default

---

### Step 4: Test Auto-Print

1. **Open the POS in browser:**

   - Open Chrome or Edge
   - Go to: https://pos.akankha.com
   - You can use full-screen mode: Press F11

2. **First-time Certificate Trust:**

   - When you complete first order, QZ Tray will show a popup:
     ```
     "pos.akankha.com wants to use QZ Tray"
     ☑️ Remember this decision
     [Allow] [Block]
     ```
   - **IMPORTANT: Check "Remember this decision"** ✅
   - Click **"Allow"**

3. **Create test order:**

   - New Order → Add items
   - Checkout → Select payment
   - Complete order

4. **Receipt should auto-print!** 🎉

---

## IMPORTANT: Stop the "Allow" Popup Every Time

The popup says "An anonymous request wants to connect to QZ Tray - Untrusted website". Here's how to fix it permanently:

### Solution: Check "Remember this decision" Box

When the popup appears:

1. **CHECK the box** ☑️ "Remember this decision" (bottom of popup)
2. Click **"Allow"** button
3. Done! It won't ask again

**Important:** You MUST check the "Remember this decision" checkbox, otherwise it will ask every single time.

---

### If Checkbox Doesn't Stay Checked (Troubleshooting)

Some QZ Tray versions have a bug where the checkbox doesn't work. Try these:

**Option 1: Whitelist in Site Manager**

1. After clicking "Allow" once, right-click QZ Tray icon
2. Click "Site Manager"
3. You should see your site listed as "Allowed (1)"
4. If not, complete another order and check the box again

**Option 2: Downgrade QZ Tray (if still asking)**

- Uninstall current QZ Tray
- Download QZ Tray 2.1.x from: https://github.com/qzind/tray/releases
- Install and test

**Option 3: Use Kiosk Browser with Auto-Allow**

- Install Chrome in kiosk mode
- Set to always allow QZ Tray connections
- See "Browser Kiosk Mode" section below

---

## Verification & Troubleshooting

### Check QZ Tray Status

Open browser console (F12) after completing order:

**✅ Success - You'll see:**

```
🖨️  Attempting to print via QZ Tray...
🔌 Connecting to QZ Tray...
✅ Connected to QZ Tray
🖨️  Available printers: ["MUNBYN ITPP072", "Microsoft Print to PDF"]
✅ Found thermal printer: MUNBYN ITPP072
🖨️  Formatting receipt...
🖨️  Sending to printer: MUNBYN ITPP072
✅ Receipt printed successfully via QZ Tray
```

**❌ Error: "QZ Tray not connected"**

**Fix:**

1. Check QZ Tray is running (system tray icon)
2. If not running:
   - Start Menu → QZ Tray
   - Or reboot production machine
3. Refresh browser page
4. Try order again

**❌ Error: "No printer found"**

**Fix:**

1. Make sure MUNBYN printer is:
   - Plugged into USB
   - Powered ON
   - Detected by Windows (check Device Manager)
2. Restart QZ Tray:
   - Right-click QZ Tray icon → Exit
   - Start Menu → QZ Tray
3. Refresh browser
4. Try again

**❌ Error: Certificate/Security Warning**

**Fix:**

1. When QZ Tray asks for permission, click "Allow"
2. Check "Remember this decision"
3. If you accidentally clicked "Block":
   - Right-click QZ Tray icon → Site Manager
   - Find pos.akankha.com → Remove
   - Refresh browser and try again

---

## Auto-Start QZ Tray on Boot

For kiosk setup, make QZ Tray start automatically:

1. Press `Win + R` → type `shell:startup` → Enter
2. Right-click in folder → New → Shortcut
3. Browse to: `C:\Program Files\QZ Tray\qz-tray.exe`
4. Click OK → Name it "QZ Tray"
5. Restart PC to test

---

## Browser Full-Screen Kiosk Mode

Instead of Electron, use browser in kiosk mode:

### Option A: Chrome Kiosk Mode

Create shortcut with:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=https://pos.akankha.com
```

### Option B: Edge Kiosk Mode

Create shortcut with:

```
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk --app=https://pos.akankha.com
```

**Features:**

- Full-screen (no address bar)
- No browser UI
- Exit with Alt+F4
- Works exactly like Electron app!

---

## Production Deployment Checklist

On the **kiosk machine:**

- [ ] Install QZ Tray from https://qz.io/download/
- [ ] Set QZ Tray to auto-start (shell:startup)
- [ ] Connect MUNBYN printer via USB
- [ ] Power ON printer
- [ ] Set MUNBYN as default printer
- [ ] Open https://pos.akankha.com in browser
- [ ] Allow QZ Tray certificate (click "Allow")
- [ ] Test order → should auto-print
- [ ] (Optional) Create kiosk mode shortcut
- [ ] (Optional) Set browser to auto-start on boot

---

## Advantages Over Electron

| Feature      | Electron App          | QZ Tray               |
| ------------ | --------------------- | --------------------- |
| Installation | Custom .exe installer | Standard Windows app  |
| Updates      | Rebuild & reinstall   | Just push to Vercel   |
| File Size    | 100-150 MB            | 50 MB                 |
| Deployment   | Complex build process | Install once, done    |
| Menu Updates | Automatic from server | Automatic from server |
| Printing     | USB via custom code   | USB via QZ Tray       |
| Debugging    | Need dev tools        | Browser console (F12) |
| Maintenance  | Harder                | Easier                |

---

## Cost & Licensing

**QZ Tray:**

- ✅ **FREE** for commercial use
- ✅ Open source (LGPL license)
- ✅ No subscription fees
- ✅ Unlimited printers
- ✅ Lifetime updates

---

## Support & Documentation

- **QZ Tray Website:** https://qz.io/
- **Documentation:** https://qz.io/wiki/
- **Community Forum:** https://qz.io/support/
- **GitHub:** https://github.com/qzind/tray

---

## Quick Start Summary

### Development Machine:

```cmd
cd c:\Users\mahmed\Desktop\Practice\pizza-pos\client
npm install
npm run build
git add .
git commit -m "Add QZ Tray support"
git push
```

### Production Machine:

1. Download & install QZ Tray: https://qz.io/download/
2. Connect MUNBYN printer via USB
3. Open https://pos.akankha.com
4. Complete test order
5. Click "Allow" when QZ Tray asks
6. Receipt should print! ✅

---

## Fallback Option

If QZ Tray fails, users can still:

- Download PDF receipt (existing feature)
- Print manually with Ctrl+P

The system won't break - printing just becomes manual.

---

**You now have a much simpler, more maintainable solution!** 🎉

No more Electron builds, no more complex deployment. Just install QZ Tray once on the kiosk, and everything works through the browser.
