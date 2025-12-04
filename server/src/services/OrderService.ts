import { v4 as uuidv4 } from "uuid";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "../../../shared/types/index.js";
import db from "../db/database.js";

export class OrderService {
  async createOrder(
    items: OrderItem[],
    notes?: string,
    paymentMethod?: PaymentMethod,
    createdBy?: string,
    createdByName?: string
  ): Promise<Order> {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const orderId = uuidv4();
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Debug logging
      console.log("Creating order:", {
        orderId,
        total,
        itemCount: items.length,
        createdBy,
        createdByName,
      });
      console.log("Items:", JSON.stringify(items, null, 2));

      // Check if created_by columns exist (for backward compatibility)
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'created_by'
      `);

      const hasCreatedByColumn = (columns as any[]).length > 0;

      if (hasCreatedByColumn) {
        await connection.query(
          "INSERT INTO orders (id, total, status, notes, payment_method, created_by, created_by_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            orderId,
            total,
            "pending",
            notes || null,
            paymentMethod || null,
            createdBy || null,
            createdByName || null,
          ]
        );
      } else {
        // Fallback for databases without created_by columns
        await connection.query(
          "INSERT INTO orders (id, total, status, notes, payment_method) VALUES (?, ?, ?, ?, ?)",
          [orderId, total, "pending", notes || null, paymentMethod || null]
        );
      }

      for (const item of items) {
        const itemId = item.id || uuidv4();
        const itemType = item.type || "custom_pizza";

        console.log("Inserting order item:", {
          id: itemId,
          orderId,
          type: itemType,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });

        await connection.query(
          "INSERT INTO order_items (id, order_id, type, name, price, quantity, custom_pizza, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            itemId,
            orderId,
            itemType,
            item.name,
            item.price,
            item.quantity,
            item.customPizza ? JSON.stringify(item.customPizza) : null,
            item.notes || null,
          ]
        );
      }

      await connection.commit();
      return (await this.getOrder(orderId))!;
    } catch (error) {
      await connection.rollback();
      console.error("Order creation error:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);
    const order = (orders as any[])[0];

    if (!order) return null;

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId]
    );

    return {
      id: order.id,
      items: (items as any[]).map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        customPizza: item.custom_pizza
          ? JSON.parse(item.custom_pizza)
          : undefined,
        notes: item.notes || undefined,
      })),
      total: parseFloat(order.total),
      status: order.status,
      paymentMethod: order.payment_method || undefined,
      notes: order.notes || undefined,
      createdBy: order.created_by || undefined,
      createdByName: order.created_by_name || undefined,
      createdAt: order.created_at,
      updatedAt: order.updated_at || undefined,
    };
  }

  async getAllOrders(): Promise<Order[]> {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE is_deleted = 0 ORDER BY created_at DESC"
    );
    const orderPromises = (orders as any[]).map((order) =>
      this.getOrder(order.id)
    );
    const allOrders = await Promise.all(orderPromises);
    return allOrders.filter(Boolean) as Order[];
  }

  async getPendingOrders(): Promise<Order[]> {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE status IN ('pending', 'preparing') AND is_deleted = 0 ORDER BY created_at ASC"
    );
    const orderPromises = (orders as any[]).map((order) =>
      this.getOrder(order.id)
    );
    const allOrders = await Promise.all(orderPromises);
    return allOrders.filter(Boolean) as Order[];
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order | null> {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      orderId,
    ]);
    return this.getOrder(orderId);
  }

  async markAsPaid(
    orderId: string,
    paymentMethod: PaymentMethod
  ): Promise<Order | null> {
    await db.query(
      "UPDATE orders SET payment_method = ?, status = 'completed' WHERE id = ?",
      [paymentMethod, orderId]
    );
    return this.getOrder(orderId);
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    const [result] = await db.query("DELETE FROM orders WHERE id = ?", [
      orderId,
    ]);
    return (result as any).affectedRows > 0;
  }
}
