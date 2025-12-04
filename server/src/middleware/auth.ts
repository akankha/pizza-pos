import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
        full_name?: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

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

    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
      role: string;
      full_name?: string;
    };

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
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

// Role-based access control middleware

// Super Admin only (full system access)
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Super Admin privileges required.",
    });
  }
  next();
};

// Restaurant Admin or higher (can manage menu and users)
export const requireRestaurantAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allowedRoles = ["super_admin", "restaurant_admin"];
  if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Restaurant Admin privileges required.",
    });
  }
  next();
};

// Reception or higher (can take orders and view active orders)
export const requireReception = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allowedRoles = ["super_admin", "restaurant_admin", "reception"];
  if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Reception privileges required.",
    });
  }
  next();
};

// Kitchen or higher (can view kitchen display and update order status)
export const requireKitchen = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

// Legacy admin middleware (maps to restaurant_admin for backward compatibility)
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allowedRoles = ["super_admin", "restaurant_admin"];
  if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Helper function to check if user has specific role or higher
export const hasRole = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: { [key: string]: number } = {
    kitchen: 1,
    reception: 2,
    restaurant_admin: 3,
    super_admin: 4,
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};
