"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_js_1 = require("../db/database.js");
const validation_js_1 = require("../middleware/validation.js");
const router = express_1.default.Router();
// Login endpoint
router.post("/login", validation_js_1.validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;
        // Fetch user from database
        const [users] = await (0, database_js_1.query)("SELECT * FROM admin_users WHERE username = ? AND active = 1 LIMIT 1", [username]);
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }
        const user = users[0];
        // Verify password
        const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }
        // Generate JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }
        const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name,
        }, secret, { expiresIn });
        // Update last login
        await (0, database_js_1.query)("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [
            user.id,
        ]);
        // Set httpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            error: "Authentication failed",
        });
    }
});
// Logout endpoint
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
});
// Verify token endpoint
router.get("/verify", async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No token provided",
            });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        res.json({
            success: true,
            data: {
                user: {
                    id: decoded.id,
                    username: decoded.username,
                    role: decoded.role,
                },
            },
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: "Invalid or expired token",
        });
    }
});
exports.default = router;
