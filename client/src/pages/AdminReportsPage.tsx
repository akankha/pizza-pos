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
import LoadingScreen from "../components/LoadingScreen";
import { showToast } from "../components/Toast";
import { authFetch, isAuthenticated } from "../utils/auth";
import { browserPrintService } from "../utils/browserPrintService";

type BrowserPrintPayload = Parameters<typeof browserPrintService.print>[0];

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

      const toNumber = (value: any): number => {
        if (value === undefined || value === null) return 0;
        const parsed =
          typeof value === "number"
            ? value
            : parseFloat(String(value).replace(/[^0-9.-]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const roundToTwo = (value: number) => Math.round(value * 100) / 100;

      const deriveOrderNumber = (): number => {
        const directNumberSources = [
          order.orderNumber,
          order.order_number,
          order.receiptNumber,
          order.receipt_number,
          order.ticketNumber,
          order.ticket_number,
        ];

        for (const source of directNumberSources) {
          const candidate = toNumber(source);
          if (candidate > 0) {
            return Math.trunc(candidate);
          }
        }

        const fromId = parseInt(
          String(order.id || "")
            .replace(/\D/g, "")
            .slice(-6),
          10
        );
        if (Number.isFinite(fromId)) {
          return fromId;
        }

        return parseInt(Date.now().toString().slice(-6), 10);
      };

      const total = toNumber(order.total);
      const reportedSubtotal = toNumber(order.subtotal ?? order.sub_total);
      const gstAmount = toNumber(
        order.gst ?? order.taxDetails?.gst ?? order.tax_breakdown?.gst
      );
      const pstAmount = toNumber(
        order.pst ?? order.taxDetails?.pst ?? order.tax_breakdown?.pst
      );
      const taxAmountBase = toNumber(
        order.tax ?? order.taxTotal ?? order.totalTax ?? order.tax_total
      );
      const taxAmount =
        gstAmount || pstAmount ? gstAmount + pstAmount : taxAmountBase;
      const subtotal =
        reportedSubtotal || (total ? Math.max(total - taxAmount, 0) : 0);

      const items = Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            name: item.name,
            quantity: toNumber(item.quantity) || 0,
            price: roundToTwo(toNumber(item.price)),
            customPizza: item.customPizza,
          }))
        : [];

      const printData: BrowserPrintPayload = {
        orderId: String(order.id),
        orderNumber: deriveOrderNumber(),
        items,
        subtotal: roundToTwo(subtotal),
        gst: roundToTwo(gstAmount),
        pst: roundToTwo(pstAmount),
        tax: roundToTwo(taxAmount),
        total: roundToTwo(total),
        paymentMethod: order.paymentMethod || "unknown",
        createdByName: order.createdByName || order.createdBy || undefined,
        notes: order.notes || undefined,
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
        loadReport();
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
    return <LoadingScreen message="Loading reports..." variant="dark" />;
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
              <span className="text-2xl">📊</span>
              <span className="hidden sm:inline">Sales Reports</span>
            </h1>

            <div className="flex gap-2">
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all duration-300"
              >
                <Download size={20} />
              </button>
              <button
                onClick={downloadDeletedOrders}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all duration-300"
                title="Download Deleted Orders"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Period Selector */}
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            {(["today", "week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  period === p
                    ? "bg-[#FF6B35] text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                }`}
              >
                <Calendar size={18} />
                {p === "today"
                  ? "Today"
                  : p === "week"
                  ? "This Week"
                  : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
              <div className="text-sm text-slate-600 font-medium mb-2">
                Total Sales
              </div>
              <div className="text-3xl font-bold text-[#FF6B35]">
                ${reportData?.totalSales?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
              <div className="text-sm text-slate-600 font-medium mb-2">
                Total Orders
              </div>
              <div className="text-3xl font-bold text-emerald-600">
                {reportData?.totalOrders || 0}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
              <div className="text-sm text-slate-600 font-medium mb-2">
                Average Order
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ${reportData?.avgOrder?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {reportData?.paymentMethods &&
            Object.keys(reportData.paymentMethods).length > 0 && (
              <div
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Payment Methods
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(reportData.paymentMethods).map(
                    ([method, data]: [string, any]) => (
                      <div
                        key={method}
                        className="bg-slate-100 rounded-xl p-4 border border-slate-200"
                      >
                        <div className="text-sm font-medium text-slate-600 capitalize mb-1">
                          {method}
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          ${data.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-500">
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
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Recent Orders
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {reportData.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">
                          Order #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#FF6B35]">
                            ${parseFloat(order.total).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            {order.paymentMethod}
                          </div>
                        </div>
                        <button
                          onClick={() => handleReprint(order)}
                          className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all shadow-md"
                          title="Reprint Receipt"
                        >
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => initiateDeleteOrder(order)}
                          className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all shadow-md"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-1 border-t border-slate-200 pt-3">
                        {order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-slate-900 font-medium">
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
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={22} className="text-[#FF6B35]" />
              Top Selling Items
            </h2>
            <div className="space-y-3">
              {(reportData?.topItems || [])
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center font-bold text-white shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.quantity} sold
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-[#FF6B35]">
                      ${item.revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Hourly Sales */}
          {reportData?.hourlySales && reportData.hourlySales.length > 0 && (
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Sales by Hour
              </h2>
              <div className="space-y-2">
                {reportData.hourlySales.map((hourData: any) => {
                  const maxSales = Math.max(
                    ...reportData.hourlySales.map((h: any) => h.sales)
                  );
                  const widthPercent =
                    maxSales > 0 ? (hourData.sales / maxSales) * 100 : 0;

                  return (
                    <div
                      key={hourData.hour}
                      className="flex items-center gap-4"
                    >
                      <div className="w-16 text-sm font-medium text-slate-600">
                        {hourData.hour}:00
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-[#FF6B35] h-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${Math.max(widthPercent, 5)}%` }}
                        >
                          {widthPercent > 15 && (
                            <span className="text-white text-xs font-bold">
                              ${hourData.sales.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-20 text-sm text-slate-600 text-right">
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

      {/* Delete Order Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Order?
              </h3>
              <p className="text-slate-600 mb-2">
                Order{" "}
                <strong className="text-slate-900">
                  #{selectedOrder.id.slice(0, 8)}
                </strong>{" "}
                - ${parseFloat(selectedOrder.total).toFixed(2)}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                This order will be marked as deleted but kept in the system for
                records.
              </p>

              <div className="mb-6 text-left">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Deletion *
                </label>
                <textarea
                  value={deleteNote}
                  onChange={(e) => setDeleteNote(e.target.value)}
                  placeholder="Please provide a reason (e.g., customer cancellation, wrong order, etc.)"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOrder(null);
                    setDeleteNote("");
                  }}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-md"
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
