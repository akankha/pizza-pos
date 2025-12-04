/**
 * QZ Tray Print Service
 * Handles thermal printer communication via QZ Tray for web browsers
 */

import qz from "qz-tray";

interface PrintData {
  orderId: string;
  orderNumber: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customPizza?: any;
  }>;
  subtotal: number;
  gst: number;
  pst: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdByName?: string;
  notes?: string;
  restaurantInfo?: {
    name: string;
    address: string;
    phone: string;
  };
}

class QZPrintService {
  private isConnected: boolean = false;
  private printerName: string = "";

  /**
   * Connect to QZ Tray
   */
  async connect(): Promise<boolean> {
    try {
      if (!qz.websocket.isActive()) {
        console.log("🔌 Connecting to QZ Tray...");
        await qz.websocket.connect();
        console.log("✅ Connected to QZ Tray");
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to QZ Tray:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Find thermal printer
   */
  async findPrinter(): Promise<string | null> {
    try {
      const printers = await qz.printers.find();
      console.log("🖨️  Available printers:", printers);

      // Look for thermal printer (MUNBYN, POS, thermal, receipt)
      const thermalPrinter = printers.find(
        (p: string) =>
          p.toLowerCase().includes("munbyn") ||
          p.toLowerCase().includes("pos") ||
          p.toLowerCase().includes("thermal") ||
          p.toLowerCase().includes("receipt") ||
          p.toLowerCase().includes("itpp")
      );

      if (thermalPrinter) {
        this.printerName = thermalPrinter;
        console.log("✅ Found thermal printer:", thermalPrinter);
        return thermalPrinter;
      }

      // Fallback to default printer if no thermal printer found
      const defaultPrinter = await qz.printers.getDefault();
      this.printerName = defaultPrinter;
      console.log("⚠️  Using default printer:", defaultPrinter);
      return defaultPrinter;
    } catch (error) {
      console.error("❌ Failed to find printer:", error);
      return null;
    }
  }

  /**
   * Format receipt as ESC/POS commands
   */
  formatReceipt(data: PrintData): string[] {
    const {
      orderId,
      orderNumber,
      items,
      subtotal,
      gst,
      pst,
      tax,
      total,
      paymentMethod,
      createdByName,
      notes,
      restaurantInfo,
    } = data;

    const commands: string[] = [];

    // Initialize printer
    commands.push("\x1B\x40"); // Initialize
    commands.push("\x1B\x61\x01"); // Center align

    // Header
    commands.push("\n");
    commands.push("========================================\n");
    commands.push(`       ${restaurantInfo?.name || "PIZZA SHOP"}\n`);
    commands.push("========================================\n");
    if (restaurantInfo?.address) commands.push(`${restaurantInfo.address}\n`);
    if (restaurantInfo?.phone)
      commands.push(`Phone: ${restaurantInfo.phone}\n`);
    commands.push("========================================\n\n");

    // Order info
    commands.push(
      `Order #${orderNumber || orderId.slice(0, 8).toUpperCase()}\n`
    );
    commands.push(`Date: ${new Date().toLocaleString()}\n`);
    if (createdByName) commands.push(`Served by: ${createdByName}\n`);
    commands.push("\n========================================\n");
    commands.push("ITEMS\n");
    commands.push("========================================\n");

    // Left align for items
    commands.push("\x1B\x61\x00");

    // Items
    items.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      commands.push(`${item.quantity}x ${item.name}\n`);
      commands.push(`                            $${itemTotal}\n`);

      if (item.customPizza) {
        commands.push(`  Size: ${item.customPizza.size}\n`);
        commands.push(`  Crust: ${item.customPizza.crust}\n`);
        if (item.customPizza.toppings?.length > 0) {
          commands.push(
            `  Toppings: ${item.customPizza.toppings.join(", ")}\n`
          );
        }
      }
      commands.push("\n");
    });

    // Right align for totals
    commands.push("\x1B\x61\x02");
    commands.push("========================================\n");
    commands.push(`Subtotal:                   $${subtotal.toFixed(2)}\n`);
    if (gst) commands.push(`GST (5%):                    $${gst.toFixed(2)}\n`);
    if (pst) commands.push(`PST (7%):                    $${pst.toFixed(2)}\n`);
    if (!gst && !pst && tax)
      commands.push(`Tax:                        $${tax.toFixed(2)}\n`);
    commands.push("\n");
    commands.push(`TOTAL:                      $${total.toFixed(2)}\n`);
    commands.push(`Payment: ${paymentMethod.toUpperCase()}\n`);

    if (notes) {
      commands.push("\n========================================\n");
      commands.push(`Note: ${notes}\n`);
    }

    // Footer - center align
    commands.push("\x1B\x61\x01");
    commands.push("\n========================================\n");
    commands.push("      Thank you for your order!\n");
    commands.push("       Visit us again soon!\n");
    commands.push("========================================\n\n\n");

    // Cut paper
    commands.push("\x1D\x56\x00"); // Full cut

    return commands;
  }

  /**
   * Print receipt
   */
  async print(data: PrintData): Promise<{ success: boolean; error?: string }> {
    try {
      // Connect to QZ Tray
      const connected = await this.connect();
      if (!connected) {
        throw new Error("QZ Tray not connected");
      }

      // Find printer
      const printer = await this.findPrinter();
      if (!printer) {
        throw new Error("No printer found");
      }

      console.log("🖨️  Formatting receipt...");
      const commands = this.formatReceipt(data);

      console.log("🖨️  Sending to printer:", printer);

      const config = qz.configs.create(printer, {
        encoding: "UTF-8",
        endOfDoc: "\x00",
      });

      await qz.print(config, commands);

      console.log("✅ Receipt printed successfully");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Print error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect from QZ Tray
   */
  async disconnect(): Promise<void> {
    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
      this.isConnected = false;
      console.log("🔌 Disconnected from QZ Tray");
    }
  }
}

export const qzPrintService = new QZPrintService();
