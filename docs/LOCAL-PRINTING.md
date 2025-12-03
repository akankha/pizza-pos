# Local Printing with MUNBYN Thermal Printer

## Architecture Overview

Since the API server is hosted on Vercel (serverless, no USB access), printing is handled **locally** by the Electron desktop app running on the POS kiosk.

```
┌─────────────────────────────────────────────────────────────┐
│                    POS Kiosk (Windows)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Electron App (pos.akankha.com)               │  │
│  │                                                       │  │
│  │  • Takes orders                                      │  │
│  │  • Sends to Vercel API (saves to database)          │  │
│  │  • Prints receipt LOCALLY via USB                   │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   │ USB                                      │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          MUNBYN Thermal Printer                      │  │
│  │          (80mm, ESC/POS compatible)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Internet
                          ▼
              ┌──────────────────────┐
              │   Vercel API Server   │
              │ pizza-pos-server      │
              │                       │
              │ • Stores orders       │
              │ • Manages menu        │
              │ • User authentication │
              └──────────────────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │  Hostinger MySQL DB  │
              └──────────────────────┘
```

## How It Works

### 1. Order Creation Flow

```
Customer completes order
  ↓
CheckoutPage sends order to Vercel API
  ↓
Order saved to database
  ↓
CheckoutPage detects Electron environment
  ↓
Calls window.electron.printer.print()
  ↓
Electron IPC Handler receives print request
  ↓
Formats receipt text
  ↓
Sends to MUNBYN printer via USB
  ↓
Receipt prints automatically
```

### 2. Files Involved

**Electron App:**

- `electron/main.js` - IPC handlers for print requests
- `electron/preload.js` - Exposes printer API to web app
- `electron/printService.js` - Direct USB printer communication

**Client App:**

- `client/src/pages/CheckoutPage.tsx` - Triggers local print after order
- `client/src/vite-env.d.ts` - TypeScript definitions

**Dependencies:**

- `escpos` - ESC/POS printer protocol
- `escpos-usb` - USB printer driver
- `node-fetch` - Get restaurant settings from API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:

- `escpos` and `escpos-usb` for MUNBYN printer
- `node-fetch` for API calls from Electron

### 2. Connect MUNBYN Printer

1. Plug MUNBYN printer into USB port
2. Install printer drivers if needed (Windows should auto-detect)
3. Printer will be auto-detected when Electron app starts

### 3. Build Electron App

```bash
npm run electron:build
```

Creates installer in `dist/` folder.

### 4. Install on POS Kiosk

1. Run the installer on Windows POS kiosk
2. App will start in fullscreen kiosk mode
3. Printer will connect automatically on startup

## How to Use

### Taking Orders

1. Staff logs in
2. Takes order as normal
3. Selects payment method (Cash/Card)
4. Clicks payment button

**What happens:**

- Order saves to cloud database ✅
- Receipt prints locally ✅
- Order appears on kitchen display ✅

### Troubleshooting

**Printer not detected:**

```javascript
// Check printer status in DevTools console
window.electron.printer.checkStatus();
```

**Manual print test:**

```javascript
// Test print from console
window.electron.printer.print({
  orderId: "test-123",
  orderNumber: 123456,
  items: [{ name: "Test Pizza", quantity: 1, price: 15.99 }],
  subtotal: 15.99,
  tax: 1.92,
  total: 17.91,
  paymentMethod: "cash",
});
```

**View printer logs:**

```bash
# Electron console will show:
✅ MUNBYN printer connected
🖨️ Print request received
✅ Printed 1 receipt(s)
```

## Advantages of This Approach

1. **Works with Vercel Hosting** ✅

   - API on Vercel (free, fast, global)
   - Printing happens locally (has USB access)

2. **No Server Hardware Needed** ✅

   - No need for dedicated local server
   - Electron app handles everything

3. **Automatic Updates** ✅

   - App loads latest menu from cloud
   - Auto-refreshes every 5 minutes

4. **Offline Capable** ✅

   - Could add offline queue for orders
   - Print locally even if internet drops

5. **Multiple Locations** ✅
   - Each kiosk has its own printer
   - All share same cloud database

## Alternative: Cloud Print Service (Future)

If you want web browsers (not just Electron) to print, you could:

1. **Install Local Print Server** on POS kiosk:

   ```bash
   npm install -g @akankha/print-server
   print-server --port 3002
   ```

2. **Web app sends print jobs** to `http://localhost:3002/print`

3. **Local server forwards to USB printer**

This allows any device on local network to print!

## Production Deployment

### Current Setup

- ✅ API: Vercel (https://pizza-pos-server.vercel.app)
- ✅ Web: Vercel (https://pos.akankha.com)
- ✅ Printing: Local Electron app with USB printer

### Deploy Steps

1. Push code: `git push origin master`
2. Vercel auto-deploys API + Web
3. Rebuild Electron app: `npm run electron:build`
4. Update kiosk with new installer

That's it! The system now prints locally while using cloud hosting for everything else.
