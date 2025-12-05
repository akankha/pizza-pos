import { ArrowLeft, Edit, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { showToast } from "../components/Toast";
import { useMenu } from "../contexts/MenuContext";
import { authFetch, isAuthenticated } from "../utils/auth";

type MenuItemType =
  | "size"
  | "crust"
  | "topping"
  | "side"
  | "drink"
  | "combo"
  | "specialty";

export default function AdminMenuPage() {
  const navigate = useNavigate();
  const { menuData, loading, refetch } = useMenu();
  const [activeTab, setActiveTab] = useState<MenuItemType>("size");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleSave = async (item: any) => {
    try {
      const endpoint = editingItem?.id
        ? `/api/admin/menu/${activeTab}/${editingItem.id}`
        : `/api/admin/menu/${activeTab}`;
      const method = editingItem?.id ? "PUT" : "POST";

      const response = await authFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const result = await response.json();
      if (result.success) {
        setEditingItem(null);
        setIsAdding(false);
        refetch();
      }
    } catch (error) {
      console.error("Failed to save item:", error);
      showToast("Failed to save item", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await authFetch(`/api/admin/menu/${activeTab}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        refetch();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      showToast("Failed to delete item", "error");
    }
  };

  if (loading || !menuData) {
    return <LoadingScreen message="Loading menu..." variant="dark" />;
  }

  const tabs = [
    { id: "size" as MenuItemType, label: "Sizes", icon: "📏" },
    { id: "crust" as MenuItemType, label: "Crusts", icon: "🥖" },
    { id: "topping" as MenuItemType, label: "Toppings", icon: "🧀" },
    { id: "side" as MenuItemType, label: "Sides", icon: "🍟" },
    { id: "drink" as MenuItemType, label: "Drinks", icon: "🥤" },
    { id: "combo" as MenuItemType, label: "Combos", icon: "🎁" },
    { id: "specialty" as MenuItemType, label: "Specialty Pizzas", icon: "🍕" },
  ];

  const getItems = () => {
    switch (activeTab) {
      case "size":
        return menuData.sizes;
      case "crust":
        return menuData.crusts;
      case "topping":
        return menuData.toppings;
      case "side":
        return menuData.sides;
      case "drink":
        return menuData.drinks;
      case "combo":
        return menuData.combos;
      case "specialty":
        return menuData.specialtyPizzas;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-800 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 shadow-lg">
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
              <span className="text-2xl">🍕</span>
              <span className="hidden sm:inline">Menu Management</span>
            </h1>

            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all duration-300"
            >
              <Plus size={20} />
              <span className="font-medium hidden sm:inline">Add New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto custom-scrollbar py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-[#FF6B35] text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getItems().map((item: any, index: number) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.displayName || item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.items && (
                      <p className="text-sm text-[#FF6B35] mt-1 font-medium">
                        📦 {item.items}
                      </p>
                    )}
                    {item.toppings && (
                      <p className="text-sm text-[#FF6B35] mt-1 font-medium">
                        🍕 {item.toppings}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all shadow-md"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all shadow-md"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                  {activeTab === "specialty" ? (
                    <>
                      <div className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">
                        Prices
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Small:</span>
                          <span className="font-bold text-[#FF6B35]">
                            $
                            {item.prices?.small?.toFixed(2) ||
                              item.price_small?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Medium:</span>
                          <span className="font-bold text-[#FF6B35]">
                            $
                            {item.prices?.medium?.toFixed(2) ||
                              item.price_medium?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Large:</span>
                          <span className="font-bold text-[#FF6B35]">
                            $
                            {item.prices?.large?.toFixed(2) ||
                              item.price_large?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">X-Large:</span>
                          <span className="font-bold text-[#FF6B35]">
                            $
                            {item.prices?.xlarge?.toFixed(2) ||
                              item.price_xlarge?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm font-medium">
                        Price
                      </span>
                      <span className="text-2xl font-bold text-[#FF6B35]">
                        $
                        {(
                          item.basePrice ||
                          item.price ||
                          item.priceModifier ||
                          0
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {item.category && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-500 text-sm">Category</span>
                      <span className="text-slate-700 capitalize text-sm px-2 py-0.5 bg-slate-200 rounded-lg font-medium">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {(editingItem || isAdding) && (
        <EditModal
          item={editingItem}
          type={activeTab}
          onSave={handleSave}
          onCancel={() => {
            setEditingItem(null);
            setIsAdding(false);
          }}
        />
      )}
    </div>
  );
}

function EditModal({ item, type, onSave, onCancel }: any) {
  // Transform specialty pizza data from database format to form format
  const initializeFormData = () => {
    if (item && type === "specialty") {
      return {
        ...item,
        prices: {
          small: item.price_small || item.prices?.small || 0,
          medium: item.price_medium || item.prices?.medium || 0,
          large: item.price_large || item.prices?.large || 0,
          xlarge: item.price_xlarge || item.prices?.xlarge || 0,
        },
      };
    }

    if (item) {
      // For existing items, preserve all fields including toppings_allowed
      return {
        ...item,
        toppings_allowed: item.toppings_allowed ?? 3,
      };
    }

    // For new items
    return {
      name: "",
      displayName: "",
      price: 0,
      basePrice: 0,
      priceModifier: 0,
      description: "",
      category:
        type === "topping"
          ? "veggie"
          : type === "combo"
          ? "combo"
          : type === "specialty"
          ? "specialty"
          : "",
      type: "",
      items: "",
      toppings: "",
      toppings_allowed: 3,
      prices: {
        small: 0,
        medium: 0,
        large: 0,
        xlarge: 0,
      },
    };
  };

  const [formData, setFormData] = useState(initializeFormData());

  // Reinitialize form data when item changes
  useEffect(() => {
    const newData = initializeFormData();
    console.log("EditModal - Initializing form data:", { item, type, newData });
    setFormData(newData);
  }, [item, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {item ? "Edit Item" : "Add New Item"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
              required
            />
          </div>

          {(type === "size" || type === "crust") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
              />
            </div>
          )}

          {type !== "specialty" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {type === "size"
                  ? "Base Price"
                  : type === "crust"
                  ? "Price Modifier"
                  : "Price"}
              </label>
              <input
                type="number"
                step="0.01"
                value={
                  type === "size"
                    ? formData.basePrice
                    : type === "crust"
                    ? formData.priceModifier
                    : formData.price
                }
                onChange={(e) => {
                  const field =
                    type === "size"
                      ? "basePrice"
                      : type === "crust"
                      ? "priceModifier"
                      : "price";
                  setFormData({
                    ...formData,
                    [field]: parseFloat(e.target.value),
                  });
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                required
              />
            </div>
          )}

          {(type === "side" || type === "drink" || type === "combo") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all resize-none"
                rows={3}
              />
            </div>
          )}

          {type === "combo" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Items Included
                </label>
                <textarea
                  value={formData.items}
                  onChange={(e) =>
                    setFormData({ ...formData, items: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all resize-none placeholder:text-slate-400"
                  rows={3}
                  placeholder="e.g., 2 Medium Pizzas, 1 Large Fries, 2L Pop"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Toppings Allowed Per Pizza
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.toppings_allowed ?? 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      toppings_allowed: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                  placeholder="e.g., 1, 2, 3, 4..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  How many toppings customers can select per pizza in this combo
                </p>
              </div>
            </>
          )}

          {type === "specialty" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Toppings
                </label>
                <textarea
                  value={formData.toppings}
                  onChange={(e) =>
                    setFormData({ ...formData, toppings: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all resize-none placeholder:text-slate-400"
                  rows={2}
                  placeholder="e.g., Pepperoni, Mushrooms, Green Peppers"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Small Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prices?.small || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prices: {
                          ...formData.prices,
                          small: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Medium Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prices?.medium || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prices: {
                          ...formData.prices,
                          medium: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Large Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prices?.large || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prices: {
                          ...formData.prices,
                          large: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    X-Large Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prices?.xlarge || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prices: {
                          ...formData.prices,
                          xlarge: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {type === "topping" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                required
              >
                <option value="veggie">Veggie</option>
                <option value="meat">Meat</option>
                <option value="cheese">Cheese</option>
              </select>
            </div>
          )}

          {type === "crust" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                placeholder="e.g., thin, thick, etc."
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl py-3.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
