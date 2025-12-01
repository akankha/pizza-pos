import pool from './database';

/**
 * Migration: Update Orders and Order Items Schema
 * 
 * This migration updates the database schema to support:
 * 1. Multiple order types (custom pizza, specialty, combos, sides, drinks)
 * 2. Better order tracking (order numbers, customer info)
 * 3. Detailed pricing breakdown (subtotal, taxes)
 * 4. Flexible item data storage (JSON)
 */

async function migrateOrderSchema() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting order schema migration...\n');

    // ==========================================
    // 1. UPDATE ORDERS TABLE
    // ==========================================
    console.log('📦 Updating orders table...');

    // Check current orders table structure
    const [ordersColumns] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders'
    `, [process.env.DB_NAME || 'pizza_pos']);

    const ordersColumnNames = (ordersColumns as any[]).map(col => col.COLUMN_NAME);

    // Add subtotal column
    if (!ordersColumnNames.includes('subtotal')) {
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER id
      `);
      console.log('  ✓ Added subtotal column');
    }

    // Add tax columns
    if (!ordersColumnNames.includes('tax_gst')) {
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN tax_gst DECIMAL(10, 2) DEFAULT 0 AFTER subtotal
      `);
      console.log('  ✓ Added tax_gst column');
    }

    if (!ordersColumnNames.includes('tax_pst')) {
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN tax_pst DECIMAL(10, 2) DEFAULT 0 AFTER tax_gst
      `);
      console.log('  ✓ Added tax_pst column');
    }

    // Update total column position
    // (MySQL doesn't allow MODIFY with AFTER if column already exists, so we skip repositioning)

    // Update status enum to include 'ready'
    await connection.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') 
      NOT NULL DEFAULT 'pending'
    `);
    console.log('  ✓ Updated status enum (added "ready")');

    // Update payment_method enum
    await connection.query(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_method ENUM('cash', 'card', 'debit', 'credit') DEFAULT NULL
    `);
    console.log('  ✓ Updated payment_method enum');

    // Add customer info columns
    if (!ordersColumnNames.includes('customer_name')) {
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN customer_name VARCHAR(255) AFTER payment_method
      `);
      console.log('  ✓ Added customer_name column');
    }

    if (!ordersColumnNames.includes('customer_phone')) {
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN customer_phone VARCHAR(50) AFTER customer_name
      `);
      console.log('  ✓ Added customer_phone column');
    }

    // Add order_number column (auto-increment)
    if (!ordersColumnNames.includes('order_number')) {
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN order_number INT AUTO_INCREMENT UNIQUE AFTER id,
        ADD INDEX idx_order_number (order_number)
      `);
      console.log('  ✓ Added order_number column with auto-increment');
    }

    // Add indexes for better query performance
    const [ordersIndexes] = await connection.query(`
      SHOW INDEX FROM orders WHERE Key_name IN ('idx_status', 'idx_created_at')
    `);
    const ordersIndexNames = (ordersIndexes as any[]).map(idx => idx.Key_name);

    if (!ordersIndexNames.includes('idx_status')) {
      await connection.query(`ALTER TABLE orders ADD INDEX idx_status (status)`);
      console.log('  ✓ Added idx_status index');
    }

    if (!ordersIndexNames.includes('idx_created_at')) {
      await connection.query(`ALTER TABLE orders ADD INDEX idx_created_at (created_at)`);
      console.log('  ✓ Added idx_created_at index');
    }

    // Update existing orders to have subtotal = total (for backward compatibility)
    await connection.query(`
      UPDATE orders 
      SET subtotal = total 
      WHERE subtotal = 0 OR subtotal IS NULL
    `);
    console.log('  ✓ Updated existing orders with subtotal\n');

    // ==========================================
    // 2. UPDATE ORDER_ITEMS TABLE
    // ==========================================
    console.log('📦 Updating order_items table...');

    // Check current order_items table structure
    const [itemsColumns] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'order_items'
    `, [process.env.DB_NAME || 'pizza_pos']);

    const itemsColumnNames = (itemsColumns as any[]).map(col => col.COLUMN_NAME);

    // Update type enum to include all order types
    // First, update existing 'pizza' types to 'custom_pizza'
    await connection.query(`
      UPDATE order_items 
      SET type = 'custom_pizza' 
      WHERE type = 'pizza'
    `);
    console.log('  ✓ Migrated existing "pizza" types to "custom_pizza"');

    await connection.query(`
      ALTER TABLE order_items 
      MODIFY COLUMN type ENUM('custom_pizza', 'specialty_pizza', 'combo_deal', 'side', 'drink') 
      NOT NULL
    `);
    console.log('  ✓ Updated type enum (custom_pizza, specialty_pizza, combo_deal, side, drink)');

    // Add foreign key columns
    if (!itemsColumnNames.includes('specialty_pizza_id')) {
      await connection.query(`
        ALTER TABLE order_items 
        ADD COLUMN specialty_pizza_id VARCHAR(255) AFTER type
      `);
      console.log('  ✓ Added specialty_pizza_id column');
    }

    if (!itemsColumnNames.includes('combo_id')) {
      await connection.query(`
        ALTER TABLE order_items 
        ADD COLUMN combo_id VARCHAR(255) AFTER specialty_pizza_id
      `);
      console.log('  ✓ Added combo_id column');
    }

    if (!itemsColumnNames.includes('menu_item_id')) {
      await connection.query(`
        ALTER TABLE order_items 
        ADD COLUMN menu_item_id VARCHAR(255) AFTER combo_id
      `);
      console.log('  ✓ Added menu_item_id column');
    }

    // Add item_data JSON column for flexible data storage
    if (!itemsColumnNames.includes('item_data')) {
      await connection.query(`
        ALTER TABLE order_items 
        ADD COLUMN item_data JSON AFTER quantity
      `);
      console.log('  ✓ Added item_data JSON column');
    }

    // Add indexes for foreign keys
    const [itemsIndexes] = await connection.query(`
      SHOW INDEX FROM order_items 
      WHERE Key_name IN ('idx_type', 'idx_specialty_pizza', 'idx_combo', 'idx_menu_item')
    `);
    const itemsIndexNames = (itemsIndexes as any[]).map(idx => idx.Key_name);

    if (!itemsIndexNames.includes('idx_type')) {
      await connection.query(`ALTER TABLE order_items ADD INDEX idx_type (type)`);
      console.log('  ✓ Added idx_type index');
    }

    if (!itemsIndexNames.includes('idx_specialty_pizza')) {
      await connection.query(`ALTER TABLE order_items ADD INDEX idx_specialty_pizza (specialty_pizza_id)`);
      console.log('  ✓ Added idx_specialty_pizza index');
    }

    if (!itemsIndexNames.includes('idx_combo')) {
      await connection.query(`ALTER TABLE order_items ADD INDEX idx_combo (combo_id)`);
      console.log('  ✓ Added idx_combo index');
    }

    if (!itemsIndexNames.includes('idx_menu_item')) {
      await connection.query(`ALTER TABLE order_items ADD INDEX idx_menu_item (menu_item_id)`);
      console.log('  ✓ Added idx_menu_item index');
    }

    // Migrate existing custom_pizza data to item_data JSON
    const [existingItems] = await connection.query(`
      SELECT id, custom_pizza, type FROM order_items 
      WHERE custom_pizza IS NOT NULL AND custom_pizza != ''
    `);

    if ((existingItems as any[]).length > 0) {
      console.log(`  ℹ️  Migrating ${(existingItems as any[]).length} existing custom pizza items...`);
      
      for (const item of (existingItems as any[])) {
        try {
          const customData = JSON.parse(item.custom_pizza);
          await connection.query(`
            UPDATE order_items 
            SET item_data = ?, type = 'custom_pizza'
            WHERE id = ?
          `, [JSON.stringify(customData), item.id]);
        } catch (err) {
          console.log(`    ⚠️  Warning: Could not migrate item ${item.id}`);
        }
      }
      console.log('  ✓ Migrated existing custom pizza data');
    }

    console.log('\n✅ Order schema migration completed successfully!\n');

    // Display final table structures
    console.log('📊 Final table structures:\n');
    
    const [finalOrdersCols] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'pizza_pos']);

    console.log('Orders Table:');
    console.table(finalOrdersCols);

    const [finalItemsCols] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'order_items'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'pizza_pos']);

    console.log('\nOrder Items Table:');
    console.table(finalItemsCols);

    console.log('\n📝 Migration summary:');
    console.log('   ✓ Orders table: Added subtotal, taxes, customer info, order number');
    console.log('   ✓ Order items table: Added item types, foreign keys, JSON data field');
    console.log('   ✓ Indexes: Added performance indexes');
    console.log('   ✓ Data migration: Existing orders preserved\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('📋 Full error:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run migration
migrateOrderSchema()
  .then(() => {
    console.log('🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
