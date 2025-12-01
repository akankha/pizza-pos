import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import type { Order, OrderItem, OrderStatus, PaymentMethod } from '../../../shared/types/index.js';

export class OrderService {
  async createOrder(items: OrderItem[], notes?: string, paymentMethod?: PaymentMethod): Promise<Order> {
    const orderId = uuidv4();
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    await db.query(
      'INSERT INTO orders (id, total, status, notes, payment_method) VALUES (?, ?, ?, ?, ?)',
      [orderId, total, 'pending', notes || null, paymentMethod || null]
    );

    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (id, order_id, type, name, price, quantity, custom_pizza, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          item.id,
          orderId,
          item.type,
          item.name,
          item.price,
          item.quantity,
          item.customPizza ? JSON.stringify(item.customPizza) : null,
          item.notes || null
        ]
      );
    }

    return (await this.getOrder(orderId))!;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = (orders as any[])[0];

    if (!order) return null;

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    return {
      id: order.id,
      items: (items as any[]).map(item => ({
        id: item.id,
        type: item.type,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        customPizza: item.custom_pizza ? JSON.parse(item.custom_pizza) : undefined,
        notes: item.notes || undefined,
      })),
      total: parseFloat(order.total),
      status: order.status,
      paymentMethod: order.payment_method || undefined,
      notes: order.notes || undefined,
      createdAt: order.created_at,
      updatedAt: order.updated_at || undefined,
    };
  }

  async getAllOrders(): Promise<Order[]> {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orderPromises = (orders as any[]).map(order => this.getOrder(order.id));
    const allOrders = await Promise.all(orderPromises);
    return allOrders.filter(Boolean) as Order[];
  }

  async getPendingOrders(): Promise<Order[]> {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE status IN ('pending', 'preparing') ORDER BY created_at ASC"
    );
    const orderPromises = (orders as any[]).map(order => this.getOrder(order.id));
    const allOrders = await Promise.all(orderPromises);
    return allOrders.filter(Boolean) as Order[];
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    return this.getOrder(orderId);
  }

  async markAsPaid(orderId: string, paymentMethod: PaymentMethod): Promise<Order | null> {
    await db.query(
      "UPDATE orders SET payment_method = ?, status = 'completed' WHERE id = ?",
      [paymentMethod, orderId]
    );
    return this.getOrder(orderId);
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [orderId]);
    return (result as any).affectedRows > 0;
  }
}
