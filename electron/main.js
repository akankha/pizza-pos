const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

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

  // In development
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built app
    mainWindow.loadFile(path.join(__dirname, "../client/dist/index.html"));
  }

  // Prevent navigation away from the app
  mainWindow.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  // Disable right-click context menu
  mainWindow.webContents.on("context-menu", (event) => {
    event.preventDefault();
  });

  // Auto-restart on crash
  mainWindow.webContents.on("crashed", () => {
    console.error("App crashed! Restarting...");
    app.relaunch();
    app.exit();
  });
}

function startServer() {
  const serverPath = path.join(__dirname, "../server/dist/index.js");

  if (process.env.NODE_ENV === "development") {
    // In development, assume server is running separately
    console.log("Development mode: Expecting server to run separately");
    return;
  }

  serverProcess = spawn("node", [serverPath], {
    stdio: "inherit",
    env: { ...process.env, PORT: "3001" },
  });

  serverProcess.on("error", (error) => {
    console.error("Failed to start server:", error);
  });

  serverProcess.on("close", (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  startServer();

  // Wait for server to start
  setTimeout(() => {
    createWindow();
  }, 2000);
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
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
