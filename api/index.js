// Vercel serverless function handler
const path = require("path");

// Load built Express app
let app;

module.exports = async (req, res) => {
  if (!app) {
    // Set environment flag for serverless
    process.env.VERCEL = "1";

    // Import the built app from api/dist (copied during build)
    const indexPath = path.join(__dirname, "dist", "index.js");
    const module = await import(indexPath);
    app = module.default;
  }

  return app(req, res);
};
