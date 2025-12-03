/**
 * Local Print Service for Electron App
 * Handles direct USB thermal printer communication from the desktop app
 */

const escpos = require("escpos");
const USB = require("escpos-usb");

class LocalPrintService {
  constructor() {
    this.device = null;
    this.printer = null;
    this.isConnected = false;
  }

  /**
   * Connect to MUNBYN thermal printer
   */
  async connect() {
    try {
      const devices = USB.findPrinter();

      if (!devices || devices.length === 0) {
        console.log("No USB printers detected");
        return false;
      }

      // Find MUNBYN or compatible printer
      this.device =
        devices.find((d) => {
          const name = (d.deviceDescriptor?.iProduct || "").toLowerCase();
          return (
            name.includes("munbyn") ||
            name.includes("itpp") ||
            name.includes("pos")
          );
        }) || devices[0];

      if (!this.device) {
        console.log("No thermal printer found");
        return false;
      }

      this.printer = new escpos.Printer(this.device);
      this.isConnected = true;
      console.log("✅ MUNBYN printer connected");
      return true;
    } catch (error) {
      console.error("Failed to connect to printer:", error);
      return false;
    }
  }

  /**
   * Print receipt text
   */
  async print(receiptText, copies = 1) {
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error("Printer not connected");
      }
    }

    return new Promise((resolve, reject) => {
      this.device.open((error) => {
        if (error) {
          reject(new Error(`Failed to open printer: ${error.message}`));
          return;
        }

        try {
          for (let i = 0; i < copies; i++) {
            this.printer
              .font("a")
              .align("ct")
              .style("normal")
              .size(1, 1)
              .text(receiptText)
              .cut()
              .close();
          }

          console.log(`✅ Printed ${copies} receipt(s)`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /**
   * Format order data as receipt text
   */
  formatReceipt(orderData) {
    const {
      orderId,
      orderNumber,
      items,
      subtotal,
      tax,
      gst,
      pst,
      total,
      paymentMethod,
      createdByName,
      notes,
      restaurantInfo,
    } = orderData;

    let receipt = "\n";
    receipt += "========================================\n";
    receipt += `       ${restaurantInfo.name || "PIZZA SHOP"}\n`;
    receipt += "========================================\n";
    if (restaurantInfo.address) receipt += `${restaurantInfo.address}\n`;
    if (restaurantInfo.phone) receipt += `Phone: ${restaurantInfo.phone}\n`;
    receipt += "========================================\n\n";

    receipt += `Order #${orderNumber || orderId.slice(0, 8).toUpperCase()}\n`;
    receipt += `Date: ${new Date().toLocaleString()}\n`;
    if (createdByName) receipt += `Served by: ${createdByName}\n`;
    receipt += "\n========================================\n";
    receipt += "ITEMS\n";
    receipt += "========================================\n";

    items.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      receipt += `${item.quantity}x ${item.name}\n`;
      receipt += `                            $${itemTotal}\n`;

      if (item.customPizza) {
        receipt += `  Size: ${item.customPizza.size}\n`;
        receipt += `  Crust: ${item.customPizza.crust}\n`;
        if (item.customPizza.toppings?.length > 0) {
          receipt += `  Toppings: ${item.customPizza.toppings.join(", ")}\n`;
        }
      }
      receipt += "\n";
    });

    receipt += "========================================\n";
    receipt += `Subtotal:                   $${subtotal.toFixed(2)}\n`;
    if (gst) receipt += `GST (5%):                    $${gst.toFixed(2)}\n`;
    if (pst) receipt += `PST (7%):                    $${pst.toFixed(2)}\n`;
    if (!gst && !pst && tax)
      receipt += `Tax:                        $${tax.toFixed(2)}\n`;
    receipt += "\n";
    receipt += `TOTAL:                      $${total.toFixed(2)}\n`;
    receipt += `Payment: ${paymentMethod.toUpperCase()}\n`;

    if (notes) {
      receipt += "\n========================================\n";
      receipt += `Note: ${notes}\n`;
    }

    receipt += "\n========================================\n";
    receipt += "      Thank you for your order!\n";
    receipt += "       Visit us again soon!\n";
    receipt += "========================================\n\n\n";

    return receipt;
  }
}

module.exports = new LocalPrintService();
