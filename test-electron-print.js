/**
 * Simple test script to verify MUNBYN printer connection
 * Run this with: node test-electron-print.js
 */

const escpos = require("escpos");
const USB = require("escpos-usb");

console.log("🔍 Searching for USB printers...");

// Find all USB devices
const devices = USB.findPrinter();

if (!devices || devices.length === 0) {
  console.error("❌ No USB printers found!");
  console.log("\nTroubleshooting:");
  console.log("1. Make sure MUNBYN printer is connected via USB");
  console.log("2. Make sure printer is powered ON");
  console.log("3. Check Windows Device Manager for USB devices");
  process.exit(1);
}

console.log(`✅ Found ${devices.length} USB device(s):`);

devices.forEach((device, index) => {
  console.log(`\nDevice ${index + 1}:`);
  console.log(
    `  Vendor ID: 0x${device.deviceDescriptor.idVendor.toString(16)}`
  );
  console.log(
    `  Product ID: 0x${device.deviceDescriptor.idProduct.toString(16)}`
  );

  try {
    const desc = device.deviceDescriptor;
    console.log(`  Manufacturer: ${desc.iManufacturer || "Unknown"}`);
    console.log(`  Product: ${desc.iProduct || "Unknown"}`);
  } catch (e) {
    console.log("  (Unable to read device description)");
  }
});

// Try to print test receipt on first device
console.log("\n📄 Attempting to print test receipt...");

const device = new escpos.USB();
const printer = new escpos.Printer(device);

const testReceipt = `
========================================
           TEST RECEIPT
========================================
          MUNBYN Printer Test
          ${new Date().toLocaleString()}
========================================

This is a test print from your
Pizza POS Electron app.

If you can read this, the printer
is working correctly! ✓

========================================
      Auto-printing is READY!
========================================


`;

device.open((error) => {
  if (error) {
    console.error("❌ Failed to open printer:", error.message);
    console.log("\nPossible issues:");
    console.log("1. Printer is being used by another application");
    console.log("2. Insufficient permissions (try running as Administrator)");
    console.log("3. USB cable is loose or damaged");
    process.exit(1);
  }

  try {
    printer
      .font("a")
      .align("ct")
      .style("bu")
      .size(1, 1)
      .text(testReceipt)
      .cut()
      .close(() => {
        console.log("✅ Test receipt printed successfully!");
        console.log("\n✨ Your MUNBYN printer is ready for use!");
        console.log("You can now run: npm run electron:dev");
        process.exit(0);
      });
  } catch (printError) {
    console.error("❌ Print error:", printError.message);
    process.exit(1);
  }
});
