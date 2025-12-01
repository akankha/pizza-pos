import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query as db } from '../db/database.js';
import { validateLogin } from '../middleware/validation.js';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

interface AdminUser extends RowDataPacket {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  active: number;
}

// Login endpoint
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Fetch user from database
    const [users] = await db(
      'SELECT * FROM admin_users WHERE username = ? AND active = 1 LIMIT 1',
      [username]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    const user = users[0] as AdminUser;

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      secret,
      { expiresIn } as SignOptions
    );

    // Update last login
    await db(
      'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      success: true, 
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
      role: string;
    };

    res.json({ 
      success: true, 
      data: {
        user: {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        }
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
});

export default router;
