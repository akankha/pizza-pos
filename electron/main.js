const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const printService = require("./printService");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // In development - connect to Vite dev server
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // In production - load from deployed client
    mainWindow.loadURL("https://pos.akankha.com");

    // Auto-refresh every 5 minutes to get latest menu updates
    setInterval(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Prevent navigation away from the app
  mainWindow.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  // Disable right-click context menu in production
  if (process.env.NODE_ENV !== "development") {
    mainWindow.webContents.on("context-menu", (event) => {
      event.preventDefault();
    });
  }

  // Auto-restart on crash
  mainWindow.webContents.on("crashed", () => {
    console.error("App crashed! Restarting...");
    app.relaunch();
    app.exit();
  });

  // Allow Ctrl+Q to quit (for maintenance)
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.key.toLowerCase() === "q") {
      app.quit();
    }
  });
}

// IPC Handlers for printing
ipcMain.handle("print-receipt", async (event, orderData) => {
  try {
    console.log("📄 Print request received for order:", orderData.orderId);

    // Get restaurant settings from the API
    let restaurantInfo = {
      name: "Pizza Shop",
      address: "",
      phone: "",
    };

    try {
      const fetch = require("node-fetch");
      const response = await fetch(
        "https://pizza-pos-server.vercel.app/api/settings"
      );
      const result = await response.json();
      if (result.success && result.data) {
        restaurantInfo = {
          name: result.data.restaurant_name || "Pizza Shop",
          address: result.data.restaurant_address || "",
          phone: result.data.restaurant_phone || "",
        };
        console.log("✅ Restaurant info loaded");
      }
    } catch (err) {
      console.error("⚠️  Failed to fetch restaurant settings:", err.message);
      console.log("📝 Using default restaurant info");
    }

    console.log("🖨️  Formatting receipt...");
    const receiptText = printService.formatReceipt({
      ...orderData,
      restaurantInfo,
    });

    console.log("🖨️  Sending to printer...");
    await printService.print(receiptText, orderData.copies || 1);
    console.log("✅ Print successful!");

    return { success: true };
  } catch (error) {
    console.error("❌ Print error:", error.message);
    console.error("Stack trace:", error.stack);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("check-printer", async () => {
  try {
    const connected = await printService.connect();
    return { success: true, connected };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  // Initialize printer on startup
  printService.connect().catch((err) => {
    console.error("Failed to connect to printer on startup:", err);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Prevent app from quitting unexpectedly
app.on("browser-window-crashed", () => {
  console.error("Window crashed! Restarting...");
  app.relaunch();
  app.exit();
});

// Disable hardware acceleration if needed for compatibility
// app.disableHardwareAcceleration();
