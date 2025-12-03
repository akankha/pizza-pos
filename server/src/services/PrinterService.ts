import escpos from "escpos";
// @ts-ignore - escpos-usb doesn't have TypeScript definitions
import USB from "escpos-usb";
import pool from "../db/database";

// MUNBYN & Xprinter USB IDs (common ESC/POS printer IDs)
// Note: You may need to adjust these based on your specific printer
const XPRINTER_VENDOR_IDS = [0x0519, 0x04b8, 0x0fe6, 0x1fc9]; // Common thermal printer vendor IDs including MUNBYN
const SUPPORTED_PRINTERS = [
  "Xprinter",
  "XP-N160II",
  "POS-80",
  "MUNBYN",
  "Munbyn",
  "ITPP",
  "ITP",
];

interface PrinterSettings {
  printer_enabled: boolean;
  auto_print: boolean;
  print_copies: number;
}

export class PrinterService {
  private static device: any = null;
  private static printer: any = null;
  private static isConnected: boolean = false;

  /**
   * Get printer settings from database
   */
  private static async getSettings(): Promise<PrinterSettings> {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM restaurant_settings LIMIT 1"
      );
      const settings = (rows as any[])[0];

      return {
        printer_enabled: settings?.printer_enabled !== false, // Default to true
        auto_print: settings?.auto_print !== false, // Default to true
        print_copies: settings?.print_copies || 1,
      };
    } catch (error) {
      console.error("Failed to get printer settings:", error);
      return {
        printer_enabled: true,
        auto_print: true,
        print_copies: 1,
      };
    }
  }

  /**
   * Detect and connect to thermal printer (MUNBYN, Xprinter, or compatible ESC/POS)
   */
  static async connect(): Promise<boolean> {
    try {
      // Try to find the printer device
      const devices = USB.findPrinter();

      if (!devices || devices.length === 0) {
        console.log("No USB printers detected");
        return false;
      }

      // Find thermal printer (MUNBYN, Xprinter, or compatible ESC/POS printer)
      console.log(`Found ${devices.length} USB printer(s)`);

      this.device =
        devices.find((d: any) => {
          const productName = (
            d.deviceDescriptor?.iProduct || ""
          ).toLowerCase();
          const vendorId = d.deviceDescriptor?.idVendor;

          console.log(
            `Checking printer: ${productName} (Vendor ID: 0x${vendorId?.toString(
              16
            )})`
          );

          return (
            XPRINTER_VENDOR_IDS.includes(vendorId) ||
            SUPPORTED_PRINTERS.some((name) =>
              productName.includes(name.toLowerCase())
            )
          );
        }) || devices[0]; // Fallback to first printer if no match

      if (!this.device) {
        console.log("No compatible thermal printer found");
        return false;
      }

      const printerName = this.device.deviceDescriptor?.iProduct || "Unknown";
      console.log(`Using printer: ${printerName}`);

      // Initialize printer
      this.printer = new escpos.Printer(this.device);
      this.isConnected = true;

      console.log("✅ Thermal printer connected successfully");
      return true;
    } catch (error) {
      console.error("Failed to connect to printer:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from printer
   */
  static async disconnect(): Promise<void> {
    try {
      if (this.device) {
        this.device.close();
        this.device = null;
        this.printer = null;
        this.isConnected = false;
        console.log("Printer disconnected");
      }
    } catch (error) {
      console.error("Error disconnecting printer:", error);
    }
  }

  /**
   * Check if printer is connected and ready
   */
  static async checkStatus(): Promise<{
    connected: boolean;
    ready: boolean;
    error?: string;
  }> {
    try {
      const settings = await this.getSettings();

      if (!settings.printer_enabled) {
        return {
          connected: false,
          ready: false,
          error: "Printer disabled in settings",
        };
      }

      if (!this.isConnected) {
        const connected = await this.connect();
        return {
          connected,
          ready: connected,
          error: connected ? undefined : "Failed to connect to printer",
        };
      }

      return {
        connected: true,
        ready: true,
      };
    } catch (error: any) {
      return {
        connected: false,
        ready: false,
        error: error.message,
      };
    }
  }

  /**
   * Print receipt data
   */
  static async printReceipt(
    receiptText: string,
    copies: number = 1
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSettings();

      // Check if printer is enabled
      if (!settings.printer_enabled) {
        console.log("Printer is disabled in settings");
        return {
          success: false,
          error: "Printer disabled in settings",
        };
      }

      // Ensure printer is connected
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          return {
            success: false,
            error: "Failed to connect to printer",
          };
        }
      }

      // Print the specified number of copies
      const numberOfCopies = copies || settings.print_copies || 1;

      return new Promise((resolve) => {
        try {
          this.device.open((error: any) => {
            if (error) {
              console.error("Failed to open printer device:", error);
              resolve({
                success: false,
                error: `Failed to open printer: ${error.message}`,
              });
              return;
            }

            try {
              // Print multiple copies
              for (let i = 0; i < numberOfCopies; i++) {
                this.printer
                  .font("a")
                  .align("ct")
                  .style("normal")
                  .size(1, 1)
                  .text(receiptText)
                  .cut()
                  .close();
              }

              console.log(
                `✅ Receipt printed successfully (${numberOfCopies} ${
                  numberOfCopies === 1 ? "copy" : "copies"
                })`
              );
              resolve({ success: true });
            } catch (printError: any) {
              console.error("Error during printing:", printError);
              resolve({
                success: false,
                error: `Printing failed: ${printError.message}`,
              });
            }
          });
        } catch (error: any) {
          console.error("Unexpected printing error:", error);
          resolve({
            success: false,
            error: error.message,
          });
        }
      });
    } catch (error: any) {
      console.error("Print receipt error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Print test receipt
   */
  static async printTestReceipt(): Promise<{
    success: boolean;
    error?: string;
  }> {
    const testReceipt = `
========================================
           PRINTER TEST
========================================

Xprinter XP-N160II
Thermal Receipt Printer Test

Date: ${new Date().toLocaleString()}

========================================
        TEST SUCCESSFUL
========================================

This is a test receipt to verify that
your thermal printer is working correctly.

If you can read this, your printer is
configured properly!

========================================
      Thank you for testing!
========================================

`;

    return await this.printReceipt(testReceipt, 1);
  }

  /**
   * Auto-print receipt for completed orders
   */
  static async autoPrintOrderReceipt(receiptText: string): Promise<void> {
    try {
      console.log("🖨️ Auto-print triggered for order receipt");
      const settings = await this.getSettings();

      console.log("Printer settings:", {
        printer_enabled: settings.printer_enabled,
        auto_print: settings.auto_print,
        print_copies: settings.print_copies,
      });

      if (!settings.auto_print || !settings.printer_enabled) {
        console.log("⚠️ Auto-print is disabled in settings");
        return;
      }

      console.log(
        `Attempting to print ${settings.print_copies} copy/copies...`
      );
      const result = await this.printReceipt(
        receiptText,
        settings.print_copies
      );

      if (!result.success) {
        console.error("❌ Auto-print failed:", result.error);
        // Don't throw error - order should still complete even if printing fails
      } else {
        console.log("✅ Auto-print completed successfully");
      }
    } catch (error) {
      console.error("❌ Auto-print error:", error);
      // Don't throw error - order should still complete even if printing fails
    }
  }

  /**
   * Get list of available USB printers
   */
  static getAvailablePrinters(): any[] {
    try {
      const devices = USB.findPrinter();
      return devices || [];
    } catch (error) {
      console.error("Error finding printers:", error);
      return [];
    }
  }
}
