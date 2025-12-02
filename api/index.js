// Vercel serverless function handler
const path = require("path");
const express = require("express");

// Load built Express app
let app;

module.exports = async (req, res) => {
  if (!app) {
    // Set environment flag for serverless
    process.env.VERCEL = "1";

    // Import the built app
    const indexPath = path.join(__dirname, "..", "server", "dist", "index.js");
    const module = await import(indexPath);
    app = module.default;
  }

  return app(req, res);
};
