"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const uuid_1 = require("uuid");
const database_js_1 = __importDefault(require("../db/database.js"));
const ReceiptService_js_1 = require("./ReceiptService.js");
class OrderService {
    async createOrder(items, notes, paymentMethod, createdBy, createdByName, discountPercent) {
        const connection = await database_js_1.default.getConnection();
        try {
            await connection.beginTransaction();
            const orderId = (0, uuid_1.v4)();
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            // Sanitize discount percent from caller and clamp 0-100
            const discountPct = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
            const discountAmount = parseFloat((subtotal * (discountPct / 100)).toFixed(2));
            const discountedSubtotal = parseFloat((subtotal - discountAmount).toFixed(2));
            // Calculate taxes on discounted subtotal
            const taxes = await ReceiptService_js_1.ReceiptService.calculateTaxes(discountedSubtotal);
            const total = parseFloat((discountedSubtotal + taxes.total).toFixed(2));
            // Debug logging
            console.log("Creating order:", {
                orderId,
                subtotal,
                discountPct,
                discountAmount,
                discountedSubtotal,
                taxes,
                total,
                itemCount: items.length,
                createdBy,
                createdByName,
            });
            console.log("Items:", JSON.stringify(items, null, 2));
            // Check if created_by columns exist (for backward compatibility)
            // Check for optional columns (created_by, discount_percent, discount_amount)
            const [columns] = await connection.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME IN ('created_by','discount_percent','discount_amount')`);
            const existingCols = columns.map((c) => c.COLUMN_NAME);
            const hasCreatedByColumn = existingCols.includes("created_by");
            const hasDiscountPercent = existingCols.includes("discount_percent");
            const hasDiscountAmount = existingCols.includes("discount_amount");
            // Build insert dynamically depending on which optional columns exist
            const insertCols = ["id", "total", "status", "notes", "payment_method"];
            const insertVals = [orderId, total, "pending", notes || null, paymentMethod || null];
            if (hasCreatedByColumn) {
                insertCols.push("created_by", "created_by_name");
                insertVals.push(createdBy || null, createdByName || null);
            }
            if (hasDiscountPercent) {
                insertCols.push("discount_percent");
                insertVals.push(discountPct);
            }
            if (hasDiscountAmount) {
                insertCols.push("discount_amount");
                insertVals.push(discountAmount);
            }
            const placeholders = insertCols.map(() => "?").join(", ");
            const insertSql = `INSERT INTO orders (${insertCols.join(", ")}) VALUES (${placeholders})`;
            await connection.query(insertSql, insertVals);
            for (const item of items) {
                const itemId = item.id || (0, uuid_1.v4)();
                const itemType = item.type || "custom_pizza";
                console.log("Inserting order item:", {
                    id: itemId,
                    orderId,
                    type: itemType,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                });
                await connection.query("INSERT INTO order_items (id, order_id, type, name, price, quantity, custom_pizza, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                    itemId,
                    orderId,
                    itemType,
                    item.name,
                    item.price,
                    item.quantity,
                    item.customPizza ? JSON.stringify(item.customPizza) : null,
                    item.notes || null,
                ]);
            }
            await connection.commit();
            // Fetch created order and ensure discount fields are present in returned object.
            const createdOrder = (await this.getOrder(orderId));
            // If DB did not persist discount columns at all, still attach computed discount values
            if (!hasDiscountPercent && !hasDiscountAmount) {
                // Attach computed discount fields for API clients
                createdOrder.discountPercent = discountPct > 0 ? discountPct : undefined;
                createdOrder.discountAmount = discountAmount > 0 ? discountAmount : undefined;
            }
            return createdOrder;
        }
        catch (error) {
            await connection.rollback();
            console.error("Order creation error:", error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async getOrder(orderId) {
        const [orders] = await database_js_1.default.query("SELECT * FROM orders WHERE id = ?", [
            orderId,
        ]);
        const order = orders[0];
        if (!order)
            return null;
        const [items] = await database_js_1.default.query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
        return {
            id: order.id,
            items: items.map((item) => ({
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
            discountPercent: order.discount_percent !== undefined && order.discount_percent !== null ? parseFloat(order.discount_percent) : undefined,
            discountAmount: order.discount_amount !== undefined && order.discount_amount !== null ? parseFloat(order.discount_amount) : undefined,
            status: order.status,
            paymentMethod: order.payment_method || undefined,
            notes: order.notes || undefined,
            createdBy: order.created_by || undefined,
            createdByName: order.created_by_name || undefined,
            createdAt: order.created_at,
            updatedAt: order.updated_at || undefined,
        };
    }
    async getAllOrders() {
        const [orders] = await database_js_1.default.query("SELECT * FROM orders WHERE is_deleted = 0 ORDER BY created_at DESC");
        const orderPromises = orders.map((order) => this.getOrder(order.id));
        const allOrders = await Promise.all(orderPromises);
        return allOrders.filter(Boolean);
    }
    async getPendingOrders() {
        const [orders] = await database_js_1.default.query("SELECT * FROM orders WHERE status IN ('pending', 'preparing') AND is_deleted = 0 ORDER BY created_at ASC");
        const orderPromises = orders.map((order) => this.getOrder(order.id));
        const allOrders = await Promise.all(orderPromises);
        return allOrders.filter(Boolean);
    }
    async updateOrderStatus(orderId, status) {
        await database_js_1.default.query("UPDATE orders SET status = ? WHERE id = ?", [
            status,
            orderId,
        ]);
        return this.getOrder(orderId);
    }
    async markAsPaid(orderId, paymentMethod) {
        await database_js_1.default.query("UPDATE orders SET payment_method = ?, status = 'completed' WHERE id = ?", [paymentMethod, orderId]);
        return this.getOrder(orderId);
    }
    async deleteOrder(orderId) {
        const [result] = await database_js_1.default.query("DELETE FROM orders WHERE id = ?", [
            orderId,
        ]);
        return result.affectedRows > 0;
    }
}
exports.OrderService = OrderService;
