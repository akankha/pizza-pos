import db from "./database.js";

async function addCreatedByColumn() {
  try {
    console.log("Adding created_by column to orders table...");

    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'created_by'
    `);

    if ((columns as any[]).length > 0) {
      console.log("Column created_by already exists, skipping...");
      return;
    }

    // Add created_by column to orders table
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN created_by VARCHAR(36) NULL,
      ADD COLUMN created_by_name VARCHAR(255) NULL
    `);

    console.log(
      "Successfully added created_by and created_by_name columns to orders table"
    );

    // Add foreign key constraint to users table
    await db.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT fk_orders_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL
    `);

    console.log("Successfully added foreign key constraint");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    await db.end();
  }
}

addCreatedByColumn();
