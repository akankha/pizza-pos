import { ArrowLeft, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import TouchButton from "../components/TouchButton";
import { useTheme } from "../contexts/ThemeContext";
import { authFetch } from "../utils/api";

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { toggleDarkMode } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
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
    dark_mode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await authFetch("api/settings");
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
          dark_mode:
            result.data.dark_mode === 1 || result.data.dark_mode === true,
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    try {
      console.log("Submitting settings:", settings);

      // Convert dark_mode boolean to number for database
      const settingsToSend = {
        ...settings,
        dark_mode: settings.dark_mode ? 1 : 0,
      };

      console.log("Settings to send:", settingsToSend);

      const response = await authFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settingsToSend),
      });

      const result = await response.json();
      console.log("Settings response:", result);

      if (result.success) {
        setSuccessMessage("Settings saved successfully!");

        // Trigger theme update by toggling if needed
        const currentDarkMode =
          document.documentElement.classList.contains("dark");
        if (settings.dark_mode !== currentDarkMode) {
          toggleDarkMode();
        }

        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error(result.error || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Settings save error:", error);
      showToast("Error saving settings: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
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

            {/* Appearance Settings */}
            <div className="pt-6 border-t-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-3xl">🎨</span>
                Appearance
              </h2>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span>🌙</span> Dark Mode
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable dark theme across the entire system
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dark_mode}
                    onChange={(e) =>
                      handleChange("dark_mode", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t-2 border-gray-200">
              <TouchButton
                type="submit"
                variant="primary"
                size="large"
                className="w-full !text-2xl !py-6"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "💾 Save Settings"}
              </TouchButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
