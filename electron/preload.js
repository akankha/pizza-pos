const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,

  // Printer API
  printer: {
    print: (orderData) => ipcRenderer.invoke("print-receipt", orderData),
    checkStatus: () => ipcRenderer.invoke("check-printer"),
  },
});
