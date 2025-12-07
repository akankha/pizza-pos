import db from './database.js';

async function createCouponsTable() {
  try {
    console.log('Creating coupons table...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(255) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_amount DECIMAL(10, 2) DEFAULT 0,
        max_discount_amount DECIMAL(10, 2) NULL,
        expiry_date DATETIME NULL,
        usage_limit INT DEFAULT NULL,
        used_count INT DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS coupon_usages (
        id VARCHAR(255) PRIMARY KEY,
        coupon_id VARCHAR(255) NOT NULL,
        order_id VARCHAR(255) NOT NULL,
        discount_applied DECIMAL(10, 2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    console.log('Successfully created coupon_usages table');
  } catch (error) {
    console.error('Migration error (create-coupons-table):', error);
    throw error;
  } finally {
    await db.end();
  }
}

createCouponsTable();