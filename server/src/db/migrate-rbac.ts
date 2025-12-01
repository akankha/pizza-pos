import pool from './database';

/**
 * Migration script to add RBAC (Role-Based Access Control) to existing database
 * 
 * This script:
 * 1. Checks if admin_users table needs migration
 * 2. Adds new columns: full_name, created_by
 * 3. Modifies role column to use ENUM
 * 4. Adds indexes for performance
 * 5. Updates existing admin users to super_admin role
 */

async function migrateRBAC() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting RBAC migration...\n');

    // Check if admin_users table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'
    `, [process.env.DB_NAME || 'pizza_pos']);

    if ((tables as any[]).length === 0) {
      console.log('❌ admin_users table does not exist. Please run the server first to create initial tables.');
      return;
    }

    console.log('✅ admin_users table found');

    // Check current table structure
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'
    `, [process.env.DB_NAME || 'pizza_pos']);

    const columnNames = (columns as any[]).map(col => col.COLUMN_NAME);
    console.log('📋 Current columns:', columnNames.join(', '));

    // Check if migration is needed
    const hasFullName = columnNames.includes('full_name');
    const hasCreatedBy = columnNames.includes('created_by');
    const hasNewRole = (columns as any[]).find(col => 
      col.COLUMN_NAME === 'role' && col.COLUMN_TYPE.includes('super_admin')
    );

    if (hasFullName && hasCreatedBy && hasNewRole) {
      console.log('\n✅ Database already migrated to RBAC system. No changes needed.');
      return;
    }

    console.log('\n🔧 Migration needed. Starting updates...\n');

    // Backup suggestion
    console.log('⚠️  IMPORTANT: It is recommended to backup your database before migration!');
    console.log('   Run: mysqldump -u root -proot pizza_pos > backup_$(date +%Y%m%d_%H%M%S).sql\n');

    // Step 1: Add full_name column if not exists
    if (!hasFullName) {
      console.log('Adding full_name column...');
      await connection.query(`
        ALTER TABLE admin_users 
        ADD COLUMN full_name VARCHAR(100) AFTER password_hash
      `);
      console.log('✅ full_name column added');
    } else {
      console.log('⏭️  full_name column already exists');
    }

    // Step 2: Modify role column to ENUM (only if not already done)
    if (!hasNewRole) {
      console.log('Updating role column to ENUM...');
      
      // First, check if there are any existing roles that need to be migrated
      const [existingRoles] = await connection.query(`
        SELECT DISTINCT role FROM admin_users
      `);
      
      const roles = (existingRoles as any[]).map(r => r.role);
      console.log('📊 Existing roles:', roles.join(', '));

      // Update old 'admin' role to 'super_admin'
      await connection.query(`
        UPDATE admin_users 
        SET role = 'super_admin' 
        WHERE role = 'admin' OR role NOT IN ('super_admin', 'restaurant_admin', 'reception', 'kitchen')
      `);
      console.log('✅ Updated existing admin users to super_admin');

      // Modify column to ENUM
      await connection.query(`
        ALTER TABLE admin_users 
        MODIFY COLUMN role ENUM('super_admin', 'restaurant_admin', 'reception', 'kitchen') 
        NOT NULL DEFAULT 'reception'
      `);
      console.log('✅ role column updated to ENUM');
    } else {
      console.log('⏭️  role column already uses new ENUM values');
    }

    // Step 3: Add created_by column if not exists
    if (!hasCreatedBy) {
      console.log('Adding created_by column...');
      await connection.query(`
        ALTER TABLE admin_users 
        ADD COLUMN created_by VARCHAR(255) AFTER role
      `);
      console.log('✅ created_by column added');
    } else {
      console.log('⏭️  created_by column already exists');
    }

    // Step 4: Add indexes if they don't exist
    console.log('Checking indexes...');
    
    const [indexes] = await connection.query(`
      SHOW INDEX FROM admin_users WHERE Key_name IN ('idx_role', 'idx_active')
    `);
    
    const indexNames = (indexes as any[]).map(idx => idx.Key_name);
    
    if (!indexNames.includes('idx_role')) {
      await connection.query(`
        ALTER TABLE admin_users 
        ADD INDEX idx_role (role)
      `);
      console.log('✅ idx_role index added');
    } else {
      console.log('⏭️  idx_role index already exists');
    }

    if (!indexNames.includes('idx_active')) {
      await connection.query(`
        ALTER TABLE admin_users 
        ADD INDEX idx_active (active)
      `);
      console.log('✅ idx_active index added');
    } else {
      console.log('⏭️  idx_active index already exists');
    }

    // Step 5: Add foreign key constraint for created_by (with error handling)
    console.log('Adding foreign key constraint...');
    try {
      const [constraints] = await connection.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'admin_users' 
        AND CONSTRAINT_NAME LIKE 'admin_users_ibfk%'
      `, [process.env.DB_NAME || 'pizza_pos']);

      if ((constraints as any[]).length === 0) {
        await connection.query(`
          ALTER TABLE admin_users 
          ADD CONSTRAINT admin_users_ibfk_1 
          FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
        `);
        console.log('✅ Foreign key constraint added');
      } else {
        console.log('⏭️  Foreign key constraint already exists');
      }
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_FK_DUP_NAME') {
        console.log('⏭️  Foreign key constraint already exists');
      } else {
        console.log('⚠️  Warning: Could not add foreign key constraint:', error.message);
        console.log('   This is not critical - the system will still work.');
      }
    }

    // Step 6: Update existing admin users with full names if empty
    await connection.query(`
      UPDATE admin_users 
      SET full_name = CONCAT(UPPER(SUBSTRING(username, 1, 1)), SUBSTRING(username, 2), ' (Admin)')
      WHERE full_name IS NULL OR full_name = ''
    `);
    console.log('✅ Updated full names for existing users');

    // Verify final structure
    console.log('\n📊 Final table structure:');
    const [finalColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'pizza_pos']);

    console.table(finalColumns);

    // Show current users
    const [users] = await connection.query(`
      SELECT id, username, full_name, role, active, created_at 
      FROM admin_users
    `);

    console.log('\n👥 Current users after migration:');
    console.table(users);

    console.log('\n✅ RBAC migration completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Restart your server: npm run dev');
    console.log('   2. Login with existing admin credentials');
    console.log('   3. Go to Admin Dashboard → User Management');
    console.log('   4. Create users with different roles (reception, kitchen, etc.)');
    console.log('   5. Change default admin password if still using default!\n');

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
migrateRBAC()
  .then(() => {
    console.log('🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
