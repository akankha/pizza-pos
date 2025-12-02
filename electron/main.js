const { app, BrowserWindow } = require("electron");
const path = require("path");

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
    // In production - load from Hostinger website
    const productionUrl = process.env.CLIENT_URL || "https://yourdomain.com";
    mainWindow.loadURL(productionUrl);
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

app.whenReady().then(() => {
  createWindow();
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
// app.disableHardwareAcceleration();
