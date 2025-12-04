import { pool } from "./database";

async function addComboToppingsColumn() {
  const connection = await pool.getConnection();

  try {
    console.log("Adding toppings_allowed column to combo_deals table...");

    // Check if column already exists
    const [columns]: any = await connection.query(`
      SHOW COLUMNS FROM combo_deals LIKE 'toppings_allowed'
    `);

    if (columns.length === 0) {
      // Add the column
      await connection.query(`
        ALTER TABLE combo_deals 
        ADD COLUMN toppings_allowed INT DEFAULT 3 AFTER items
      `);
      console.log("✅ Successfully added toppings_allowed column");
    } else {
      console.log("ℹ️  Column toppings_allowed already exists");
    }
  } catch (error) {
    console.error("❌ Error adding column:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if executed directly
if (require.main === module) {
  addComboToppingsColumn()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { addComboToppingsColumn };
