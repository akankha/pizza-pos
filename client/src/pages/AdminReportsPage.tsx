import {
  ArrowLeft,
  Calendar,
  Download,
  Printer,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import TouchButton from "../components/TouchButton";
import { authFetch, isAuthenticated } from "../utils/auth";
import { browserPrintService } from "../utils/browserPrintService";

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deleteNote, setDeleteNote] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
      return;
    }
    loadReport();
  }, [navigate, period]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/admin/reports/${period}`);
      const result = await response.json();
      if (result.success) {
        // Convert string values to numbers for proper rendering
        const data = result.data;
        setReportData({
          ...data,
          totalSales: parseFloat(data.totalSales) || 0,
          avgOrder: parseFloat(data.avgOrder) || 0,
          topItems:
            data.topItems?.map((item: any) => ({
              ...item,
              quantity: parseInt(item.quantity) || 0,
              revenue: parseFloat(item.revenue) || 0,
            })) || [],
          paymentMethods: data.paymentMethods
            ? Object.fromEntries(
                Object.entries(data.paymentMethods).map(
                  ([key, value]: [string, any]) => [
                    key,
                    {
                      count: parseInt(value.count) || 0,
                      total: parseFloat(value.total) || 0,
                    },
                  ]
                )
              )
            : {},
          hourlySales:
            data.hourlySales?.map((hour: any) => ({
              ...hour,
              orderCount: parseInt(hour.orderCount) || 0,
              sales: parseFloat(hour.sales) || 0,
            })) || [],
          recentOrders: data.recentOrders || [],
        });
      }
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    const csv = generateCSV(reportData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${period}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  const generateCSV = (data: any) => {
    let csv = "Sales Report\n\n";
    csv += `Period: ${period}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += `Total Sales: $${data.totalSales?.toFixed(2) || "0.00"}\n`;
    csv += `Total Orders: ${data.totalOrders || 0}\n`;
    csv += `Average Order: $${data.avgOrder?.toFixed(2) || "0.00"}\n\n`;

    csv += "Top Items\n";
    csv += "Name,Quantity,Revenue\n";
    (data.topItems || []).forEach((item: any) => {
      csv += `${item.name},${item.quantity},$${item.revenue.toFixed(2)}\n`;
    });

    csv += "\n\nPayment Methods\n";
    csv += "Method,Transactions,Total\n";
    Object.entries(data.paymentMethods || {}).forEach(
      ([method, pmData]: [string, any]) => {
        csv += `${method},${pmData.count},$${pmData.total.toFixed(2)}\n`;
      }
    );

    csv += "\n\nRecent Orders\n";
    csv += "Order ID,Date,Total,Payment Method,Items\n";
    (data.recentOrders || []).forEach((order: any) => {
      const itemsList = order.items
        .map((i: any) => `${i.quantity}x ${i.name}`)
        .join("; ");
      csv += `${order.id},${new Date(
        order.createdAt
      ).toLocaleString()},$${parseFloat(order.total).toFixed(2)},${
        order.paymentMethod
      },"${itemsList}"\n`;
    });

    return csv;
  };

  const handleReprint = async (order: any) => {
    try {
      showToast("Printing receipt...", "info");

      // Format order data for printing
      const printData = {
        orderId: order.id,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations || [],
        })),
        subtotal: parseFloat(order.subtotal) || 0,
        tax: parseFloat(order.tax) || 0,
        total: parseFloat(order.total),
        paymentMethod: order.paymentMethod,
        customerName: order.customerName || "Guest",
        orderType: order.orderType || "dine-in",
        timestamp: order.createdAt,
      };

      const result = await browserPrintService.print(printData);

      if (result.success) {
        showToast("Receipt sent to printer", "success");
      } else {
        showToast(
          "Print failed: " + (result.error || "Unknown error"),
          "error"
        );
      }
    } catch (error: any) {
      console.error("Reprint error:", error);
      showToast("Failed to print: " + error.message, "error");
    }
  };

  const initiateDeleteOrder = (order: any) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
    setDeleteNote("");
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder || !deleteNote.trim()) {
      showToast("Please provide a reason for deleting this order", "warning");
      return;
    }

    try {
      const response = await authFetch(
        `/api/orders/${selectedOrder.id}/soft-delete`,
        {
          method: "PUT",
          body: JSON.stringify({ deleteNote: deleteNote.trim() }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToast("Order marked as deleted", "success");
        setShowDeleteModal(false);
        setSelectedOrder(null);
        setDeleteNote("");
        loadReport(); // Reload to update the list
      } else {
        showToast("Failed to delete order: " + result.error, "error");
      }
    } catch (error: any) {
      showToast("Error deleting order: " + error.message, "error");
    }
  };

  const downloadDeletedOrders = async () => {
    try {
      showToast("Generating deleted orders report...", "info");

      const response = await authFetch("/api/admin/reports/deleted-orders");
      const result = await response.json();

      if (result.success && result.data) {
        const csv = generateDeletedOrdersCSV(result.data);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `deleted-orders-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        showToast("Deleted orders report downloaded", "success");
      } else {
        showToast("No deleted orders found", "info");
      }
    } catch (error: any) {
      showToast("Failed to download report: " + error.message, "error");
    }
  };

  const generateDeletedOrdersCSV = (orders: any[]) => {
    let csv = "Deleted Orders Report\n\n";
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv +=
      "Order ID,Date,Total,Payment Method,Deleted At,Deleted By,Reason,Items\n";

    orders.forEach((order: any) => {
      const itemsList =
        order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join("; ") ||
        "";
      const deletedAt = order.deletedAt
        ? new Date(order.deletedAt).toLocaleString()
        : "N/A";
      const deletedBy = order.deletedBy || "Unknown";
      const reason = (order.deleteNote || "No reason provided").replace(
        /"/g,
        '""'
      );

      csv += `${order.id},${new Date(
        order.createdAt
      ).toLocaleString()},$${parseFloat(order.total).toFixed(2)},${
        order.paymentMethod
      },${deletedAt},${deletedBy},"${reason}","${itemsList}"\n`;
    });

    return csv;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-3xl font-bold">Loading report...</div>
      </div>
    );
  }

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

          <h1 className="text-4xl font-bold">📊 Sales Reports</h1>

          <TouchButton
            onClick={exportReport}
            variant="success"
            size="medium"
            className="!bg-green-500 hover:!bg-green-600"
          >
            <Download size={28} />
          </TouchButton>
          <TouchButton
            onClick={downloadDeletedOrders}
            variant="outline"
            size="medium"
            className="!border-red-500 !text-red-600 hover:!bg-red-50"
            title="Download Deleted Orders Report"
          >
            <Trash2 size={28} />
          </TouchButton>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-6">
        <div className="max-w-7xl mx-auto flex gap-4">
          {(["today", "week", "month"] as const).map((p) => (
            <TouchButton
              key={p}
              onClick={() => setPeriod(p)}
              variant={period === p ? "primary" : "outline"}
              size="medium"
              className="capitalize"
            >
              <Calendar size={20} className="mr-2" />
              {p === "today"
                ? "Today"
                : p === "week"
                ? "This Week"
                : "This Month"}
            </TouchButton>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-orange-300 transition-all">
              <div className="text-sm text-gray-600 font-semibold mb-2">
                Total Sales
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ${reportData?.totalSales?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-green-300 transition-all">
              <div className="text-sm text-gray-600 font-semibold mb-2">
                Total Orders
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {reportData?.totalOrders || 0}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-blue-300 transition-all">
              <div className="text-sm text-gray-600 font-semibold mb-2">
                Average Order
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ${reportData?.avgOrder?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {reportData?.paymentMethods && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Payment Methods
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(reportData.paymentMethods).map(
                  ([method, data]: [string, any]) => (
                    <div key={method} className="bg-gray-50 rounded-xl p-6">
                      <div className="text-lg font-semibold text-gray-700 capitalize mb-2">
                        {method}
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${data.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {data.count} transactions
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {reportData?.recentOrders && reportData.recentOrders.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Recent Orders
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reportData.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800">
                          Order #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right flex items-start gap-3">
                        <div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            ${parseFloat(order.total).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {order.paymentMethod}
                          </div>
                        </div>
                        <button
                          onClick={() => handleReprint(order)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="Reprint Receipt"
                        >
                          <Printer size={20} />
                        </button>
                        <button
                          onClick={() => initiateDeleteOrder(order)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-2 border-t border-gray-200 pt-3">
                        {order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-semibold text-gray-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Top Items */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp size={32} className="text-orange-500" />
              Top Selling Items
            </h2>
            <div className="space-y-4">
              {(reportData?.topItems || [])
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-800">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} sold
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ${item.revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {/* Hourly Sales Distribution */}
          {reportData?.hourlySales && reportData.hourlySales.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Sales by Hour
              </h2>
              <div className="space-y-3">
                {reportData.hourlySales.map((hourData: any) => {
                  const maxSales = Math.max(
                    ...reportData.hourlySales.map((h: any) => h.sales)
                  );
                  const widthPercent = (hourData.sales / maxSales) * 100;

                  return (
                    <div
                      key={hourData.hour}
                      className="flex items-center gap-4"
                    >
                      <div className="w-20 text-sm font-semibold text-gray-600">
                        {hourData.hour}:00
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        >
                          <span className="text-white text-sm font-bold">
                            ${hourData.sales.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-600">
                        {hourData.orderCount} orders
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Order Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Delete Order?
              </h3>
              <p className="text-gray-600 mb-2">
                Order <strong>#{selectedOrder.id.slice(0, 8)}</strong> - $
                {parseFloat(selectedOrder.total).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                This order will be marked as deleted but kept in the system for
                records.
              </p>

              <div className="mb-6 text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Deletion *
                </label>
                <textarea
                  value={deleteNote}
                  onChange={(e) => setDeleteNote(e.target.value)}
                  placeholder="Please provide a reason (e.g., customer cancellation, wrong order, etc.)"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOrder(null);
                    setDeleteNote("");
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
