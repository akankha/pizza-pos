const express = require("express");
const mysql = require("mysql2/promise");

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

// Get settings
router.get("/", async (req, res) => {
  try {
    const [settings] = await pool.query(
      "SELECT * FROM restaurant_settings LIMIT 1"
    );
    if (settings.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Settings not found" });
    }
    res.json({ success: true, data: settings[0] });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

// Update settings
router.put("/", async (req, res) => {
  try {
    const {
      restaurant_name,
      restaurant_address,
      restaurant_city,
      restaurant_phone,
      gst_rate,
      pst_rate,
      tax_label_gst,
      tax_label_pst,
      printer_enabled,
      auto_print,
      print_copies,
    } = req.body;

    await pool.query(
      `UPDATE restaurant_settings SET 
        restaurant_name = ?,
        restaurant_address = ?,
        restaurant_city = ?,
        restaurant_phone = ?,
        gst_rate = ?,
        pst_rate = ?,
        tax_label_gst = ?,
        tax_label_pst = ?,
        printer_enabled = ?,
        auto_print = ?,
        print_copies = ?
      WHERE id = 1`,
      [
        restaurant_name,
        restaurant_address,
        restaurant_city,
        restaurant_phone,
        gst_rate,
        pst_rate,
        tax_label_gst,
        tax_label_pst,
        printer_enabled,
        auto_print,
        print_copies,
      ]
    );

    res.json({ success: true, message: "Settings updated" });
  } catch (error) {
    console.error("Error updating settings:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update settings" });
  }
});

// Printer status
router.get("/printer/status", (req, res) => {
  res.json({
    success: true,
    data: {
      connected: false,
      message: "Printer not available in serverless mode",
    },
  });
});

// Test printer
router.post("/printer/test", (req, res) => {
  res.json({
    success: false,
    message: "Printer not available in serverless mode",
  });
});

module.exports = router;
