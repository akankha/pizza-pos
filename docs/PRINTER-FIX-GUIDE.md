# Auto-Print Not Working - Fix Guide

## Problem

Printer only works when you manually download PDF and press Ctrl+P. Auto-printing doesn't happen after completing an order.

## Root Cause

You are accessing the POS through a **web browser** (Chrome/Edge) at `https://pos.akankha.com`.

**Web browsers CANNOT access USB printers directly** - this is a security restriction.

The auto-print feature only works in the **Electron desktop app** because it has direct access to the MUNBYN USB printer.

---

## Solution: Step-by-Step Fix

### Step 1: Test Printer Connection First

Before running the full app, let's verify your MUNBYN printer works:

```cmd
cd c:\Users\mahmed\Desktop\Practice\pizza-pos
npm install
node test-electron-print.js
```

This will:

- Detect your MUNBYN printer
- Print a test receipt
- Confirm everything is working

**Expected output:**

```
🔍 Searching for USB printers...
✅ Found 1 USB device(s):
📄 Attempting to print test receipt...
✅ Test receipt printed successfully!
```

**If you see "No USB printers found":**

1. Check USB cable is firmly connected
2. Make sure printer is powered ON
3. Try a different USB port
4. Check Windows Device Manager → USB devices

**If test print works, continue to Step 2!**

### Step 2: Run Electron App in Development Mode

```cmd
npm run electron:dev
```

**What happens:**

- Opens full-screen Electron window
- Loads POS interface from https://pos.akankha.com
- Connects to MUNBYN printer via USB
- Shows console logs for debugging

**Check the console for:**

```
✅ MUNBYN printer connected
```

### Step 3: Test Auto-Print

1. In the Electron app, create a test order
2. Add items (pizza, drinks, etc.)
3. Go to Checkout
4. Select payment method (Cash/Card)
5. Click Complete Order

**Watch the console - you should see:**

```
📄 Print request received for order: abc123
✅ Restaurant info loaded
🖨️  Formatting receipt...
🖨️  Sending to printer...
✅ Print successful!
```

**The receipt should print automatically!**

---

## Troubleshooting

### Issue: "Printer not connected"

**Solution 1: Restart the app**

```cmd
# Close Electron window (Ctrl+Q)
# Run again:
npm run electron:dev
```

**Solution 2: Run as Administrator**

- Right-click Command Prompt
- Select "Run as Administrator"
- Navigate to folder and run: `npm run electron:dev`

### Issue: Electron window doesn't open

**Check if dependencies installed:**

```cmd
npm install
```

**Check for errors in console**

- Look for red error messages
- Common issue: Missing node_modules

### Issue: Print hangs or freezes

**Fix the printer driver:**

1. Unplug MUNBYN printer
2. Wait 10 seconds
3. Plug back in
4. Close and restart Electron app

### Issue: Still showing browser, not Electron

**Make sure you're running the RIGHT command:**

- ❌ Opening Chrome/Edge and typing pos.akankha.com
- ✅ Running: `npm run electron:dev` in terminal

The Electron app looks like a full-screen window, not a browser tab.

---

- Start the API server locally
- Open the POS in a full-screen Electron window
- Enable auto-printing via USB

**Option B: Production Mode** (recommended for kiosk)

```cmd
npm run electron:build
```

This creates an installer in `dist/` folder. Then:

1. Run the installer (e.g., `pizza-pos Setup 1.0.0.exe`)
2. The app will be installed to `C:\Users\mahmed\AppData\Local\Programs\pizza-pos`
3. It will auto-start and run in kiosk mode
4. It loads from `https://pos.akankha.com` but has printer access

### Step 4: Test Auto-Print

1. Create a test order in the Electron app
2. Go to checkout
3. Select payment method (Cash/Card)
4. Complete the order
5. The receipt should **automatically print** to the MUNBYN printer

---

## How It Works

### Web Browser (Current - No Auto-Print ❌)

```
Browser → pos.akankha.com → No USB access → Must download PDF manually
```

### Electron App (Correct - Auto-Print ✅)

```
Electron App → Loads pos.akankha.com → Has USB access via printService.js → Auto-prints to MUNBYN
```

---

## Files Involved

1. **electron/main.js** - Main Electron process, handles IPC
2. **electron/preload.js** - Exposes `window.electron.printer` API to web code
3. **electron/printService.js** - USB printer communication using ESC/POS
4. **client/src/pages/CheckoutPage.tsx** - Calls `window.electron.printer.print()` after order

---

## Verification

To check if you're in the Electron app, open the browser console (F12):

```javascript
// In Electron app - this returns an object:
window.electron;
// Output: {platform: "win32", printer: {print: f, checkStatus: f}}

// In web browser - this returns undefined:
window.electron;
// Output: undefined
```

---

## Common Issues

### Issue: "No USB printers detected"

**Fix:** Make sure MUNBYN printer is:

- Plugged into USB port
- Powered on
- Not in use by another program

### Issue: App won't start

**Fix:** Install dependencies first:

```cmd
npm install
```

### Issue: Still using browser instead of Electron

**Fix:** Close browser tabs. Launch the installed desktop app from:

- Start Menu → "Pizza POS"
- Or run: `npm run electron:dev`

---

## Production Deployment (Kiosk Setup)

For the actual touchscreen kiosk:

1. Build the installer:

   ```cmd
   npm run electron:build
   ```

2. Copy installer to kiosk PC (e.g., via USB drive):

   - File: `dist/pizza-pos Setup 1.0.0.exe`

3. Install on kiosk

4. Configure Windows auto-start (optional):

   - Press Win+R → `shell:startup`
   - Create shortcut to: `C:\Users\[USER]\AppData\Local\Programs\pizza-pos\pizza-pos.exe`

5. Connect MUNBYN printer via USB

6. Test order and auto-print

---

## Quick Command Reference

```cmd
# Install dependencies
npm install

# Run in development (test printer locally)
npm run electron:dev

# Build installer for production
npm run electron:build

# Test printer connection
node scripts/test-printer.js
```

---

## Summary

✅ **DO:** Use the Electron desktop app for kiosk with auto-printing
❌ **DON'T:** Use web browser - it cannot access USB printers

The website (pos.akankha.com) works great for remote access, but for the physical kiosk with a thermal printer, you MUST use the Electron app.
