import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { showToast } from "../components/Toast";
import { authFetch } from "../utils/api";

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
    loadCoupons();
  }, []);

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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Coupon Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create and manage discount coupons
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] hover:bg-[#e85d2a] text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Create Coupon
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-white">
                        {coupon.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-900 dark:text-white">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `$${coupon.discountValue.toFixed(2)}`
                        }
                        {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                          <div className="text-xs text-slate-500">
                            Max: ${coupon.maxDiscountAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-900 dark:text-white">
                        {coupon.usedCount}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-[#FF6B35] hover:text-[#e85d2a] mr-4"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon)}
                        className="text-red-600 hover:text-red-800"
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
              <div className="text-slate-400 dark:text-slate-500 text-lg mb-2">No coupons found</div>
              <div className="text-slate-300 dark:text-slate-600">
                {searchQuery ? "Try adjusting your search" : "Create your first coupon"}
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Value *
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
        )}
      </div>
    </div>
  );
}