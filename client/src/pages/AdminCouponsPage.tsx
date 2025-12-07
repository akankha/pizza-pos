import { ArrowLeft, Plus, Edit, Trash2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { showToast } from "../components/Toast";
import { authFetch, isAuthenticated } from "../utils/auth";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  expiryDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: "",
    expiryDate: "",
    usageLimit: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
      return;
    }
    loadCoupons();
  }, [navigate]);

  const loadCoupons = async () => {
    try {
      const response = await authFetch("/api/coupons");
      const result = await response.json();
      if (result.success) {
        setCoupons(result.coupons);
      }
    } catch (error) {
      console.error("Failed to load coupons:", error);
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiryDate: formData.expiryDate || null,
      };

      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          editingCoupon ? "Coupon updated successfully" : "Coupon created successfully",
          "success"
        );
        loadCoupons();
        setShowCreateModal(false);
        setEditingCoupon(null);
        resetForm();
      } else {
        showToast(result.error || "Failed to save coupon", "error");
      }
    } catch (error) {
      console.error("Failed to save coupon:", error);
      showToast("Failed to save coupon", "error");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : "",
      usageLimit: coupon.usageLimit?.toString() || "",
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      const response = await authFetch(`/api/coupons/${coupon.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        showToast("Coupon deleted successfully", "success");
        loadCoupons();
      } else {
        showToast(result.error || "Failed to delete coupon", "error");
      }
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      showToast("Failed to delete coupon", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: "",
      expiryDate: "",
      usageLimit: "",
    });
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingScreen message="Loading coupons..." variant="dark" />;
  }

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
              <span className="text-2xl">🎫</span>
              <span className="hidden sm:inline">Coupon Management</span>
            </h1>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#e85d2a] text-white rounded-xl shadow-md transition-all duration-300"
            >
              <Plus size={20} />
              <span className="font-medium hidden sm:inline">Create Coupon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search coupons by code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">
                          {coupon.code}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900">
                          {coupon.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-900">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue || 0}%`
                            : `$${(coupon.discountValue || 0).toFixed(2)}`
                          }
                          {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                            <div className="text-xs text-slate-500">
                              Max: ${(coupon.maxDiscountAmount || 0).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-900">
                          {coupon.usedCount}
                          {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-[#FF6B35] hover:text-[#e85d2a] mr-4 p-1 rounded transition-colors"
                          title="Edit coupon"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCoupons.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">🎫</div>
                <div className="text-slate-600 font-medium mb-1">
                  {searchQuery ? "No coupons match your search" : "No coupons created yet"}
                </div>
                <div className="text-slate-500 text-sm">
                  {searchQuery ? "Try a different search term" : "Create your first discount coupon"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Max Discount Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Order Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e85d2a] text-white rounded-lg font-medium"
                  >
                    {editingCoupon ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}