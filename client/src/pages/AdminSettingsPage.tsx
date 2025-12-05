import {
  ArrowLeft,
  Building2,
  Moon,
  Palette,
  Receipt,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
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
      const settingsToSend = {
        ...settings,
        dark_mode: settings.dark_mode ? 1 : 0,
      };

      const response = await authFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settingsToSend),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Settings saved successfully!");

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
    <div className="h-screen w-screen bg-slate-800 flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-300 shadow-md"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>

            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 size={24} />
              <span className="hidden sm:inline">Restaurant Settings</span>
            </h1>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {successMessage && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-xl p-4 mb-6 text-center font-medium animate-slide-up">
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 size={20} className="text-[#FF6B35]" />
                Restaurant Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_name}
                    onChange={(e) =>
                      handleChange("restaurant_name", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="Pizza Paradise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={settings.restaurant_phone}
                    onChange={(e) =>
                      handleChange("restaurant_phone", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_address}
                    onChange={(e) =>
                      handleChange("restaurant_address", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City, State ZIP *
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_city}
                    onChange={(e) =>
                      handleChange("restaurant_city", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="City, ST 12345"
                  />
                </div>
              </div>
            </div>

            {/* Tax Configuration */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Receipt size={20} className="text-[#FF6B35]" />
                Tax Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    GST Label
                  </label>
                  <input
                    type="text"
                    value={settings.tax_label_gst}
                    onChange={(e) =>
                      handleChange("tax_label_gst", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="GST"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="5.00"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Current: {(settings.gst_rate * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PST Label
                  </label>
                  <input
                    type="text"
                    value={settings.tax_label_pst}
                    onChange={(e) =>
                      handleChange("tax_label_pst", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="PST"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                    placeholder="7.00"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Current: {(settings.pst_rate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
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
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Palette size={20} className="text-[#FF6B35]" />
                Appearance
              </h2>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="text-base font-medium text-slate-900 flex items-center gap-2">
                    <Moon size={18} className="text-slate-600" />
                    Dark Mode
                  </label>
                  <p className="text-sm text-slate-500 mt-1">
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
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={22} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
