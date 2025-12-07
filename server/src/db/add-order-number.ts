import db from './database.js';

async function addOrderNumberColumn() {
  try {
    console.log('Adding order_number column to orders table...');

    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME = 'order_number'
    `);

    if ((columns as any[]).length > 0) {
      console.log('order_number column already exists, skipping...');
      return;
    }

    await db.query(`
      ALTER TABLE orders
      ADD COLUMN order_number INT NULL AFTER id
    `);

    console.log('Successfully added order_number column to orders table');

    // Populate existing orders with derived order numbers
    const [orders] = await db.query(`
      SELECT id FROM orders WHERE order_number IS NULL
    `);

    for (const order of orders as any[]) {
      const id = order.id;
      const fromId = parseInt(
        String(id || "").replace(/\D/g, "").slice(-6),
        10
      );
      const orderNumber = Number.isFinite(fromId) ? fromId : parseInt(Date.now().toString().slice(-6), 10);

      await db.query(
        'UPDATE orders SET order_number = ? WHERE id = ?',
        [orderNumber, id]
      );
    }

    console.log(`Updated ${(orders as any[]).length} existing orders with order numbers`);
  } catch (error) {
    console.error('Migration error (add-order-number):', error);
    throw error;
  } finally {
    await db.end();
  }
}

addOrderNumberColumn();