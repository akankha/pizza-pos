const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { initDatabase } = require("./db-init");

const app = express();

// Trust proxy for Vercel
app.set("trust proxy", 1);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      "https://pos.akankha.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Rate limiting - more lenient for POS operations
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // Increased from 100 to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain endpoints
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === "/api/health" || req.path === "/";
  },
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Separate, stricter rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: "Too many login attempts, please try again later.",
});

// Database initialization endpoint (run this once after deployment)
app.post("/api/init-db", async (req, res) => {
  try {
    const result = await initDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const settingsRoutes = require("./routes/settings");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", loginLimiter, authRoutes); // Apply login rate limiter to auth routes
app.use("/api/settings", settingsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Export for Vercel
module.exports = app;
