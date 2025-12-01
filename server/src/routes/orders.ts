import express from 'express';
import { OrderService } from '../services/OrderService.js';
import { ReceiptService } from '../services/ReceiptService.js';
import { PrinterService } from '../services/PrinterService.js';
import db from '../db/database.js';

const router = express.Router();
const orderService = new OrderService();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, notes, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Items array is required and must not be empty' 
      });
    }

    const order = await orderService.createOrder(items, notes, paymentMethod);
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending orders (for kitchen display)
router.get('/pending', async (req, res) => {
  try {
    const orders = await orderService.getPendingOrders();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific order
router.get('/:id', async (req, res) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Auto-print receipt when order is completed or ready
    if (status === 'completed' || status === 'ready') {
      try {
        // Fetch order items for receipt
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        const orderNumber = parseInt(new Date(order.createdAt).getTime().toString().slice(-6));
        
        const mappedItems = Array.isArray(items) ? items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          customPizza: item.custom_pizza
        })) : [];
        
        const totals = await ReceiptService.calculateTotals(mappedItems);
        
        const receiptData = {
          orderId: order.id,
          orderNumber,
          items: mappedItems,
          subtotal: totals.subtotal,
          tax: totals.tax,
          gst: totals.gst,
          pst: totals.pst,
          total: order.total,
          paymentMethod: order.paymentMethod || 'cash',
          date: new Date(order.createdAt),
          notes: order.notes
        };
        
        // Generate thermal receipt text
        const receiptText = await ReceiptService.generateThermalReceipt(receiptData);
        
        // Auto-print in background (non-blocking)
        PrinterService.autoPrintOrderReceipt(receiptText).catch(err => {
          console.error('Background printing error:', err);
        });
      } catch (printError) {
        console.error('Failed to prepare receipt for printing:', printError);
        // Don't fail the status update if printing fails
      }
    }
    
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Mark order as paid
router.post('/:id/pay', async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    
    if (!paymentMethod) {
      return res.status(400).json({ success: false, error: 'Payment method is required' });
    }

    const order = await orderService.markAsPaid(req.params.id, paymentMethod);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await orderService.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get receipt as PDF
router.get('/:id/receipt/pdf', async (req, res) => {
  try {
    // Fetch order details
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order: any = orders[0];

    // Fetch order items
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    // Generate order number (using timestamp-based number)
    const orderNumber = parseInt(order.created_at.getTime().toString().slice(-6));

    const mappedItems = Array.isArray(items) ? items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      customPizza: item.custom_pizza
    })) : [];

    const totals = await ReceiptService.calculateTotals(mappedItems);

    const receiptData = {
      orderId: order.id,
      orderNumber,
      items: mappedItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      gst: totals.gst,
      pst: totals.pst,
      total: parseFloat(order.total),
      paymentMethod: order.payment_method || 'cash',
      date: order.created_at,
      customerName: req.query.customerName as string,
      customerPhone: req.query.customerPhone as string,
      customerEmail: req.query.customerEmail as string,
      notes: order.notes
    };

    await ReceiptService.generatePDFReceipt(receiptData, res);
  } catch (error: any) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate receipt' });
  }
});

// Get receipt as plain text
router.get('/:id/receipt/text', async (req, res) => {
  try {
    // Fetch order details
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order: any = orders[0];

    // Fetch order items
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    const orderNumber = parseInt(order.created_at.getTime().toString().slice(-6));

    const mappedItems = Array.isArray(items) ? items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      customPizza: item.custom_pizza
    })) : [];

    const totals = await ReceiptService.calculateTotals(mappedItems);

    const receiptData = {
      orderId: order.id,
      orderNumber,
      items: mappedItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      gst: totals.gst,
      pst: totals.pst,
      total: parseFloat(order.total),
      paymentMethod: order.payment_method || 'cash',
      date: order.created_at,
      customerName: req.query.customerName as string,
      customerPhone: req.query.customerPhone as string,
      customerEmail: req.query.customerEmail as string,
      notes: order.notes
    };

    const receipt = await ReceiptService.generateTextReceipt(receiptData);

    res.setHeader('Content-Type', 'text/plain');
    res.send(receipt);
  } catch (error: any) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate receipt' });
  }
});

// Get receipt as thermal printer format (ESC/POS)
router.get('/:id/receipt/thermal', async (req, res) => {
  try {
    // Fetch order details
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order: any = orders[0];

    // Fetch order items
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    const orderNumber = parseInt(order.created_at.getTime().toString().slice(-6));

    const mappedItems = Array.isArray(items) ? items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      customPizza: item.custom_pizza
    })) : [];

    const totals = await ReceiptService.calculateTotals(mappedItems);

    const receiptData = {
      orderId: order.id,
      orderNumber,
      items: mappedItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      gst: totals.gst,
      pst: totals.pst,
      total: parseFloat(order.total),
      paymentMethod: order.payment_method || 'cash',
      date: order.created_at,
      customerName: req.query.customerName as string,
      customerPhone: req.query.customerPhone as string,
      notes: order.notes
    };

    const receipt = await ReceiptService.generateThermalReceipt(receiptData);

    res.setHeader('Content-Type', 'text/plain');
    res.send(receipt);
  } catch (error: any) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate receipt' });
  }
});

export default router;
