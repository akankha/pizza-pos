"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = seedAdminUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const database_js_1 = require("./database.js");
async function seedAdminUser() {
    try {
        // Check if admin user already exists
        const [existingUsers] = await (0, database_js_1.query)('SELECT id FROM admin_users WHERE username = ?', ['admin']);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            console.log('📦 Admin user already exists');
            return;
        }
        // Create default super admin user
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'admin123';
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        await (0, database_js_1.query)(`INSERT INTO admin_users (id, username, password_hash, full_name, role, active) 
       VALUES (?, ?, ?, ?, ?, ?)`, [(0, uuid_1.v4)(), username, passwordHash, 'Super Administrator', 'super_admin', 1]);
        console.log('✅ Default super admin user created');
        console.log(`   Username: ${username}`);
        console.log(`   Role: super_admin`);
        if (!process.env.ADMIN_PASSWORD) {
            console.log(`   ⚠️  Password: ${password} (CHANGE THIS IN PRODUCTION!)`);
        }
    }
    catch (error) {
        console.error('❌ Failed to seed admin user:', error);
        throw error;
    }
}
