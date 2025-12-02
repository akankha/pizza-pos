const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
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

// Get all users
router.get("/", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, full_name, role, active, created_at, last_login FROM admin_users"
    );
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    // This would normally use auth middleware, for now return mock
    res.json({
      success: true,
      data: { id: "1", username: "admin", role: "super_admin" },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

// Create user
router.post("/", async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.query(
      "INSERT INTO admin_users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
      [userId, username, hashedPassword, full_name, role]
    );

    const [users] = await pool.query(
      "SELECT id, username, full_name, role, active, created_at FROM admin_users WHERE id = ?",
      [userId]
    );
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, error: "Failed to create user" });
  }
});

// Update user
router.put("/:userId", async (req, res) => {
  try {
    const { full_name, role, password } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE admin_users SET full_name = ?, role = ?, password_hash = ? WHERE id = ?",
        [full_name, role, hashedPassword, req.params.userId]
      );
    } else {
      await pool.query(
        "UPDATE admin_users SET full_name = ?, role = ? WHERE id = ?",
        [full_name, role, req.params.userId]
      );
    }

    const [users] = await pool.query(
      "SELECT id, username, full_name, role, active, created_at FROM admin_users WHERE id = ?",
      [req.params.userId]
    );
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
});

// Delete user
router.delete("/:userId", async (req, res) => {
  try {
    await pool.query("DELETE FROM admin_users WHERE id = ?", [
      req.params.userId,
    ]);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});

// Get roles and permissions
router.get("/roles/permissions", async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT * FROM roles");
    const [permissions] = await pool.query("SELECT * FROM permissions");
    res.json({ success: true, data: { roles, permissions } });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ success: false, error: "Failed to fetch roles" });
  }
});

module.exports = router;
