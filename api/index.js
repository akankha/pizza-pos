// Vercel serverless function handler
import dotenv from "dotenv";

dotenv.config();

// Set Vercel environment flag
process.env.VERCEL = "1";

let handler;

export default async function (req, res) {
  if (!handler) {
    // Lazy load the Express app on first request
    const { default: app } = await import("../server/dist/index.js");
    handler = app;
  }

  return handler(req, res);
}
