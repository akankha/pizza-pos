import express from 'express';
import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.json({ success: false, error: 'Coupon code is required' });
    }

    const [coupons] = await db.query(
      `SELECT * FROM coupons
       WHERE code = ? AND is_active = 1`,
      [code.toUpperCase()]
    );

    if ((coupons as any[]).length === 0) {
      return res.json({ success: false, error: 'Invalid coupon code' });
    }

    const coupon = (coupons as any[])[0];

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.json({ success: false, error: 'Coupon has expired' });
    }

    // Check minimum order amount
    if (orderAmount && orderAmount < coupon.min_order_amount) {
      return res.json({
        success: false,
        error: `Minimum order amount of $${coupon.min_order_amount} required`
      });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.json({ success: false, error: 'Coupon usage limit exceeded' });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        discountAmount: discountAmount,
        maxDiscountAmount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null
      }
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get all coupons (admin)
router.get('/', async (req, res) => {
  try {
    const [coupons] = await db.query(
      `SELECT * FROM coupons ORDER BY created_at DESC`
    );

    const transformedCoupons = (coupons as any[]).map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      minOrderAmount: Number(coupon.min_order_amount),
      maxDiscountAmount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
      expiryDate: coupon.expiry_date,
      usageLimit: coupon.usage_limit,
      usedCount: Number(coupon.used_count),
      isActive: Boolean(coupon.is_active),
      createdAt: coupon.created_at
    }));

    res.json({ success: true, coupons: transformedCoupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create coupon (admin)
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit
    } = req.body;

    const couponId = uuidv4();

    await db.query(
      `INSERT INTO coupons
       (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, usage_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        couponId,
        code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minOrderAmount || 0,
        maxDiscountAmount || null,
        expiryDate || null,
        usageLimit || null
      ]
    );

    res.json({ success: true, couponId });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, error: 'Coupon code already exists' });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

// Update coupon (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isActive
    } = req.body;

    await db.query(
      `UPDATE coupons SET
       code = ?, description = ?, discount_type = ?, discount_value = ?,
       min_order_amount = ?, max_discount_amount = ?, expiry_date = ?,
       usage_limit = ?, is_active = ?
       WHERE id = ?`,
      [
        code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minOrderAmount || 0,
        maxDiscountAmount || null,
        expiryDate || null,
        usageLimit || null,
        isActive ? 1 : 0,
        id
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete coupon (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM coupons WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;