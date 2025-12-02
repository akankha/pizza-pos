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

// Get all menu items
router.get("/", async (req, res) => {
  try {
    const [items] = await pool.query("SELECT * FROM menu_items");
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ success: false, error: "Failed to fetch menu" });
  }
});

// Get sizes
router.get("/sizes", async (req, res) => {
  try {
    const [sizes] = await pool.query(
      "SELECT * FROM sizes ORDER BY base_price ASC"
    );
    res.json({ success: true, data: sizes });
  } catch (error) {
    console.error("Error fetching sizes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch sizes" });
  }
});

// Get crusts
router.get("/crusts", async (req, res) => {
  try {
    const [crusts] = await pool.query(
      "SELECT * FROM crusts ORDER BY price_modifier ASC"
    );
    res.json({ success: true, data: crusts });
  } catch (error) {
    console.error("Error fetching crusts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch crusts" });
  }
});

// Get toppings
router.get("/toppings", async (req, res) => {
  try {
    const [toppings] = await pool.query(
      "SELECT * FROM toppings ORDER BY category, name"
    );
    res.json({ success: true, data: toppings });
  } catch (error) {
    console.error("Error fetching toppings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch toppings" });
  }
});

// Get specialty pizzas
router.get("/specialty-pizzas", async (req, res) => {
  try {
    const [pizzas] = await pool.query(
      "SELECT * FROM specialty_pizzas WHERE active = 1"
    );
    res.json({ success: true, data: pizzas });
  } catch (error) {
    console.error("Error fetching specialty pizzas:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch specialty pizzas" });
  }
});

// Get combos
router.get("/combos", async (req, res) => {
  try {
    const [combos] = await pool.query(
      "SELECT * FROM combo_deals WHERE active = 1"
    );
    res.json({ success: true, data: combos });
  } catch (error) {
    console.error("Error fetching combos:", error);
    res.status(500).json({ success: false, error: "Failed to fetch combos" });
  }
});

// Get sides
router.get("/sides", async (req, res) => {
  try {
    const [sides] = await pool.query(
      "SELECT * FROM menu_items WHERE category = 'side'"
    );
    res.json({ success: true, data: sides });
  } catch (error) {
    console.error("Error fetching sides:", error);
    res.status(500).json({ success: false, error: "Failed to fetch sides" });
  }
});

// Get drinks
router.get("/drinks", async (req, res) => {
  try {
    const [drinks] = await pool.query(
      "SELECT * FROM menu_items WHERE category = 'drink'"
    );
    res.json({ success: true, data: drinks });
  } catch (error) {
    console.error("Error fetching drinks:", error);
    res.status(500).json({ success: false, error: "Failed to fetch drinks" });
  }
});

module.exports = router;
