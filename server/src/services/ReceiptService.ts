import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Response } from 'express';
import pool from '../db/database';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  customPizza?: any;
}

interface ReceiptData {
  orderId: string;
  orderNumber: number;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  gst?: number;
  pst?: number;
  total: number;
  paymentMethod: string;
  date: Date;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
}

interface RestaurantSettings {
  restaurant_name: string;
  restaurant_address: string;
  restaurant_city: string;
  restaurant_phone: string;
  gst_rate: number;
  pst_rate: number;
  tax_label_gst: string;
  tax_label_pst: string;
}

export class ReceiptService {
  /**
   * Get restaurant settings from database
   */
  private static async getSettings(): Promise<RestaurantSettings> {
    const [rows] = await pool.query('SELECT * FROM restaurant_settings LIMIT 1');
    const settings = (rows as any[])[0];
    
    if (!settings) {
      // Return defaults if no settings found
      return {
        restaurant_name: 'Pizza Paradise',
        restaurant_address: '123 Main Street',
        restaurant_city: 'Your City, ST 12345',
        restaurant_phone: '(555) 123-4567',
        gst_rate: 0.05,
        pst_rate: 0.07,
        tax_label_gst: 'GST',
        tax_label_pst: 'PST'
      };
    }
    
    return settings;
  }

  /**
   * Generate PDF receipt
   */
  static async generatePDFReceipt(data: ReceiptData, res: Response): Promise<void> {
    const settings = await this.getSettings();
    const doc = new PDFDocument({ size: [226.77, 841.89], margin: 20 }); // 80mm thermal printer width

    // Pipe to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${data.orderId}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text(settings.restaurant_name, { align: 'center' });
    doc.fontSize(9).font('Helvetica').text(settings.restaurant_address, { align: 'center' });
    doc.text(settings.restaurant_city, { align: 'center' });
    doc.text(settings.restaurant_phone, { align: 'center' });
    doc.moveDown();

    // Divider
    doc.fontSize(8).text('='.repeat(38), { align: 'center' });
    doc.moveDown();

    // Order Info
    doc.fontSize(10).font('Helvetica-Bold').text(`Order #${data.orderNumber}`, { align: 'center' });
    
    doc.text(new Date(data.date).toLocaleString(), { align: 'center' });
    doc.moveDown();

    // Customer Info (if available)
    if (data.customerName || data.customerPhone) {
      doc.fontSize(8).text('='.repeat(38), { align: 'center' });
      doc.moveDown(0.5);
      if (data.customerName) {
        doc.text(`Customer: ${data.customerName}`);
      }
      if (data.customerPhone) {
        doc.text(`Phone: ${data.customerPhone}`);
      }
      doc.moveDown();
    }

    // Order Notes (if available)
    if (data.notes) {
      doc.fontSize(8).font('Helvetica-Bold').text('Note:', { continued: false });
      doc.font('Helvetica').text(data.notes);
      doc.moveDown();
    }

    // Items Header
    doc.fontSize(8).text('='.repeat(38), { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('ITEMS', { continued: false });
    doc.moveDown(0.5);

    // Items
    doc.font('Helvetica');
    data.items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      
      // Item name and total
      doc.text(`${item.quantity}x ${item.name}`, { continued: true });
      doc.text(`$${itemTotal.toFixed(2)}`, { align: 'right' });

      // Custom pizza details
      if (item.customPizza) {
        const pizza = JSON.parse(item.customPizza);
        doc.fontSize(7).fillColor('#666666');
        doc.text(`   Size: ${pizza.size}`, { indent: 10 });
        doc.text(`   Crust: ${pizza.crust}`, { indent: 10 });
        if (pizza.toppings && pizza.toppings.length > 0) {
          doc.text(`   Toppings: ${pizza.toppings.join(', ')}`, { indent: 10 });
        }
        doc.fontSize(8).fillColor('#000000');
      }
      doc.moveDown(0.3);
    });

    // Totals
    doc.moveDown(0.5);
    doc.fontSize(8).text('='.repeat(38), { align: 'center' });
    doc.moveDown(0.5);

    doc.text('Subtotal:', { continued: true });
    doc.text(`$${data.subtotal.toFixed(2)}`, { align: 'right' });

    if (data.gst !== undefined && data.gst > 0) {
      doc.text(`${settings.tax_label_gst} (${(settings.gst_rate * 100).toFixed(1)}%):`, { continued: true });
      doc.text(`$${data.gst.toFixed(2)}`, { align: 'right' });
    }

    if (data.pst !== undefined && data.pst > 0) {
      doc.text(`${settings.tax_label_pst} (${(settings.pst_rate * 100).toFixed(1)}%):`, { continued: true });
      doc.text(`$${data.pst.toFixed(2)}`, { align: 'right' });
    }

    // Fallback for simple tax if GST/PST not provided
    if ((data.gst === undefined || data.gst === 0) && (data.pst === undefined || data.pst === 0) && data.tax > 0) {
      doc.text('Tax:', { continued: true });
      doc.text(`$${data.tax.toFixed(2)}`, { align: 'right' });
    }

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('TOTAL:', { continued: true });
    doc.text(`$${data.total.toFixed(2)}`, { align: 'right' });

    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica');
    doc.text(`Payment: ${data.paymentMethod.toUpperCase()}`);

    // QR Code for order tracking
    doc.moveDown();
    doc.fontSize(8).text('='.repeat(38), { align: 'center' });
    doc.moveDown(0.5);

    try {
      const qrData = await QRCode.toDataURL(`ORDER:${data.orderId}`);
      const qrImage = Buffer.from(qrData.split(',')[1], 'base64');
      doc.image(qrImage, doc.page.width / 2 - 40, doc.y, { width: 80, height: 80 });
      doc.moveDown(6);
      doc.fontSize(7).text('Scan to track your order', { align: 'center' });
    } catch (err) {
      console.error('QR code generation failed:', err);
    }

    // Footer
    doc.moveDown();
    doc.fontSize(8).text('='.repeat(38), { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica-Bold').text('Thank you for your order!', { align: 'center' });
    doc.fontSize(7).font('Helvetica').text('Visit us again soon!', { align: 'center' });

    doc.end();
  }

  /**
   * Generate thermal printer receipt (ESC/POS format)
   */
  static async generateThermalReceipt(data: ReceiptData): Promise<string> {
    const settings = await this.getSettings();
    const ESC = '\x1B';
    const INIT = ESC + '@';
    const CENTER = ESC + 'a' + '\x01';
    const LEFT = ESC + 'a' + '\x00';
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';
    const DOUBLE_HEIGHT = ESC + '!' + '\x10';
    const NORMAL = ESC + '!' + '\x00';
    const CUT = ESC + 'i';

    let receipt = INIT;

    // Header
    receipt += CENTER + DOUBLE_HEIGHT + BOLD_ON;
    receipt += settings.restaurant_name + '\n';
    receipt += NORMAL + BOLD_OFF;
    receipt += settings.restaurant_address + '\n';
    receipt += settings.restaurant_city + '\n';
    receipt += settings.restaurant_phone + '\n\n';

    // Divider
    receipt += '='.repeat(42) + '\n\n';

    // Order Info
    receipt += BOLD_ON + `Order #${data.orderNumber}\n` + BOLD_OFF;
    receipt += `Order ID: ${data.orderId}\n`;
    receipt += new Date(data.date).toLocaleString() + '\n\n';

    // Customer Info
    if (data.customerName || data.customerPhone) {
      receipt += '='.repeat(42) + '\n';
      if (data.customerName) receipt += `Customer: ${data.customerName}\n`;
      if (data.customerPhone) receipt += `Phone: ${data.customerPhone}\n`;
      receipt += '\n';
    }

    // Order Notes
    if (data.notes) {
      receipt += BOLD_ON + 'Note: ' + BOLD_OFF + data.notes + '\n\n';
    }

    // Items
    receipt += LEFT;
    receipt += '='.repeat(42) + '\n';
    receipt += BOLD_ON + 'ITEMS\n' + BOLD_OFF;
    receipt += '='.repeat(42) + '\n';

    data.items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      const name = `${item.quantity}x ${item.name}`;
      const price = `$${itemTotal.toFixed(2)}`;
      const padding = 42 - name.length - price.length;
      receipt += name + ' '.repeat(Math.max(1, padding)) + price + '\n';

      // Custom pizza details
      if (item.customPizza) {
        const pizza = JSON.parse(item.customPizza);
        receipt += `  Size: ${pizza.size}\n`;
        receipt += `  Crust: ${pizza.crust}\n`;
        if (pizza.toppings && pizza.toppings.length > 0) {
          receipt += `  Toppings: ${pizza.toppings.join(', ')}\n`;
        }
      }
    });

    // Totals
    receipt += '\n' + '='.repeat(42) + '\n';

    const formatLine = (label: string, value: string) => {
      const padding = 42 - label.length - value.length;
      return label + ' '.repeat(Math.max(1, padding)) + value + '\n';
    };

    receipt += formatLine('Subtotal:', `$${data.subtotal.toFixed(2)}`);
    
    if (data.gst !== undefined && data.gst > 0) {
      receipt += formatLine(`${settings.tax_label_gst} (${(settings.gst_rate * 100).toFixed(1)}%):`, `$${data.gst.toFixed(2)}`);
    }
    
    if (data.pst !== undefined && data.pst > 0) {
      receipt += formatLine(`${settings.tax_label_pst} (${(settings.pst_rate * 100).toFixed(1)}%):`, `$${data.pst.toFixed(2)}`);
    }

    if ((data.gst === undefined || data.gst === 0) && (data.pst === undefined || data.pst === 0) && data.tax > 0) {
      receipt += formatLine('Tax:', `$${data.tax.toFixed(2)}`);
    }

    receipt += '\n';
    receipt += BOLD_ON;
    receipt += formatLine('TOTAL:', `$${data.total.toFixed(2)}`);
    receipt += BOLD_OFF;
    receipt += '\n';
    receipt += formatLine('Payment:', data.paymentMethod.toUpperCase());

    // Footer
    receipt += '\n' + '='.repeat(42) + '\n\n';
    receipt += CENTER + BOLD_ON;
    receipt += 'Thank you for your order!\n';
    receipt += BOLD_OFF;
    receipt += 'Visit us again soon!\n\n';

    // Cut paper
    receipt += CUT;

    return receipt;
  }

  /**
   * Generate plain text receipt for email
   */
  static async generateTextReceipt(data: ReceiptData): Promise<string> {
    const settings = await this.getSettings();
    let receipt = '';

    // Header
    receipt += '='.repeat(48) + '\n';
    receipt += `  ${settings.restaurant_name}\n`;
    receipt += `  ${settings.restaurant_address}\n`;
    receipt += `  ${settings.restaurant_city}\n`;
    receipt += `  ${settings.restaurant_phone}\n`;
    receipt += '='.repeat(48) + '\n\n';

    // Order Info
    receipt += `Order #${data.orderNumber}\n`;
    receipt += `Order ID: ${data.orderId}\n`;
    receipt += `Date: ${new Date(data.date).toLocaleString()}\n\n`;

    // Customer Info
    if (data.customerName || data.customerPhone) {
      receipt += '-'.repeat(48) + '\n';
      if (data.customerName) receipt += `Customer: ${data.customerName}\n`;
      if (data.customerPhone) receipt += `Phone: ${data.customerPhone}\n`;
      if (data.customerEmail) receipt += `Email: ${data.customerEmail}\n`;
      receipt += '\n';
    }

    // Order Notes
    if (data.notes) {
      receipt += 'Note: ' + data.notes + '\n\n';
    }

    // Items
    receipt += '-'.repeat(48) + '\n';
    receipt += 'ITEMS\n';
    receipt += '-'.repeat(48) + '\n';

    data.items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      const name = `${item.quantity}x ${item.name}`;
      const price = `$${itemTotal.toFixed(2)}`;
      const padding = 48 - name.length - price.length;
      receipt += name + ' '.repeat(Math.max(1, padding)) + price + '\n';

      if (item.customPizza) {
        const pizza = JSON.parse(item.customPizza);
        receipt += `    Size: ${pizza.size}\n`;
        receipt += `    Crust: ${pizza.crust}\n`;
        if (pizza.toppings && pizza.toppings.length > 0) {
          receipt += `    Toppings: ${pizza.toppings.join(', ')}\n`;
        }
      }
    });

    // Totals
    receipt += '\n' + '-'.repeat(48) + '\n';

    const formatLine = (label: string, value: string) => {
      const padding = 48 - label.length - value.length;
      return label + ' '.repeat(Math.max(1, padding)) + value + '\n';
    };

    receipt += formatLine('Subtotal:', `$${data.subtotal.toFixed(2)}`);
    
    if (data.gst !== undefined && data.gst > 0) {
      receipt += formatLine(`${settings.tax_label_gst} (${(settings.gst_rate * 100).toFixed(1)}%):`, `$${data.gst.toFixed(2)}`);
    }
    
    if (data.pst !== undefined && data.pst > 0) {
      receipt += formatLine(`${settings.tax_label_pst} (${(settings.pst_rate * 100).toFixed(1)}%):`, `$${data.pst.toFixed(2)}`);
    }

    if ((data.gst === undefined || data.gst === 0) && (data.pst === undefined || data.pst === 0) && data.tax > 0) {
      receipt += formatLine('Tax:', `$${data.tax.toFixed(2)}`);
    }

    receipt += '\n';
    receipt += formatLine('TOTAL:', `$${data.total.toFixed(2)}`);
    receipt += '\n';
    receipt += formatLine('Payment Method:', data.paymentMethod.toUpperCase());

    // Footer
    receipt += '\n' + '='.repeat(48) + '\n';
    receipt += '         Thank you for your order!\n';
    receipt += '           Visit us again soon!\n';
    receipt += '='.repeat(48) + '\n';

    return receipt;
  }

  /**
   * Calculate taxes (GST + PST)
   */
  static async calculateTaxes(subtotal: number): Promise<{ gst: number; pst: number; total: number }> {
    const settings = await this.getSettings();
    const gst = subtotal * settings.gst_rate;
    const pst = subtotal * settings.pst_rate;
    const total = gst + pst;

    return { gst, pst, total };
  }

  /**
   * Calculate totals with taxes
   */
  static async calculateTotals(items: ReceiptItem[]): Promise<{ subtotal: number; gst: number; pst: number; tax: number; total: number }> {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const taxes = await this.calculateTaxes(subtotal);
    const total = subtotal + taxes.total;

    return { 
      subtotal, 
      gst: taxes.gst, 
      pst: taxes.pst, 
      tax: taxes.total, 
      total 
    };
  }
}
