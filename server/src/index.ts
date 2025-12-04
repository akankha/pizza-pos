import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import { initDatabase, seedDatabase } from "./db/database.js";
import { seedAdminUser } from "./db/seedAdmin.js";
import { sanitizeSql } from "./middleware/validation.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";
import migrationsRoutes from "./routes/migrations.js";
import orderRoutes from "./routes/orders.js";
import settingsRoutes from "./routes/settings.js";
import usersRoutes from "./routes/users.js";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO only for local development (not compatible with Vercel serverless)
let io: any = null;

// Initialize Socket.IO asynchronously
async function initializeSocketIO() {
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    const { Server } = await import("socket.io");
    io = new Server(httpServer, {
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "http://localhost:3000",
        ],
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true,
      },
    });
  }
}

const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel/production environments
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later.",
});
app.use("/api/auth/login", authLimiter);

// Middleware - Simplified CORS for production
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires",
    ],
    exposedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeSql);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/migrations", migrationsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize database asynchronously
// Socket.io for real-time updates (only in development)
if (io) {
  io.on("connection", (socket: any) => {
    console.log("Client connected:", socket.id);

    // Join kitchen room
    socket.on("join:kitchen", () => {
      socket.join("kitchen");
      console.log("Kitchen display joined:", socket.id);
    });

    // New order created
    socket.on("order:created", (order: any) => {
      console.log("New order created:", order.id);
      io.to("kitchen").emit("order:new", order);
    });

    // Order status updated
    socket.on(
      "order:status",
      ({ orderId, status }: { orderId: string; status: string }) => {
        console.log(`Order ${orderId} status updated to ${status}`);
        io.emit("order:updated", { orderId, status });
      }
    );

    // Order paid
    socket.on("order:paid", (order: any) => {
      console.log("Order paid:", order.id);
      io.emit("order:completed", order);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
);

// Initialize database asynchronously
async function startServer() {
  try {
    await initializeSocketIO();
    await initDatabase();
    await seedDatabase();
    await seedAdminUser();
    console.log("✅ Database initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }

  // Only start server if not in serverless environment (Vercel)
  if (process.env.VERCEL !== "1") {
    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🍕 Pizza POS Server Running         ║
║   Port: ${PORT}                       ║
║   WebSocket: ${io ? "Enabled" : "Disabled (Production)"}  ║
║   Database: MySQL (pizza_pos)         ║
╚════════════════════════════════════════╝
    `);
    });
  }
}

// Start the server (only for non-serverless)
if (process.env.VERCEL !== "1") {
  startServer().catch(console.error);
} else {
  // For Vercel, initialize DB on first request
  let dbInitialized = false;
  app.use(async (req, res, next) => {
    if (!dbInitialized) {
      try {
        await initDatabase();
        await seedDatabase();
        await seedAdminUser();
        dbInitialized = true;
      } catch (error) {
        console.error("DB init error:", error);
      }
    }
    next();
  });
}

// Export app for Vercel serverless
export default app;
export { io };
