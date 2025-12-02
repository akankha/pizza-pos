import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Order, OrderItem } from '@/shared/types';

export async function GET() {
  try {
    const orders = await query(`
      SELECT o.*, oi.id as item_id, oi.* 
      FROM orders o 
      LEFT JOIN order_items oi ON o.id = oi.order_id 
      ORDER BY o.created_at DESC
    `);

    // Group by order
    const ordersMap = new Map<number, Order>();
    
    for (const row of orders as any[]) {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          orderNumber: row.order_number,
          total: parseFloat(row.total),
          status: row.status,
          paymentMethod: row.payment_method,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          items: [],
        });
      }
      
      if (row.item_id) {
        const order = ordersMap.get(row.id)!;
        order.items.push({
          id: row.item_id,
          type: row.type,
          name: row.name,
          quantity: row.quantity,
          price: parseFloat(row.price),
          subtotal: parseFloat(row.subtotal),
          size: row.size,
          crust: row.crust,
          toppings: row.toppings ? JSON.parse(row.toppings) : undefined,
          customizations: row.customizations ? JSON.parse(row.customizations) : undefined,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(ordersMap.values()),
    });
  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items, paymentMethod } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    const total = items.reduce((sum: number, item: OrderItem) => sum + item.subtotal, 0);
    const orderNumber = `ORD-${Date.now()}`;

    const result = await query(
      `INSERT INTO orders (order_number, total, status, payment_method) 
       VALUES (?, ?, 'pending', ?)`,
      [orderNumber, total, paymentMethod]
    ) as any;

    const orderId = result.insertId;

    for (const item of items) {
      await query(
        `INSERT INTO order_items 
         (order_id, type, name, quantity, price, subtotal, size, crust, toppings, customizations) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.type,
          item.name,
          item.quantity,
          item.price,
          item.subtotal,
          item.size || null,
          item.crust || null,
          item.toppings ? JSON.stringify(item.toppings) : null,
          item.customizations ? JSON.stringify(item.customizations) : null,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: orderId, orderNumber },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
