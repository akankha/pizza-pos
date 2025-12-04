import { ArrowLeft, Edit, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TouchButton from "../components/TouchButton";
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
      alert("Failed to save item");
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
      alert("Failed to delete item");
    }
  };

  if (loading || !menuData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-3xl font-bold">Loading...</div>
      </div>
    );
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

          <h1 className="text-4xl font-bold">🍕 Menu Management</h1>

          <TouchButton
            onClick={() => setIsAdding(true)}
            variant="success"
            size="medium"
            className="!bg-green-500 hover:!bg-green-600"
          >
            <Plus size={28} />
          </TouchButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold text-lg border-b-4 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getItems().map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-orange-300 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {item.displayName || item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.items && (
                      <p className="text-sm text-orange-600 mt-1 font-medium">
                        📦 {item.items}
                      </p>
                    )}
                    {item.toppings && (
                      <p className="text-sm text-orange-600 mt-1 font-medium">
                        🍕 {item.toppings}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-all"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  {activeTab === "specialty" ? (
                    <>
                      <div className="text-sm text-gray-600 font-semibold mb-2">
                        Prices:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Small:</span>
                          <span className="font-bold text-orange-600">
                            $
                            {item.prices?.small?.toFixed(2) ||
                              item.price_small?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medium:</span>
                          <span className="font-bold text-orange-600">
                            $
                            {item.prices?.medium?.toFixed(2) ||
                              item.price_medium?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Large:</span>
                          <span className="font-bold text-orange-600">
                            $
                            {item.prices?.large?.toFixed(2) ||
                              item.price_large?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">X-Large:</span>
                          <span className="font-bold text-orange-600">
                            $
                            {item.prices?.xlarge?.toFixed(2) ||
                              item.price_xlarge?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold">
                        Price:
                      </span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
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
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 font-semibold">
                        Category:
                      </span>
                      <span className="text-gray-800 capitalize">
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          {item ? "Edit Item" : "Add New Item"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
              required
            />
          </div>

          {(type === "size" || type === "crust") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
              />
            </div>
          )}

          {type !== "specialty" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                required
              />
            </div>
          )}

          {(type === "side" || type === "drink" || type === "combo") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                rows={3}
              />
            </div>
          )}

          {type === "combo" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Items Included
                </label>
                <textarea
                  value={formData.items}
                  onChange={(e) =>
                    setFormData({ ...formData, items: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                  rows={3}
                  placeholder="e.g., 2 Medium Pizzas, 1 Large Fries, 2L Pop"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Toppings Allowed Per Pizza
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.toppings_allowed || 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      toppings_allowed: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                  placeholder="e.g., 1, 2, 3, 4..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many toppings customers can select per pizza in this combo
                </p>
              </div>
            </>
          )}

          {type === "specialty" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Toppings
                </label>
                <textarea
                  value={formData.toppings}
                  onChange={(e) =>
                    setFormData({ ...formData, toppings: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                  rows={2}
                  placeholder="e.g., Pepperoni, Mushrooms, Green Peppers"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {type === "topping" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
                placeholder="e.g., thin, thick, etc."
              />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl font-bold rounded-2xl py-4 transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Save size={24} />
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xl font-bold rounded-2xl py-4 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <X size={24} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
