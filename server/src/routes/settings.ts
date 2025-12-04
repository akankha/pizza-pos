import express from "express";
import pool from "../db/database.js";
import {
  authenticateToken,
  requireRestaurantAdmin,
} from "../middleware/auth.js";
import { PrinterService } from "../services/PrinterService.js";

const router = express.Router();

// Get restaurant settings (public)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_settings LIMIT 1"
    );
    const settings = (rows as any[])[0];

    if (!settings) {
      return res
        .status(404)
        .json({ success: false, error: "Settings not found" });
    }

    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("Get settings error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

// Update restaurant settings (Restaurant Admin or Super Admin)
router.put("/", authenticateToken, requireRestaurantAdmin, async (req, res) => {
  try {
    console.log("Update settings request:", {
      user: req.user,
      body: req.body,
    });

    const {
      restaurant_name,
      restaurant_address,
      restaurant_city,
      restaurant_phone,
      gst_rate,
      pst_rate,
      tax_label_gst,
      tax_label_pst,
      printer_enabled,
      auto_print,
      print_copies,
    } = req.body;

    // Validate required fields
    if (
      !restaurant_name ||
      !restaurant_address ||
      !restaurant_city ||
      !restaurant_phone
    ) {
      return res.status(400).json({
        success: false,
        error: "Restaurant name, address, city, and phone are required",
      });
    }

    // Validate tax rates
    if (gst_rate !== undefined && (gst_rate < 0 || gst_rate > 1)) {
      return res.status(400).json({
        success: false,
        error: "GST rate must be between 0 and 1",
      });
    }

    if (pst_rate !== undefined && (pst_rate < 0 || pst_rate > 1)) {
      return res.status(400).json({
        success: false,
        error: "PST rate must be between 0 and 1",
      });
    }

    // Validate printer settings
    if (print_copies !== undefined && (print_copies < 1 || print_copies > 10)) {
      return res.status(400).json({
        success: false,
        error: "Print copies must be between 1 and 10",
      });
    }

    console.log("Updating settings in database...");

    await pool.query(
      `
      UPDATE restaurant_settings 
      SET restaurant_name = ?,
          restaurant_address = ?,
          restaurant_city = ?,
          restaurant_phone = ?,
          gst_rate = ?,
          pst_rate = ?,
          tax_label_gst = ?,
          tax_label_pst = ?,
          printer_enabled = ?,
          auto_print = ?,
          print_copies = ?
      WHERE id = 1
    `,
      [
        restaurant_name,
        restaurant_address,
        restaurant_city,
        restaurant_phone,
        gst_rate ?? 0.05,
        pst_rate ?? 0.07,
        tax_label_gst ?? "GST",
        tax_label_pst ?? "PST",
        printer_enabled !== undefined ? (printer_enabled ? 1 : 0) : 1,
        auto_print !== undefined ? (auto_print ? 1 : 0) : 1,
        print_copies ?? 1,
      ]
    );

    console.log("Settings updated successfully");

    const [rows] = await pool.query(
      "SELECT * FROM restaurant_settings WHERE id = 1"
    );
    const settings = (rows as any[])[0];

    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("Update settings error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update settings",
    });
  }
});

// Check printer status (Restaurant Admin and above)
router.get(
  "/printer/status",
  authenticateToken,
  requireRestaurantAdmin,
  async (req, res) => {
    try {
      const status = await PrinterService.checkStatus();
      res.json({ success: true, data: status });
    } catch (error: any) {
      console.error("Printer status error:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to check printer status" });
    }
  }
);

// Test print (Restaurant Admin and above)
router.post(
  "/printer/test",
  authenticateToken,
  requireRestaurantAdmin,
  async (req, res) => {
    try {
      const result = await PrinterService.printTestReceipt();

      if (result.success) {
        res.json({ success: true, message: "Test receipt sent to printer" });
      } else {
        res
          .status(500)
          .json({ success: false, error: result.error || "Print failed" });
      }
    } catch (error: any) {
      console.error("Test print error:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to print test receipt" });
    }
  }
);

// Get available printers (Restaurant Admin and above)
router.get(
  "/printer/list",
  authenticateToken,
  requireRestaurantAdmin,
  async (req, res) => {
    try {
      const printers = PrinterService.getAvailablePrinters();
      res.json({ success: true, data: printers });
    } catch (error: any) {
      console.error("List printers error:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to list printers" });
    }
  }
);

export default router;
