import db from './database.js';

async function addDiscountColumns() {
  try {
    console.log('Adding discount columns to orders table...');

    // Check if columns already exist
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'orders'
      AND COLUMN_NAME IN ('discount_percent','discount_amount')
    `);

    const existing = (columns as any[]).map((c) => c.COLUMN_NAME);

    if (existing.includes('discount_percent') && existing.includes('discount_amount')) {
      console.log('Discount columns already exist, skipping...');
      return;
    }

    const queries: string[] = [];

    if (!existing.includes('discount_percent')) {
      queries.push("ADD COLUMN discount_percent DECIMAL(5,2) NULL AFTER subtotal");
    }

    if (!existing.includes('discount_amount')) {
      queries.push("ADD COLUMN discount_amount DECIMAL(10,2) NULL AFTER discount_percent");
    }

    if (queries.length > 0) {
      const alterSql = `ALTER TABLE orders ${queries.join(', ')}`;
      await db.query(alterSql);
      console.log('Successfully added discount columns to orders table');
    }
  } catch (error) {
    console.error('Migration error (add-discounts):', error);
    throw error;
  } finally {
    await db.end();
  }
}

addDiscountColumns();
