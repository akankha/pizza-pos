"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const database_js_1 = __importDefault(require("../db/database.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
// Get all users (Restaurant Admin and Super Admin can view)
router.get('/', auth_js_1.authenticateToken, auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const [users] = await database_js_1.default.query(`
      SELECT 
        id, 
        username, 
        full_name, 
        role, 
        created_by, 
        active, 
        created_at, 
        last_login 
      FROM admin_users 
      ORDER BY created_at DESC
    `);
        res.json({ success: true, data: users });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});
// Get current user info
router.get('/me', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const [users] = await database_js_1.default.query(`
      SELECT 
        id, 
        username, 
        full_name, 
        role, 
        created_by, 
        active, 
        created_at, 
        last_login 
      FROM admin_users 
      WHERE id = ?
    `, [req.user?.id]);
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: users[0] });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user info' });
    }
});
// Create new user (Restaurant Admin can create reception/kitchen, Super Admin can create all)
router.post('/', auth_js_1.authenticateToken, auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;
        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'Username, password, and role are required'
            });
        }
        // Validate role
        const validRoles = ['super_admin', 'restaurant_admin', 'reception', 'kitchen'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be: super_admin, restaurant_admin, reception, or kitchen'
            });
        }
        // Check permissions: Restaurant Admin can only create reception/kitchen users
        if (req.user?.role === 'restaurant_admin' && (role === 'super_admin' || role === 'restaurant_admin')) {
            return res.status(403).json({
                success: false,
                error: 'Restaurant Admin can only create reception and kitchen users'
            });
        }
        // Check if username already exists
        const [existing] = await database_js_1.default.query('SELECT id FROM admin_users WHERE username = ?', [username]);
        if (Array.isArray(existing) && existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Username already exists'
            });
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        // Create user
        const userId = (0, uuid_1.v4)();
        await database_js_1.default.query(`
      INSERT INTO admin_users (
        id, 
        username, 
        password_hash, 
        full_name, 
        role, 
        created_by, 
        active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, username, passwordHash, full_name || null, role, req.user?.id, 1]);
        // Get created user
        const [users] = await database_js_1.default.query(`
      SELECT 
        id, 
        username, 
        full_name, 
        role, 
        created_by, 
        active, 
        created_at 
      FROM admin_users 
      WHERE id = ?
    `, [userId]);
        res.status(201).json({
            success: true,
            data: users[0]
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, error: 'Failed to create user' });
    }
});
// Update user (Restaurant Admin can update their created users, Super Admin can update all)
router.put('/:id', auth_js_1.authenticateToken, auth_js_1.requireRestaurantAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, active, password } = req.body;
        // Get target user
        const [users] = await database_js_1.default.query('SELECT * FROM admin_users WHERE id = ?', [id]);
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const targetUser = users[0];
        // Check permissions
        if (req.user?.role === 'restaurant_admin') {
            // Restaurant Admin can only update users they created
            if (targetUser.created_by !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only update users you created'
                });
            }
            // Cannot update super_admin or restaurant_admin
            if (targetUser.role === 'super_admin' || targetUser.role === 'restaurant_admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot update admin users'
                });
            }
        }
        // Build update query
        const updates = [];
        const values = [];
        if (full_name !== undefined) {
            updates.push('full_name = ?');
            values.push(full_name);
        }
        if (active !== undefined) {
            updates.push('active = ?');
            values.push(active ? 1 : 0);
        }
        if (password) {
            const passwordHash = await bcrypt_1.default.hash(password, 10);
            updates.push('password_hash = ?');
            values.push(passwordHash);
        }
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
        values.push(id);
        await database_js_1.default.query(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, values);
        // Get updated user
        const [updatedUsers] = await database_js_1.default.query(`
      SELECT 
        id, 
        username, 
        full_name, 
        role, 
        created_by, 
        active, 
        created_at, 
        last_login 
      FROM admin_users 
      WHERE id = ?
    `, [id]);
        res.json({
            success: true,
            data: updatedUsers[0]
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});
// Delete user (Only Super Admin can delete users)
router.delete('/:id', auth_js_1.authenticateToken, auth_js_1.requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Cannot delete yourself
        if (id === req.user?.id) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your own account'
            });
        }
        // Get user
        const [users] = await database_js_1.default.query('SELECT * FROM admin_users WHERE id = ?', [id]);
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        await database_js_1.default.query('DELETE FROM admin_users WHERE id = ?', [id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
});
// Get role permissions info
router.get('/roles/permissions', auth_js_1.authenticateToken, async (req, res) => {
    const rolePermissions = {
        super_admin: {
            label: 'Super Admin',
            description: 'Full system access including settings, all users, reports, and menu management',
            permissions: [
                'Manage restaurant settings',
                'Create/edit/delete all user roles',
                'View all reports and analytics',
                'Manage menu items and prices',
                'View and manage all orders',
                'Access kitchen display',
                'Configure printer settings',
                'Full system control'
            ],
            canCreate: ['super_admin', 'restaurant_admin', 'reception', 'kitchen']
        },
        restaurant_admin: {
            label: 'Restaurant Admin',
            description: 'Manage menu, create reception and kitchen users, view reports',
            permissions: [
                'Manage menu items and prices',
                'Create reception and kitchen users',
                'View reports and analytics',
                'View and manage orders',
                'Access kitchen display',
                'Take orders (reception access)'
            ],
            canCreate: ['reception', 'kitchen']
        },
        reception: {
            label: 'Reception',
            description: 'Take orders and view active orders',
            permissions: [
                'Take customer orders',
                'View active orders',
                'Process payments',
                'Print receipts',
                'View menu prices'
            ],
            canCreate: []
        },
        kitchen: {
            label: 'Kitchen',
            description: 'View kitchen display and update order status',
            permissions: [
                'View kitchen display',
                'Update order status',
                'Mark orders as preparing/ready/completed',
                'View order details'
            ],
            canCreate: []
        }
    };
    res.json({ success: true, data: rolePermissions });
});
exports.default = router;
