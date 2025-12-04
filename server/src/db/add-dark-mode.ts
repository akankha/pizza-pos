import { pool } from "./database";

async function addDarkModeColumn() {
  const connection = await pool.getConnection();

  try {
    console.log("Adding dark_mode column to restaurant_settings table...");

    // Check if column already exists
    const [columns]: any = await connection.query(`
      SHOW COLUMNS FROM restaurant_settings LIKE 'dark_mode'
    `);

    if (columns.length === 0) {
      // Add the column
      await connection.query(`
        ALTER TABLE restaurant_settings 
        ADD COLUMN dark_mode TINYINT(1) NOT NULL DEFAULT 0 AFTER print_copies
      `);
      console.log("✅ Successfully added dark_mode column");
    } else {
      console.log("ℹ️  Column dark_mode already exists");
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
  addDarkModeColumn()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { addDarkModeColumn };
