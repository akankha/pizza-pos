const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'pizza_pos',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [todayOrders] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()'
    );
    
    const [pendingOrders] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE status IN ("pending", "preparing")'
    );

    res.json({
      success: true,
      data: {
        todayOrders: todayOrders[0].count,
        todayRevenue: todayOrders[0].revenue,
        pendingOrders: pendingOrders[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// Get reports
router.get('/reports/:period', async (req, res) => {
  try {
    const { period } = req.params;
    let dateFilter = '';

    switch (period) {
      case 'today':
        dateFilter = 'DATE(created_at) = CURDATE()';
        break;
      case 'week':
        dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case 'month':
        dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case 'year':
        dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)';
        break;
      default:
        dateFilter = 'DATE(created_at) = CURDATE()';
    }

    const [orders] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue 
       FROM orders WHERE ${dateFilter} AND status = 'completed'
       GROUP BY DATE(created_at) ORDER BY date DESC`
    );

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

module.exports = router;
