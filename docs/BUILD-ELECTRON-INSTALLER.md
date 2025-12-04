# Build Electron Installer for Production Machine

## Overview

Since your printer is only on the production machine, you need to:

1. Build the Electron installer on your dev machine
2. Copy the installer to production machine
3. Install and test on production machine with the MUNBYN printer

---

## Step 1: Build the Installer (On Development Machine)

Run these commands in your development machine:

```cmd
cd c:\Users\mahmed\Desktop\Practice\pizza-pos

# Install all dependencies
npm install

# Build the client (React app)
cd client
npm install
npm run build
cd ..

# Build the Electron installer
npm run electron:build
```

**What this does:**

- Installs Electron and printer packages
- Builds the React client app
- Packages everything into a Windows installer

**Build time:** 2-5 minutes

**Output location:**

```
c:\Users\mahmed\Desktop\Practice\pizza-pos\dist\
```

You'll find:

- `Pizza POS Setup 1.0.0.exe` - Main installer (50-150 MB)

---

## Step 2: Transfer to Production Machine

**Option A: USB Drive**

1. Copy `dist\Pizza POS Setup 1.0.0.exe` to USB drive
2. Plug USB into production machine
3. Copy installer to Desktop

**Option B: Network Share**

1. Share the `dist` folder on network
2. Access from production machine
3. Copy installer to production machine

**Option C: Cloud Storage**

1. Upload installer to Google Drive/Dropbox
2. Download on production machine

---

## Step 3: Install on Production Machine

On the **production machine** (with MUNBYN printer):

1. **Connect MUNBYN Printer First**

   - Plug printer into USB port
   - Power ON the printer
   - Wait for Windows to detect it

2. **Run the Installer**

   - Double-click `Pizza POS Setup 1.0.0.exe`
   - Click "Next" through installation wizard
   - Choose installation location (default is fine)
   - Check "Create desktop shortcut"
   - Click "Install"

3. **Launch the App**
   - The app will auto-start after installation
   - Or double-click desktop shortcut "Pizza POS"

---

## Step 4: Test Auto-Print on Production

1. **App should open in full-screen kiosk mode**

   - If you need to exit: Press `Ctrl + Q`

2. **Check printer connection** (open console with `F12`):

   - Look for: `✅ MUNBYN printer connected`
   - If you see `❌ No USB printers detected`:
     - Make sure printer is ON
     - Try unplugging and replugging USB
     - Restart the app

3. **Create a test order:**

   - Click "New Order"
   - Add a pizza or drink
   - Go to Checkout
   - Select payment method
   - Click "Complete Order"

4. **Watch for auto-print:**
   - Receipt should print automatically
   - Check console (F12) for logs:
     ```
     📄 Print request received
     🖨️  Formatting receipt...
     🖨️  Sending to printer...
     ✅ Print successful!
     ```

---

## Troubleshooting on Production Machine

### Issue: App won't start

**Solution:**

- Right-click installer → "Run as Administrator"
- Install again

### Issue: "No USB printers detected"

**Check these:**

1. Printer is plugged in and powered ON
2. Windows recognizes the USB device:
   - Open Device Manager (Win + X → Device Manager)
   - Look under "USB devices" or "Printers"
3. Try different USB port
4. Restart the Pizza POS app (Ctrl + Q, then relaunch)

### Issue: Print fails with error

**Try this:**

1. Close Pizza POS app (Ctrl + Q)
2. Unplug printer, wait 10 seconds
3. Plug printer back in
4. Relaunch Pizza POS app

### Issue: Need to see error messages

**Enable console:**

1. Press `F12` in the app
2. Click "Console" tab
3. Look for red error messages
4. Take screenshot and send to dev team

---

## Updating the App (Future Updates)

When you make code changes and need to update production:

1. **On dev machine:**

   ```cmd
   cd c:\Users\mahmed\Desktop\Practice\pizza-pos
   cd client
   npm run build
   cd ..
   npm run electron:build
   ```

2. **Transfer new installer to production**

3. **On production machine:**
   - Close running Pizza POS app (Ctrl + Q)
   - Run new installer (it will update existing installation)
   - Relaunch app

---

## Production Machine Setup (First Time)

For best kiosk experience:

### 1. Windows Auto-Login

1. Press Win + R → type `netplwiz`
2. Uncheck "Users must enter a password"
3. Click OK, enter password
4. PC will auto-login on restart

### 2. Auto-Start Pizza POS on Boot

1. Press Win + R → type `shell:startup`
2. Right-click in folder → New → Shortcut
3. Browse to: `C:\Users\[USERNAME]\AppData\Local\Programs\pizza-pos\Pizza POS.exe`
4. Name it "Pizza POS"
5. Click OK

Now the app starts automatically when Windows boots!

### 3. Disable Screen Timeout

1. Settings → System → Power & Sleep
2. Set "Screen" to "Never"
3. Set "Sleep" to "Never"

### 4. Hide Taskbar (Optional)

1. Right-click taskbar → Taskbar settings
2. Toggle "Automatically hide taskbar" ON

---

## Quick Command Reference

### Development Machine:

```cmd
# Build installer
cd c:\Users\mahmed\Desktop\Practice\pizza-pos
cd client && npm run build && cd ..
npm run electron:build

# Installer location
dir dist\*.exe
```

### Production Machine:

```cmd
# App installation location
C:\Users\[USERNAME]\AppData\Local\Programs\pizza-pos\

# Launch app manually
"C:\Users\[USERNAME]\AppData\Local\Programs\pizza-pos\Pizza POS.exe"

# Exit app
Ctrl + Q
```

---

## File Locations

**Development Machine:**

- Source code: `c:\Users\mahmed\Desktop\Practice\pizza-pos\`
- Built installer: `c:\Users\mahmed\Desktop\Practice\pizza-pos\dist\Pizza POS Setup 1.0.0.exe`

**Production Machine:**

- Installed app: `C:\Users\[USERNAME]\AppData\Local\Programs\pizza-pos\`
- Desktop shortcut: `C:\Users\[USERNAME]\Desktop\Pizza POS.lnk`
- Auto-start: `C:\Users\[USERNAME]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\`

---

## Important Notes

1. **The app loads from https://pos.akankha.com** even though it's installed locally

   - This means menu updates are automatic
   - No need to rebuild for menu changes
   - Only rebuild for printer fixes or UI changes

2. **Printer only works in Electron app**

   - Opening pos.akankha.com in browser = NO auto-print
   - Running installed desktop app = YES auto-print ✅

3. **No internet on production machine?**

   - The app requires internet to load from pos.akankha.com
   - For offline kiosk, need to modify electron/main.js to load local files

4. **Testing without printer**
   - App will still work if printer not connected
   - Just won't auto-print (users can download PDF)
   - No errors or crashes

---

## Next Steps

1. ✅ Build installer on dev machine
2. ✅ Transfer to production machine
3. ✅ Install and connect MUNBYN printer
4. ✅ Test auto-print functionality
5. ✅ Set up auto-start for kiosk mode

Good luck! 🍕
