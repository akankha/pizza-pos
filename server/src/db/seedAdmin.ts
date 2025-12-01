import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from './database.js';

export async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const [existingUsers] = await query(
      'SELECT id FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log('📦 Admin user already exists');
      return;
    }

    // Create default super admin user
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO admin_users (id, username, password_hash, full_name, role, active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), username, passwordHash, 'Super Administrator', 'super_admin', 1]
    );

    console.log('✅ Default super admin user created');
    console.log(`   Username: ${username}`);
    console.log(`   Role: super_admin`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`   ⚠️  Password: ${password} (CHANGE THIS IN PRODUCTION!)`);
    }
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
    throw error;
  }
}
