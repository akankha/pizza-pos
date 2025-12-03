import { ArrowLeft, Building2, Printer, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TouchButton from "../components/TouchButton";
import { apiUrl } from "../utils/api";
import { authFetch } from "../utils/auth";

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingPrinter, setIsTestingPrinter] = useState(false);
  const [isRunningMigration, setIsRunningMigration] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [settings, setSettings] = useState({
    restaurant_name: "",
    restaurant_address: "",
    restaurant_city: "",
    restaurant_phone: "",
    gst_rate: 0.05,
    pst_rate: 0.07,
    tax_label_gst: "GST",
    tax_label_pst: "PST",
    printer_enabled: true,
    auto_print: true,
    print_copies: 1,
  });

  useEffect(() => {
    loadSettings();
    checkPrinterStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(apiUrl("api/settings"));
      const result = await response.json();
      if (result.success && result.data) {
        setSettings({
          restaurant_name: result.data.restaurant_name || "",
          restaurant_address: result.data.restaurant_address || "",
          restaurant_city: result.data.restaurant_city || "",
          restaurant_phone: result.data.restaurant_phone || "",
          gst_rate: parseFloat(result.data.gst_rate) || 0.05,
          pst_rate: parseFloat(result.data.pst_rate) || 0.07,
          tax_label_gst: result.data.tax_label_gst || "GST",
          tax_label_pst: result.data.tax_label_pst || "PST",
          printer_enabled: result.data.printer_enabled !== 0,
          auto_print: result.data.auto_print !== 0,
          print_copies: result.data.print_copies || 1,
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const checkPrinterStatus = async () => {
    try {
      const response = await authFetch("/api/settings/printer/status");
      const result = await response.json();
      if (result.success) {
        setPrinterStatus(result.data);
      }
    } catch (error) {
      console.error("Failed to check printer status:", error);
    }
  };

  const testPrinter = async () => {
    setIsTestingPrinter(true);
    try {
      const response = await authFetch("/api/settings/printer/test", {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        alert(
          "✅ Test receipt sent to printer!\n\nPlease check your Xprinter for the printed receipt."
        );
        await checkPrinterStatus();
      } else {
        alert("❌ Printer test failed:\n" + (result.error || "Unknown error"));
      }
    } catch (error: any) {
      alert("❌ Error testing printer:\n" + error.message);
    } finally {
      setIsTestingPrinter(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    try {
      const response = await authFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Settings saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error(result.error || "Failed to save settings");
      }
    } catch (error: any) {
      alert("Error saving settings: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const runMigration = async () => {
    if (
      !confirm(
        "Run database migration to add user tracking to orders?\n\nThis will add created_by and created_by_name columns to the orders table."
      )
    ) {
      return;
    }

    setIsRunningMigration(true);
    try {
      const response = await fetch(apiUrl("/api/migrations/add-created-by"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Migration completed successfully!\n\n" + result.message);
      } else {
        alert("❌ Migration failed:\n" + (result.error || "Unknown error"));
      }
    } catch (error: any) {
      alert("❌ Error running migration:\n" + error.message);
    } finally {
      setIsRunningMigration(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 shadow-2xl">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <TouchButton
            onClick={() => navigate("/admin/dashboard")}
            variant="outline"
            size="medium"
            className="!bg-white/10 !text-white hover:!bg-white/20 backdrop-blur-sm border-white/20"
          >
            <ArrowLeft size={28} />
          </TouchButton>

          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Building2 size={40} />
            Restaurant Settings
          </h1>

          <div className="w-24"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {successMessage && (
            <div className="bg-green-100 border-2 border-green-500 text-green-800 rounded-2xl p-4 mb-6 text-center font-semibold">
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
          >
            {/* Restaurant Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building2 size={28} className="text-orange-600" />
                Restaurant Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_name}
                    onChange={(e) =>
                      handleChange("restaurant_name", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="Pizza Paradise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={settings.restaurant_phone}
                    onChange={(e) =>
                      handleChange("restaurant_phone", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_address}
                    onChange={(e) =>
                      handleChange("restaurant_address", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City, State ZIP *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_city}
                    onChange={(e) =>
                      handleChange("restaurant_city", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="City, ST 12345"
                  />
                </div>
              </div>
            </div>

            {/* Tax Configuration */}
            <div className="pt-6 border-t-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-3xl">💰</span>
                Tax Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Label
                  </label>
                  <input
                    type="text"
                    value={settings.tax_label_gst}
                    onChange={(e) =>
                      handleChange("tax_label_gst", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="GST"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={(settings.gst_rate * 100).toFixed(2)}
                    onChange={(e) =>
                      handleChange("gst_rate", parseFloat(e.target.value) / 100)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="5.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(settings.gst_rate * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PST Label
                  </label>
                  <input
                    type="text"
                    value={settings.tax_label_pst}
                    onChange={(e) =>
                      handleChange("tax_label_pst", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="PST"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={(settings.pst_rate * 100).toFixed(2)}
                    onChange={(e) =>
                      handleChange("pst_rate", parseFloat(e.target.value) / 100)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    placeholder="7.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {(settings.pst_rate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Total Tax Rate:</strong>{" "}
                  {((settings.gst_rate + settings.pst_rate) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Example: $100.00 subtotal = $
                  {((settings.gst_rate + settings.pst_rate) * 100).toFixed(2)}{" "}
                  tax
                </p>
              </div>
            </div>

            {/* Printer Configuration */}
            <div className="pt-6 border-t-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Printer size={28} className="text-purple-600" />
                Thermal Printer Settings
              </h2>

              {/* Printer Status */}
              <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-700">
                      Printer Status
                    </p>
                    {printerStatus ? (
                      <p
                        className={`text-sm mt-1 ${
                          printerStatus.connected
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {printerStatus.connected
                          ? "✅ Connected"
                          : "❌ Not Connected"}
                        {printerStatus.error && ` - ${printerStatus.error}`}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">Checking...</p>
                    )}
                  </div>
                  <TouchButton
                    onClick={testPrinter}
                    disabled={isTestingPrinter}
                    variant="secondary"
                    size="medium"
                  >
                    {isTestingPrinter ? "Testing..." : "Test Print"}
                  </TouchButton>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.printer_enabled}
                      onChange={(e) =>
                        handleChange("printer_enabled", e.target.checked)
                      }
                      className="w-6 h-6 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-700">
                        Enable Thermal Printer
                      </span>
                      <span className="block text-xs text-gray-500">
                        Turn receipt printing on/off
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_print}
                      onChange={(e) =>
                        handleChange("auto_print", e.target.checked)
                      }
                      disabled={!settings.printer_enabled}
                      className="w-6 h-6 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-700">
                        Auto-Print on Order Complete
                      </span>
                      <span className="block text-xs text-gray-500">
                        Print receipts automatically
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Copies
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={settings.print_copies}
                    onChange={(e) =>
                      handleChange("print_copies", parseInt(e.target.value))
                    }
                    disabled={!settings.printer_enabled}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Print 1-5 copies per receipt
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <p className="text-sm text-purple-800">
                  <strong>🖨️ Xprinter XP-N160II</strong>
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  80mm thermal printer connected via USB. Receipts will print
                  automatically when orders are marked as "Ready" or
                  "Completed".
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-2xl text-2xl font-bold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
              >
                <Save size={32} />
                <span>{isSaving ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>

          {/* Database Migration Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Database size={28} className="text-blue-600" />
              Database Migration
            </h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>User Tracking Migration</strong>
              </p>
              <p className="text-xs text-blue-600">
                This migration adds user tracking to orders, allowing the system
                to record which staff member created each order. It adds{" "}
                <code className="bg-blue-100 px-1 rounded">created_by</code> and{" "}
                <code className="bg-blue-100 px-1 rounded">
                  created_by_name
                </code>{" "}
                columns to the orders table.
              </p>
            </div>

            <button
              type="button"
              onClick={runMigration}
              disabled={isRunningMigration}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
            >
              <Database size={28} />
              <span>
                {isRunningMigration
                  ? "Running Migration..."
                  : "Run User Tracking Migration"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
