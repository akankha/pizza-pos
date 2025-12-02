const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

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

async function initDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Creating tables...");

    // Sizes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sizes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        base_price DECIMAL(10, 2) NOT NULL
      )
    `);

    // Crusts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS crusts (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        price_modifier DECIMAL(10, 2) NOT NULL DEFAULT 0
      )
    `);

    // Toppings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS toppings (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL
      )
    `);

    // Menu items (sides and drinks)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT
      )
    `);

    // Specialty pizzas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS specialty_pizzas (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        toppings TEXT NOT NULL,
        price_small DECIMAL(10, 2) NOT NULL,
        price_medium DECIMAL(10, 2) NOT NULL,
        price_large DECIMAL(10, 2) NOT NULL,
        price_xlarge DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) DEFAULT 'specialty',
        active TINYINT(1) NOT NULL DEFAULT 1
      )
    `);

    // Combo deals
    await connection.query(`
      CREATE TABLE IF NOT EXISTS combo_deals (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        items TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'combo',
        active TINYINT(1) NOT NULL DEFAULT 1
      )
    `);

    // Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(50),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        custom_data TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_by VARCHAR(255),
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        INDEX idx_role (role),
        INDEX idx_active (active),
        FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
      )
    `);

    // Roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
      )
    `);

    // Permissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(255) PRIMARY KEY,
        role_id VARCHAR(255) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        actions TEXT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);

    // Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS restaurant_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        restaurant_name VARCHAR(255) NOT NULL DEFAULT 'Pizza Paradise',
        restaurant_address VARCHAR(255) NOT NULL DEFAULT '123 Main Street',
        restaurant_city VARCHAR(255) NOT NULL DEFAULT 'Your City, ST 12345',
        restaurant_phone VARCHAR(50) NOT NULL DEFAULT '(555) 123-4567',
        gst_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.05,
        pst_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.07,
        tax_label_gst VARCHAR(50) NOT NULL DEFAULT 'GST',
        tax_label_pst VARCHAR(50) NOT NULL DEFAULT 'PST',
        printer_enabled TINYINT(1) NOT NULL DEFAULT 1,
        auto_print TINYINT(1) NOT NULL DEFAULT 1,
        print_copies INT NOT NULL DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Tables created successfully");

    // Check if admin user exists
    const [users] = await connection.query(
      "SELECT COUNT(*) as count FROM admin_users"
    );
    if (users[0].count === 0) {
      console.log("Seeding admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await connection.query(
        "INSERT INTO admin_users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
        [uuidv4(), "admin", hashedPassword, "Administrator", "super_admin"]
      );
      console.log(
        "✅ Admin user created (username: admin, password: admin123)"
      );
    }

    // Check if default settings exist
    const [settings] = await connection.query(
      "SELECT COUNT(*) as count FROM restaurant_settings"
    );
    if (settings[0].count === 0) {
      console.log("Seeding default settings...");
      await connection.query(
        `INSERT INTO restaurant_settings (
          restaurant_name, restaurant_address, restaurant_city, restaurant_phone,
          gst_rate, pst_rate, tax_label_gst, tax_label_pst
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Pizza Paradise",
          "123 Main Street",
          "Your City, ST 12345",
          "(555) 123-4567",
          0.05,
          0.07,
          "GST",
          "PST",
        ]
      );
      console.log("✅ Default settings created");
    }

    return { success: true, message: "Database initialized successfully" };
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { initDatabase };
