#!/usr/bin/env node

/**
 * Xprinter XP-N160II Test Script
 *
 * This script helps you:
 * 1. Detect connected USB thermal printers
 * 2. Test connection to Xprinter XP-N160II
 * 3. Print a test receipt
 *
 * Usage:
 *   node scripts/test-printer.js
 */

import USB from "escpos-usb";
import escpos from "escpos";

console.log("🖨️  Xprinter XP-N160II Detection and Test\n");
console.log("==========================================\n");

// Step 1: Find all USB printers
console.log("Step 1: Scanning for USB printers...\n");

try {
  const devices = USB.findPrinter();

  if (!devices || devices.length === 0) {
    console.log("❌ No USB printers detected");
    console.log("\nTroubleshooting:");
    console.log("1. Make sure the printer is connected via USB");
    console.log("2. Check if the printer is powered on");
    console.log("3. Try a different USB port");
    console.log("4. On Linux, you may need to run with sudo");
    console.log(
      "5. Check USB permissions (add your user to dialout group on Linux)"
    );
    process.exit(1);
  }

  console.log(`✅ Found ${devices.length} USB printer(s):\n`);

  devices.forEach((device, index) => {
    console.log(`Printer ${index + 1}:`);
    console.log(
      `  Vendor ID: 0x${
        device.deviceDescriptor?.idVendor?.toString(16).padStart(4, "0") ||
        "unknown"
      }`
    );
    console.log(
      `  Product ID: 0x${
        device.deviceDescriptor?.idProduct?.toString(16).padStart(4, "0") ||
        "unknown"
      }`
    );
    console.log(
      `  Manufacturer: ${device.deviceDescriptor?.iManufacturer || "unknown"}`
    );
    console.log(`  Product: ${device.deviceDescriptor?.iProduct || "unknown"}`);
    console.log("");
  });

  // Step 2: Try to connect to the first printer
  console.log("Step 2: Connecting to printer...\n");

  const device = devices[0];

  try {
    device.open((error) => {
      if (error) {
        console.log("❌ Failed to open printer device");
        console.log(`Error: ${error.message}\n`);
        console.log("Troubleshooting:");
        console.log("1. Close any other applications using the printer");
        console.log("2. On Windows, make sure the printer driver is installed");
        console.log(
          "3. On Linux, check permissions: sudo chmod 666 /dev/usb/lp0"
        );
        console.log("4. Try unplugging and replugging the USB cable");
        process.exit(1);
      }

      console.log("✅ Successfully connected to printer\n");

      // Step 3: Print test receipt
      console.log("Step 3: Printing test receipt...\n");

      const printer = new escpos.Printer(device);

      try {
        printer
          .font("a")
          .align("ct")
          .style("bu")
          .size(2, 2)
          .text("TEST RECEIPT")
          .size(1, 1)
          .style("normal")
          .text("")
          .text("========================================")
          .text("")
          .text("Xprinter XP-N160II")
          .text("Thermal Receipt Printer Test")
          .text("")
          .align("lt")
          .text(`Date: ${new Date().toLocaleString()}`)
          .text("")
          .text("========================================")
          .text("")
          .align("ct")
          .style("b")
          .size(1, 1)
          .text("TEST SUCCESSFUL!")
          .style("normal")
          .text("")
          .text("If you can read this receipt,")
          .text("your printer is working correctly!")
          .text("")
          .text("========================================")
          .text("")
          .text("Thank you for testing!")
          .text("")
          .text("")
          .cut()
          .close();

        console.log("✅ Test receipt sent to printer successfully!\n");
        console.log("Please check your printer for the printed receipt.\n");
        console.log("==========================================\n");
        console.log("✨ Printer test completed successfully!\n");
        console.log(
          "Your Xprinter XP-N160II is ready to use with the Pizza POS system.\n"
        );

        process.exit(0);
      } catch (printError) {
        console.log("❌ Failed to print test receipt");
        console.log(`Error: ${printError.message}\n`);
        console.log("Troubleshooting:");
        console.log("1. Check if printer has paper loaded");
        console.log("2. Make sure the paper cover is closed");
        console.log("3. Check for paper jams");
        console.log(
          "4. Verify the printer is not in an error state (check LED indicators)"
        );
        process.exit(1);
      }
    });
  } catch (connectionError) {
    console.log("❌ Connection error");
    console.log(`Error: ${connectionError.message}`);
    process.exit(1);
  }
} catch (error) {
  console.log("❌ Fatal error");
  console.log(`Error: ${error.message}\n`);
  console.log("Please make sure:");
  console.log("1. Node.js dependencies are installed (npm install)");
  console.log("2. You have the required system libraries for USB access");
  console.log("3. On Linux: sudo apt-get install libusb-1.0-0-dev");
  console.log("4. On macOS: brew install libusb");
  process.exit(1);
}
