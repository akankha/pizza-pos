// Styled Excel report download (Restaurant Admin and above)
router.get("/reports/:period/excel", requireRestaurantAdmin, async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const { period } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);
    switch (period) {
      case "today": break;
      case "week": startDate.setDate(startDate.getDate() - 7); break;
      case "month": startDate.setMonth(startDate.getMonth() - 1); break;
      default:
        return res.status(400).json({ success: false, error: "Invalid period" });
    }
    const startDateStr = startDate.toISOString().split("T")[0];
    // Query same as JSON report
    const [stats] = await db.query(
      `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total), 0) as totalSales, COALESCE(AVG(total), 0) as avgOrder FROM orders WHERE DATE(created_at) >= ? AND is_deleted = 0`,
      [startDateStr]
    );
    const [topItems] = await db.query(
      `SELECT oi.name, SUM(oi.quantity) as quantity, SUM(oi.price * oi.quantity) as revenue FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE DATE(o.created_at) >= ? AND o.is_deleted = 0 GROUP BY oi.name ORDER BY revenue DESC LIMIT 20`,
      [startDateStr]
    );
    const [paymentMethods] = await db.query(
      `SELECT payment_method as paymentMethod, COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM orders WHERE DATE(created_at) >= ? AND payment_method IS NOT NULL AND is_deleted = 0 GROUP BY payment_method`,
      [startDateStr]
    );
    const [recentOrders] = await db.query(
      `SELECT id, total, status, payment_method as paymentMethod, created_at as createdAt FROM orders WHERE DATE(created_at) >= ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT 50`,
      [startDateStr]
    );
    const orderIds = (recentOrders as any[]).map((order: any) => order.id);
    let orderItems: any[] = [];
    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => "?").join(",");
      const [items] = await db.query(
        `SELECT order_id as orderId, name, quantity, price FROM order_items WHERE order_id IN (${placeholders})`,
        orderIds
      );
      orderItems = items as any[];
    }
    const ordersWithItems = (recentOrders as any[]).map((order: any) => ({
      ...order,
      items: orderItems.filter((item: any) => item.orderId === order.id),
    }));
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    // Summary sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.addRow(["Sales Report"]);
    summarySheet.addRow(["Period", period]);
    summarySheet.addRow(["Generated", new Date().toLocaleString()]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Total Sales", `$${(stats as any)[0].totalSales?.toFixed(2) || "0.00"}`]);
    summarySheet.addRow(["Total Orders", (stats as any)[0].totalOrders || 0]);
    summarySheet.addRow(["Average Order", `$${(stats as any)[0].avgOrder?.toFixed(2) || "0.00"}`]);
    summarySheet.columns = [{ width: 20 }, { width: 30 }];
    summarySheet.getRow(1).font = { bold: true, size: 14 };
    for (let i = 2; i <= 7; i++) summarySheet.getRow(i).font = { bold: i <= 3 };
    // Top Items sheet
    const topItemsSheet = workbook.addWorksheet("Top Items");
    topItemsSheet.addRow(["Name", "Quantity", "Revenue"]);
    (topItems as any[]).forEach(item => {
      topItemsSheet.addRow([item.name, item.quantity, `$${item.revenue.toFixed(2)}`]);
    });
    if ((topItems as any[]).length === 0) topItemsSheet.addRow(["No data", "", ""]);
    topItemsSheet.columns = [{ width: 25 }, { width: 15 }, { width: 20 }];
    topItemsSheet.getRow(1).font = { bold: true };
    // Payment Methods sheet
    const paymentMethodsSheet = workbook.addWorksheet("Payment Methods");
    paymentMethodsSheet.addRow(["Method", "Transactions", "Total"]);
    (paymentMethods as any[]).forEach(pm => {
      paymentMethodsSheet.addRow([pm.paymentMethod, pm.count, `$${pm.total.toFixed(2)}`]);
    });
    if ((paymentMethods as any[]).length === 0) paymentMethodsSheet.addRow(["No data", "", ""]);
    paymentMethodsSheet.columns = [{ width: 25 }, { width: 15 }, { width: 20 }];
    paymentMethodsSheet.getRow(1).font = { bold: true };
    // Recent Orders sheet
    const recentOrdersSheet = workbook.addWorksheet("Recent Orders");
    recentOrdersSheet.addRow(["Order ID", "Date", "Total", "Payment Method", "Items"]);
    ordersWithItems.forEach(order => {
      recentOrdersSheet.addRow([
        order.id,
        new Date(order.createdAt).toLocaleString(),
        `$${parseFloat(order.total).toFixed(2)}`,
        order.paymentMethod,
        order.items.map((i: any) => `${i.quantity}x ${i.name}`).join("; "),
      ]);
    });
    if (ordersWithItems.length === 0) recentOrdersSheet.addRow(["No data", "", "", "", ""]);
    recentOrdersSheet.columns = [
      { width: 15 }, { width: 25 }, { width: 15 }, { width: 20 }, { width: 40 }
    ];
    recentOrdersSheet.getRow(1).font = { bold: true };
    // Borders for all sheets
    [summarySheet, topItemsSheet, paymentMethodsSheet, recentOrdersSheet].forEach(sheet => {
      sheet.eachRow(row => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
    });
    // Stream file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=sales-report-${period}-${new Date().toISOString().split("T")[0]}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Failed to generate Excel report:", error);
    res.status(500).json({ success: false, error: "Failed to generate Excel report" });
  }
});
import express from "express";
import db from "../db/database.js";
import {
  authenticateToken,
  requireRestaurantAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// Get statistics (Restaurant Admin and above)
router.get("/stats", requireRestaurantAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    // Today's stats
    const [todayStats] = await db.query(
      `SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as totalSales 
       FROM orders 
       WHERE DATE(created_at) = ? AND is_deleted = 0`,
      [todayStr]
    );

    // Week stats
    const [weekStats] = await db.query(
      `SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as totalSales 
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0`,
      [weekAgoStr]
    );

    // Top items
    const [topItems] = await db.query(
      `SELECT 
        oi.name,
        SUM(oi.quantity) as quantity,
        SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) >= ?
       GROUP BY oi.name
       ORDER BY revenue DESC
       LIMIT 10`,
      [weekAgoStr]
    );

    res.json({
      success: true,
      data: {
        todaySales: (todayStats as any)[0].totalSales || 0,
        todayOrders: (todayStats as any)[0].orderCount || 0,
        weekSales: (weekStats as any)[0].totalSales || 0,
        weekOrders: (weekStats as any)[0].orderCount || 0,
        topItems: topItems || [],
      },
    });
  } catch (error) {
    console.error("Failed to get stats:", error);
    res.status(500).json({ success: false, error: "Failed to get statistics" });
  }
});

// Get reports by period (Restaurant Admin and above)
router.get("/reports/:period", requireRestaurantAdmin, async (req, res) => {
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
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalSales,
        COALESCE(AVG(total), 0) as avgOrder
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0`,
      [startDateStr]
    );

    // Top items
    const [topItems] = await db.query(
      `SELECT 
        oi.name,
        SUM(oi.quantity) as quantity,
        SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) >= ? AND o.is_deleted = 0
       GROUP BY oi.name
       ORDER BY revenue DESC
       LIMIT 20`,
      [startDateStr]
    );

    // Payment methods breakdown
    const [paymentMethods] = await db.query(
      `SELECT 
        payment_method as paymentMethod,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
       FROM orders 
       WHERE DATE(created_at) >= ? AND payment_method IS NOT NULL AND is_deleted = 0
       GROUP BY payment_method`,
      [startDateStr]
    );

    // Recent orders with details
    const [recentOrders] = await db.query(
      `SELECT 
        id,
        total,
        status,
        payment_method as paymentMethod,
        created_at as createdAt
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0
       ORDER BY created_at DESC
       LIMIT 50`,
      [startDateStr]
    );

    // Get order items for recent orders
    const orderIds = (recentOrders as any[]).map((order: any) => order.id);
    let orderItems: any[] = [];

    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => "?").join(",");
      const [items] = await db.query(
        `SELECT 
          order_id as orderId,
          name,
          quantity,
          price
         FROM order_items 
         WHERE order_id IN (${placeholders})`,
        orderIds
      );
      orderItems = items as any[];
    }

    // Group items by order
    const ordersWithItems = (recentOrders as any[]).map((order: any) => ({
      ...order,
      items: orderItems.filter((item: any) => item.orderId === order.id),
    }));

    // Hourly sales distribution
    const [hourlySales] = await db.query(
      `SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as orderCount,
        COALESCE(SUM(total), 0) as sales
       FROM orders 
       WHERE DATE(created_at) >= ? AND is_deleted = 0
       GROUP BY HOUR(created_at)
       ORDER BY hour`,
      [startDateStr]
    );

    const paymentMethodsMap: any = {};
    (paymentMethods as any[]).forEach((pm: any) => {
      paymentMethodsMap[pm.paymentMethod] = {
        count: pm.count,
        total: pm.total,
      };
    });

    res.json({
      success: true,
      data: {
        totalOrders: (stats as any)[0].totalOrders || 0,
        totalSales: (stats as any)[0].totalSales || 0,
        avgOrder: (stats as any)[0].avgOrder || 0,
        topItems: topItems || [],
        paymentMethods: paymentMethodsMap,
        recentOrders: ordersWithItems || [],
        hourlySales: hourlySales || [],
      },
    });
  } catch (error) {
    console.error("Failed to get report:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate report" });
  }
});

// Menu management routes
// Add new menu item (Restaurant Admin and above)
router.post("/menu/:type", requireRestaurantAdmin, async (req, res) => {
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
    let values: any[] = [];

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

    await db.query(query, values);

    res.json({ success: true, data: { id, ...data } });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    res.status(500).json({ success: false, error: "Failed to create item" });
  }
});

// Update menu item (Restaurant Admin and above)
router.put("/menu/:type/:id", requireRestaurantAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const data = req.body;

    let query = "";
    let values: any[] = [];

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

    await db.query(query, values);

    res.json({ success: true, data: { id, ...data } });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    res.status(500).json({ success: false, error: "Failed to update item" });
  }
});

// Delete menu item (Restaurant Admin and above)
router.delete("/menu/:type/:id", requireRestaurantAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;

    const tables: any = {
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

    await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    res.status(500).json({ success: false, error: "Failed to delete item" });
  }
});

// Get deleted orders report (Restaurant Admin and above)
router.get(
  "/reports/deleted-orders",
  requireRestaurantAdmin,
  async (req, res) => {
    try {
      // Get deleted orders with details
      const [deletedOrders] = await db.query(
        `SELECT 
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
       LIMIT 500`
      ); // Get order items for deleted orders
      const orderIds = (deletedOrders as any[]).map((order: any) => order.id);
      let orderItems: any[] = [];

      if (orderIds.length > 0) {
        const placeholders = orderIds.map(() => "?").join(",");
        const [items] = await db.query(
          `SELECT 
          order_id as orderId,
          name,
          quantity,
          price
         FROM order_items 
         WHERE order_id IN (${placeholders})`,
          orderIds
        );
        orderItems = items as any[];
      }

      // Group items by order
      const ordersWithItems = (deletedOrders as any[]).map((order: any) => ({
        ...order,
        items: orderItems.filter((item: any) => item.orderId === order.id),
      }));

      res.json({
        success: true,
        data: ordersWithItems,
      });
    } catch (error: any) {
      console.error("Deleted orders report error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
