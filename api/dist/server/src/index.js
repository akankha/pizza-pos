"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const database_js_1 = require("./db/database.js");
const seedAdmin_js_1 = require("./db/seedAdmin.js");
const validation_js_1 = require("./middleware/validation.js");
const admin_js_1 = __importDefault(require("./routes/admin.js"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const menu_js_1 = __importDefault(require("./routes/menu.js"));
const migrations_js_1 = __importDefault(require("./routes/migrations.js"));
const orders_js_1 = __importDefault(require("./routes/orders.js"));
const settings_js_1 = __importDefault(require("./routes/settings.js"));
const users_js_1 = __importDefault(require("./routes/users.js"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Socket.IO only for local development (not compatible with Vercel serverless)
let io = null;
exports.io = io;
// Initialize Socket.IO asynchronously
async function initializeSocketIO() {
    if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
        const { Server } = await Promise.resolve().then(() => __importStar(require("socket.io")));
        exports.io = io = new Server(httpServer, {
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
app.set("trust proxy", 1);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
}));
// Rate limiting - More lenient for POS operations
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "500"), // Increased from 100 to 500
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks and settings
        return req.path === "/api/health" || req.path === "/api/settings";
    },
});
app.use("/api/", limiter);
// More strict rate limiting for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Increased from 5 to 20 attempts
    skipSuccessfulRequests: true, // Don't count successful logins
    message: "Too many login attempts, please try again later.",
});
app.use("/api/auth/login", authLimiter);
// Middleware - Simplified CORS for production
app.use((0, cors_1.default)({
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
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(validation_js_1.sanitizeSql);
// Routes
app.use("/api/auth", auth_js_1.default);
app.use("/api/menu", menu_js_1.default);
app.use("/api/orders", orders_js_1.default);
app.use("/api/admin", admin_js_1.default);
app.use("/api/settings", settings_js_1.default);
app.use("/api/users", users_js_1.default);
app.use("/api/migrations", migrations_js_1.default);
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Initialize database asynchronously
// Socket.io for real-time updates (only in development)
if (io) {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        // Join kitchen room
        socket.on("join:kitchen", () => {
            socket.join("kitchen");
            console.log("Kitchen display joined:", socket.id);
        });
        // New order created
        socket.on("order:created", (order) => {
            console.log("New order created:", order.id);
            io.to("kitchen").emit("order:new", order);
        });
        // Order status updated
        socket.on("order:status", ({ orderId, status }) => {
            console.log(`Order ${orderId} status updated to ${status}`);
            io.emit("order:updated", { orderId, status });
        });
        // Order paid
        socket.on("order:paid", (order) => {
            console.log("Order paid:", order.id);
            io.emit("order:completed", order);
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
}
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        error: err.message || "Internal server error",
    });
});
// Initialize database asynchronously
async function startServer() {
    try {
        await initializeSocketIO();
        await (0, database_js_1.initDatabase)();
        await (0, database_js_1.seedDatabase)();
        await (0, seedAdmin_js_1.seedAdminUser)();
        console.log("✅ Database initialized");
    }
    catch (error) {
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
}
else {
    // For Vercel, initialize DB on first request
    let dbInitialized = false;
    app.use(async (req, res, next) => {
        if (!dbInitialized) {
            try {
                await (0, database_js_1.initDatabase)();
                await (0, database_js_1.seedDatabase)();
                await (0, seedAdmin_js_1.seedAdminUser)();
                dbInitialized = true;
            }
            catch (error) {
                console.error("DB init error:", error);
            }
        }
        next();
    });
}
// Export app for Vercel serverless
exports.default = app;
