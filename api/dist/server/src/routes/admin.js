"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_js_1 = __importDefault(require("../db/database.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
// Apply authentication middleware to all admin routes
router.use(auth_js_1.authenticateToken);
// Get statistics (Restaurant Admin and above)
router.get("/stats", auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split("T")[0];
        // Today's stats
        const [todayStats] = await database_js_1.default.query(`SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as totalSales 
       FROM orders 
       WHERE DATE(created_at) = ? AND is_deleted = 0`, [todayStr]);
        // Week stats
        const [weekStats] = await database_js_1.default.query(`SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as totalSales 
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0`, [weekAgoStr]);
        // Top items
        const [topItems] = await database_js_1.default.query(`SELECT 
        oi.name,
        SUM(oi.quantity) as quantity,
        SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) >= ?
       GROUP BY oi.name
       ORDER BY revenue DESC
       LIMIT 10`, [weekAgoStr]);
        res.json({
            success: true,
            data: {
                todaySales: todayStats[0].totalSales || 0,
                todayOrders: todayStats[0].orderCount || 0,
                weekSales: weekStats[0].totalSales || 0,
                weekOrders: weekStats[0].orderCount || 0,
                topItems: topItems || [],
            },
        });
    }
    catch (error) {
        console.error("Failed to get stats:", error);
        res.status(500).json({ success: false, error: "Failed to get statistics" });
    }
});
// Get reports by period (Restaurant Admin and above)
router.get("/reports/:period", auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const { period } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let startDate = new Date(today);
        switch (period) {
            case "today":
                // Already set to today
                break;
            case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default:
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid period" });
        }
        const startDateStr = startDate.toISOString().split("T")[0];
        // Overall stats
        const [stats] = await database_js_1.default.query(`SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalSales,
        COALESCE(SUM(discount_amount), 0) as totalDiscounts,
        COALESCE(AVG(total), 0) as avgOrder
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0`, [startDateStr]);
        // Top items
        const [topItems] = await database_js_1.default.query(`SELECT 
        oi.name,
        SUM(oi.quantity) as quantity,
        SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) >= ? AND o.is_deleted = 0
       GROUP BY oi.name
       ORDER BY revenue DESC
       LIMIT 20`, [startDateStr]);
        // Payment methods breakdown
        const [paymentMethods] = await database_js_1.default.query(`SELECT 
        payment_method as paymentMethod,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
       FROM orders 
       WHERE DATE(created_at) >= ? AND payment_method IS NOT NULL AND is_deleted = 0
       GROUP BY payment_method`, [startDateStr]);
        // Recent orders with details
        const [recentOrders] = await database_js_1.default.query(`SELECT 
        id,
        total,
        status,
        payment_method as paymentMethod,
        created_at as createdAt
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0
       ORDER BY created_at DESC
       LIMIT 50`, [startDateStr]);
        // Get order items for recent orders
        const orderIds = recentOrders.map((order) => order.id);
        let orderItems = [];
        if (orderIds.length > 0) {
            const placeholders = orderIds.map(() => "?").join(",");
            const [items] = await database_js_1.default.query(`SELECT 
          order_id as orderId,
          name,
          quantity,
          price
         FROM order_items 
         WHERE order_id IN (${placeholders})`, orderIds);
            orderItems = items;
        }
        // Group items by order
        const ordersWithItems = recentOrders.map((order) => ({
            ...order,
            items: orderItems.filter((item) => item.orderId === order.id),
        }));
        // Hourly sales distribution
        const [hourlySales] = await database_js_1.default.query(`SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as orderCount,
        COALESCE(SUM(total), 0) as sales
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0
       GROUP BY HOUR(created_at)
       ORDER BY hour`, [startDateStr]);
        const paymentMethodsMap = {};
        paymentMethods.forEach((pm) => {
            paymentMethodsMap[pm.paymentMethod] = {
                count: pm.count,
                total: pm.total,
            };
        });
        res.json({
            success: true,
            data: {
                totalOrders: stats[0].totalOrders || 0,
                totalSales: stats[0].totalSales || 0,
                totalDiscounts: stats[0].totalDiscounts || 0,
                avgOrder: stats[0].avgOrder || 0,
                topItems: topItems || [],
                paymentMethods: paymentMethodsMap,
                recentOrders: ordersWithItems || [],
                hourlySales: hourlySales || [],
            },
        });
    }
    catch (error) {
        console.error("Failed to get report:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to generate report" });
    }
});
// Menu management routes
// Add new menu item (Restaurant Admin and above)
router.post("/menu/:type", auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const { type } = req.params;
        const data = req.body;
        // Simple validation
        if (!data.name) {
            return res
                .status(400)
                .json({ success: false, error: "Name is required" });
        }
        // Generate a simple ID (in production, use UUID)
        const id = `${type}_${Date.now()}`;
        let query = "";
        let values = [];
        switch (type) {
            case "size":
                query =
                    "INSERT INTO sizes (id, name, display_name, base_price) VALUES (?, ?, ?, ?)";
                values = [
                    id,
                    data.name,
                    data.displayName || data.name,
                    data.basePrice || 0,
                ];
                break;
            case "crust":
                query =
                    "INSERT INTO crusts (id, type, display_name, price_modifier) VALUES (?, ?, ?, ?)";
                values = [
                    id,
                    data.type || data.name,
                    data.displayName || data.name,
                    data.priceModifier || 0,
                ];
                break;
            case "topping":
                query =
                    "INSERT INTO toppings (id, name, category, price) VALUES (?, ?, ?, ?)";
                values = [id, data.name, data.category || "veggie", data.price || 0];
                break;
            case "side":
                query =
                    "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)";
                values = [
                    id,
                    data.name,
                    "side",
                    data.price || 0,
                    data.description || "",
                ];
                break;
            case "drink":
                query =
                    "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)";
                values = [
                    id,
                    data.name,
                    "drink",
                    data.price || 0,
                    data.description || "",
                ];
                break;
            case "combo":
                query =
                    "INSERT INTO combo_deals (id, name, description, price, items, category, toppings_allowed) VALUES (?, ?, ?, ?, ?, ?, ?)";
                values = [
                    id,
                    data.name,
                    data.description || "",
                    data.price || 0,
                    data.items || "",
                    data.category || "combo",
                    data.toppings_allowed || 3,
                ];
                break;
            case "specialty":
                query =
                    "INSERT INTO specialty_pizzas (id, name, description, toppings, price_small, price_medium, price_large, price_xlarge, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                values = [
                    id,
                    data.name,
                    data.description || "",
                    data.toppings || "",
                    data.prices?.small || 0,
                    data.prices?.medium || 0,
                    data.prices?.large || 0,
                    data.prices?.xlarge || 0,
                    data.category || "specialty",
                ];
                break;
            default:
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid menu type" });
        }
        await database_js_1.default.query(query, values);
        res.json({ success: true, data: { id, ...data } });
    }
    catch (error) {
        console.error("Failed to create menu item:", error);
        res.status(500).json({ success: false, error: "Failed to create item" });
    }
});
// Update menu item (Restaurant Admin and above)
router.put("/menu/:type/:id", auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const { type, id } = req.params;
        const data = req.body;
        let query = "";
        let values = [];
        switch (type) {
            case "size":
                query =
                    "UPDATE sizes SET name=?, display_name=?, base_price=? WHERE id=?";
                values = [
                    data.name,
                    data.displayName || data.name,
                    data.basePrice || 0,
                    id,
                ];
                break;
            case "crust":
                query =
                    "UPDATE crusts SET type=?, display_name=?, price_modifier=? WHERE id=?";
                values = [
                    data.type || data.name,
                    data.displayName || data.name,
                    data.priceModifier || 0,
                    id,
                ];
                break;
            case "topping":
                query = "UPDATE toppings SET name=?, category=?, price=? WHERE id=?";
                values = [data.name, data.category || "veggie", data.price || 0, id];
                break;
            case "side":
                query =
                    "UPDATE menu_items SET name=?, price=?, description=? WHERE id=?";
                values = [data.name, data.price || 0, data.description || "", id];
                break;
            case "drink":
                query =
                    "UPDATE menu_items SET name=?, price=?, description=? WHERE id=?";
                values = [data.name, data.price || 0, data.description || "", id];
                break;
            case "combo":
                query =
                    "UPDATE combo_deals SET name=?, description=?, price=?, items=?, category=?, toppings_allowed=? WHERE id=?";
                values = [
                    data.name,
                    data.description || "",
                    data.price || 0,
                    data.items || "",
                    data.category || "combo",
                    data.toppings_allowed || 3,
                    id,
                ];
                break;
            case "specialty":
                query =
                    "UPDATE specialty_pizzas SET name=?, description=?, toppings=?, price_small=?, price_medium=?, price_large=?, price_xlarge=?, category=? WHERE id=?";
                values = [
                    data.name,
                    data.description || "",
                    data.toppings || "",
                    data.prices?.small || 0,
                    data.prices?.medium || 0,
                    data.prices?.large || 0,
                    data.prices?.xlarge || 0,
                    data.category || "specialty",
                    id,
                ];
                break;
            default:
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid menu type" });
        }
        await database_js_1.default.query(query, values);
        res.json({ success: true, data: { id, ...data } });
    }
    catch (error) {
        console.error("Failed to update menu item:", error);
        res.status(500).json({ success: false, error: "Failed to update item" });
    }
});
// Delete menu item (Restaurant Admin and above)
router.delete("/menu/:type/:id", auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const { type, id } = req.params;
        const tables = {
            size: "sizes",
            crust: "crusts",
            topping: "toppings",
            side: "menu_items",
            drink: "menu_items",
            combo: "combo_deals",
            specialty: "specialty_pizzas",
        };
        const table = tables[type];
        if (!table) {
            return res
                .status(400)
                .json({ success: false, error: "Invalid menu type" });
        }
        await database_js_1.default.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Failed to delete menu item:", error);
        res.status(500).json({ success: false, error: "Failed to delete item" });
    }
});
// Get deleted orders report (Restaurant Admin and above)
router.get("/reports/deleted-orders", auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        // Get deleted orders with details
        const [deletedOrders] = await database_js_1.default.query(`SELECT 
        id,
        total,
        payment_method as paymentMethod,
        created_at as createdAt,
        deleted_at as deletedAt,
        deleted_by as deletedBy,
        delete_note as deleteNote
       FROM orders 
       WHERE is_deleted = 1
       ORDER BY deleted_at DESC
       LIMIT 500`); // Get order items for deleted orders
        const orderIds = deletedOrders.map((order) => order.id);
        let orderItems = [];
        if (orderIds.length > 0) {
            const placeholders = orderIds.map(() => "?").join(",");
            const [items] = await database_js_1.default.query(`SELECT 
          order_id as orderId,
          name,
          quantity,
          price
         FROM order_items 
         WHERE order_id IN (${placeholders})`, orderIds);
            orderItems = items;
        }
        // Group items by order
        const ordersWithItems = deletedOrders.map((order) => ({
            ...order,
            items: orderItems.filter((item) => item.orderId === order.id),
        }));
        res.json({
            success: true,
            data: ordersWithItems,
        });
    }
    catch (error) {
        console.error("Deleted orders report error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
