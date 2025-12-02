const express = require("express");
const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "pizza_pos",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create order
router.post("/", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { items, paymentMethod, notes } = req.body;
    const orderId = uuidv4();
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Insert order
    await connection.query(
      "INSERT INTO orders (id, total, payment_method, notes, status) VALUES (?, ?, ?, ?, ?)",
      [orderId, total, paymentMethod, notes || null, "pending"]
    );

    // Insert order items
    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (id, order_id, type, item_name, quantity, price, item_data) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          uuidv4(),
          orderId,
          item.type,
          item.name,
          item.quantity,
          item.price,
          JSON.stringify(item),
        ]
      );
    }

    await connection.commit();

    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );
    res.json({ success: true, data: orders[0] });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  } finally {
    connection.release();
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.payment_method as paymentMethod, o.notes, 
        o.created_at as createdAt, o.updated_at as updatedAt,
        COALESCE(
          (SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', oi.id,
            'type', oi.type,
            'name', oi.item_name,
            'quantity', oi.quantity,
            'price', oi.price
          )) FROM order_items oi WHERE oi.order_id = o.id),
          JSON_ARRAY()
        ) as items
      FROM orders o 
      ORDER BY o.created_at DESC 
      LIMIT 100`
    );

    // Parse JSON fields
    const parsedOrders = orders.map((order) => ({
      ...order,
      items:
        typeof order.items === "string" ? JSON.parse(order.items) : order.items,
    }));

    res.json({ success: true, data: parsedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// Get pending orders (for kitchen)
router.get("/pending", async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.payment_method, o.notes, 
        o.created_at as createdAt, o.updated_at as updatedAt,
        COALESCE(
          (SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', oi.id,
            'type', oi.type,
            'name', oi.item_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'customPizza', IF(oi.custom_data IS NOT NULL, JSON_EXTRACT(oi.custom_data, '$.customPizza'), NULL),
            'notes', IF(oi.custom_data IS NOT NULL, JSON_EXTRACT(oi.custom_data, '$.notes'), NULL)
          )) FROM order_items oi WHERE oi.order_id = o.id),
          JSON_ARRAY()
        ) as items
      FROM orders o 
      WHERE o.status IN ('pending', 'preparing')
      ORDER BY o.created_at ASC`
    );

    // Parse JSON fields
    const parsedOrders = orders.map((order) => ({
      ...order,
      items:
        typeof order.items === "string" ? JSON.parse(order.items) : order.items,
      paymentMethod: order.payment_method,
    }));

    res.json({ success: true, data: parsedOrders });
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch pending orders" });
  }
});

// Get order by ID
router.get("/:orderId", async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.payment_method as paymentMethod, o.notes, 
        o.created_at as createdAt, o.updated_at as updatedAt,
        COALESCE(
          (SELECT JSON_ARRAYAGG(JSON_OBJECT(
            'id', oi.id,
            'type', oi.type,
            'name', oi.item_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'customPizza', IF(oi.custom_data IS NOT NULL, JSON_EXTRACT(oi.custom_data, '$.customPizza'), NULL),
            'notes', IF(oi.custom_data IS NOT NULL, JSON_EXTRACT(oi.custom_data, '$.notes'), NULL)
          )) FROM order_items oi WHERE oi.order_id = o.id),
          JSON_ARRAY()
        ) as items
      FROM orders o 
      WHERE o.id = ?`,
      [req.params.orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const order = {
      ...orders[0],
      items:
        typeof orders[0].items === "string"
          ? JSON.parse(orders[0].items)
          : orders[0].items,
    };

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
});

// Update order status
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    await pool.query(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, req.params.orderId]
    );

    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [
      req.params.orderId,
    ]);
    res.json({ success: true, data: orders[0] });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, error: "Failed to update order" });
  }
});

module.exports = router;
