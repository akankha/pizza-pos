import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Load environment variables
dotenv.config();
// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "pizza_pos",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 10000,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Create tables
export async function initDatabase() {
  // In production (like Hostinger), database should already exist
  // Only try to create database in local development
  if (process.env.NODE_ENV !== "production") {
    try {
      const connectionWithoutDb = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        port: dbConfig.port,
        connectTimeout: 10000,
      });

      try {
        // Create database if not exists
        await connectionWithoutDb.query(
          `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`
        );
        console.log(`✅ Database '${dbConfig.database}' ready`);
      } catch (error) {
        console.log(
          "⚠️ Could not create database (may already exist or no permissions)"
        );
      } finally {
        await connectionWithoutDb.end();
      }
    } catch (error: any) {
      console.log("⚠️ Skipping database creation (might already exist)");
      console.log(`Connection details: ${dbConfig.host}:${dbConfig.port}`);
    }
  }

  console.log(
    `📡 Connecting to database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
  );
  const connection = await pool.getConnection();

  try {
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

    // Specialty pizzas (pre-defined pizzas with set toppings and prices)
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

    // Combo deals and specials
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
        order_number INT NOT NULL AUTO_INCREMENT UNIQUE,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        tax_gst DECIMAL(10, 2) DEFAULT 0.00,
        tax_pst DECIMAL(10, 2) DEFAULT 0.00,
        total DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        payment_method ENUM('cash', 'card', 'debit', 'credit') DEFAULT NULL,
        customer_name VARCHAR(255) DEFAULT NULL,
        customer_phone VARCHAR(50) DEFAULT NULL,
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
        type ENUM('custom_pizza', 'specialty_pizza', 'combo_deal', 'side', 'drink') NOT NULL,
        specialty_pizza_id VARCHAR(255) DEFAULT NULL,
        combo_id VARCHAR(255) DEFAULT NULL,
        menu_item_id VARCHAR(255) DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        item_data JSON DEFAULT NULL,
        custom_pizza TEXT,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Admin users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM('super_admin', 'restaurant_admin', 'reception', 'kitchen') NOT NULL DEFAULT 'reception',
        created_by VARCHAR(255),
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        INDEX idx_username (username),
        INDEX idx_role (role),
        INDEX idx_active (active),
        FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
      )
    `);

    // Restaurant settings table
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default settings if not exists
    const [settingsRows] = await connection.query(
      "SELECT COUNT(*) as count FROM restaurant_settings"
    );
    const settingsCount = (settingsRows as any)[0].count;

    if (settingsCount === 0) {
      await connection.query(
        `
        INSERT INTO restaurant_settings (
          restaurant_name, restaurant_address, restaurant_city, restaurant_phone,
          gst_rate, pst_rate, tax_label_gst, tax_label_pst
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
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
    }

    console.log("✅ Database tables created");
  } finally {
    connection.release();
  }
}

// Seed initial data
export async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM sizes"
    );
    const sizeCount = (rows as any)[0].count;

    if (sizeCount > 0) {
      console.log("📦 Database already seeded");
      return;
    }

    // Insert sizes
    await connection.query(
      "INSERT INTO sizes (id, name, display_name, base_price) VALUES (?, ?, ?, ?)",
      ["size-small", "small", 'Small (10")', 8.99]
    );
    await connection.query(
      "INSERT INTO sizes (id, name, display_name, base_price) VALUES (?, ?, ?, ?)",
      ["size-medium", "medium", 'Medium (14")', 12.99]
    );
    await connection.query(
      "INSERT INTO sizes (id, name, display_name, base_price) VALUES (?, ?, ?, ?)",
      ["size-large", "large", 'Large (18")', 16.99]
    );

    // Insert crusts
    await connection.query(
      "INSERT INTO crusts (id, type, display_name, price_modifier) VALUES (?, ?, ?, ?)",
      ["crust-thin", "thin", "Thin Crust", 0]
    );
    await connection.query(
      "INSERT INTO crusts (id, type, display_name, price_modifier) VALUES (?, ?, ?, ?)",
      ["crust-regular", "regular", "Regular Crust", 0]
    );
    await connection.query(
      "INSERT INTO crusts (id, type, display_name, price_modifier) VALUES (?, ?, ?, ?)",
      ["crust-thick", "thick", "Thick Crust", 1.5]
    );
    await connection.query(
      "INSERT INTO crusts (id, type, display_name, price_modifier) VALUES (?, ?, ?, ?)",
      ["crust-stuffed", "stuffed", "Stuffed Crust", 3.0]
    );

    // Insert toppings - Meats
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-pepperoni", "Pepperoni", 1.5, "meat"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-sausage", "Italian Sausage", 1.5, "meat"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-bacon", "Bacon", 1.75, "meat"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-ham", "Ham", 1.5, "meat"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-chicken", "Grilled Chicken", 2.0, "meat"]
    );

    // Veggies
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-mushroom", "Mushrooms", 1.0, "veggie"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-onion", "Onions", 0.75, "veggie"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-pepper", "Bell Peppers", 1.0, "veggie"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-olive", "Black Olives", 1.0, "veggie"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-tomato", "Fresh Tomatoes", 1.0, "veggie"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-spinach", "Spinach", 1.25, "veggie"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-jalapeno", "Jalapeños", 1.0, "veggie"]
    );

    // Cheese
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-mozzarella", "Extra Mozzarella", 1.5, "cheese"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-parmesan", "Parmesan", 1.25, "cheese"]
    );
    await connection.query(
      "INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)",
      ["top-feta", "Feta Cheese", 1.75, "cheese"]
    );

    // Insert sides
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["side-wings", "Chicken Wings", "side", 8.99, "8 pieces"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["side-breadsticks", "Garlic Breadsticks", "side", 5.99, "6 pieces"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["side-salad", "Garden Salad", "side", 6.99, "Fresh greens"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["side-fries", "French Fries", "side", 4.99, "Crispy fries"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["side-mozzsticks", "Mozzarella Sticks", "side", 7.99, "6 pieces"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["side-onionrings", "Onion Rings", "side", 5.99, "8 pieces"]
    );

    // Insert drinks
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["drink-coke", "Coca-Cola", "drink", 2.49, "20 oz"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["drink-diet", "Diet Coke", "drink", 2.49, "20 oz"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["drink-sprite", "Sprite", "drink", 2.49, "20 oz"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["drink-water", "Bottled Water", "drink", 1.99, "16 oz"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["drink-lemonade", "Lemonade", "drink", 2.99, "20 oz"]
    );
    await connection.query(
      "INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)",
      ["drink-tea", "Iced Tea", "drink", 2.49, "20 oz"]
    );

    console.log("✅ Database seeded with initial data");
  } finally {
    connection.release();
  }
}

// Export query function for parameterized queries
export const query = (sql: string, params?: any[]) => pool.query(sql, params);

export default pool;
