import express from "express";
import db from "../db/database.js";

const router = express.Router();

// Run database migration to add created_by columns
router.post("/add-created-by", async (req, res) => {
  try {
    console.log("Running migration: add created_by columns to orders table...");

    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'created_by'
    `);

    if ((columns as any[]).length > 0) {
      return res.json({
        success: true,
        message: "Migration already completed - columns already exist",
        alreadyExists: true,
      });
    }

    // Add created_by and created_by_name columns to orders table
    await db.query(`
ALTER TABLE orders 
ADD COLUMN created_by VARCHAR(36) NULL,
ADD COLUMN created_by_name VARCHAR(255) NULL
    `);

    console.log("Successfully added created_by and created_by_name columns");

    // Try to add foreign key constraint (may fail if users table doesn't exist)
    try {
      await db.query(`
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) 
ON DELETE SET NULL
      `);
      console.log("Successfully added foreign key constraint");
    } catch (fkError: any) {
      console.warn("Could not add foreign key constraint:", fkError.message);
      // Continue anyway - foreign key is optional
    }

    res.json({
      success: true,
      message:
        "Migration completed successfully - added created_by and created_by_name columns to orders table",
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Migration failed",
    });
  }
});

export default router;
