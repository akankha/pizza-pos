import pool from "./database";

async function addSoftDeleteColumns() {
  const connection = await pool.getConnection();

  try {
    console.log("Adding soft delete columns to orders table...");

    // Check if columns already exist
    const [columns]: any = await connection.query(`
      SHOW COLUMNS FROM orders LIKE 'is_deleted'
    `);

    if (columns.length === 0) {
      // Add the columns
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        ADD COLUMN deleted_at DATETIME NULL,
        ADD COLUMN deleted_by VARCHAR(255) NULL,
        ADD COLUMN delete_note TEXT NULL
      `);
      console.log("✅ Successfully added soft delete columns");
    } else {
      console.log("ℹ️  Soft delete columns already exist");
    }

    // Update the getAllOrders query to exclude deleted orders by default
    console.log(
      "✅ Migration completed - Orders table now supports soft delete"
    );
  } catch (error) {
    console.error("❌ Error adding columns:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if executed directly
if (require.main === module) {
  addSoftDeleteColumns()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { addSoftDeleteColumns };
