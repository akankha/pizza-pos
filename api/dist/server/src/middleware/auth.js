"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = exports.requireAdmin = exports.requireKitchen = exports.requireReception = exports.requireRestaurantAdmin = exports.requireSuperAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Access denied. No token provided.",
            });
        }
        // Verify token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Attach user to request
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: "Token expired. Please login again.",
            });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(403).json({
                success: false,
                error: "Invalid token.",
            });
        }
        return res.status(500).json({
            success: false,
            error: "Authentication error.",
        });
    }
};
exports.authenticateToken = authenticateToken;
// Role-based access control middleware
// Super Admin only (full system access)
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            error: "Access denied. Super Admin privileges required.",
        });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
// Restaurant Admin or higher (can manage menu and users)
const requireRestaurantAdmin = (req, res, next) => {
    const allowedRoles = ["super_admin", "restaurant_admin"];
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: "Access denied. Restaurant Admin privileges required.",
        });
    }
    next();
};
exports.requireRestaurantAdmin = requireRestaurantAdmin;
// Reception or higher (can take orders and view active orders)
const requireReception = (req, res, next) => {
    const allowedRoles = ["super_admin", "restaurant_admin", "reception"];
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: "Access denied. Reception privileges required.",
        });
    }
    next();
};
exports.requireReception = requireReception;
// Kitchen or higher (can view kitchen display and update order status)
const requireKitchen = (req, res, next) => {
    const allowedRoles = [
        "super_admin",
        "restaurant_admin",
        "reception",
        "kitchen",
    ];
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: "Access denied. Kitchen privileges required.",
        });
    }
    next();
};
exports.requireKitchen = requireKitchen;
// Legacy admin middleware (maps to restaurant_admin for backward compatibility)
const requireAdmin = (req, res, next) => {
    const allowedRoles = ["super_admin", "restaurant_admin"];
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: "Access denied. Admin privileges required.",
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Helper function to check if user has specific role or higher
const hasRole = (userRole, requiredRole) => {
    const roleHierarchy = {
        kitchen: 1,
        reception: 2,
        restaurant_admin: 3,
        super_admin: 4,
    };
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};
exports.hasRole = hasRole;
