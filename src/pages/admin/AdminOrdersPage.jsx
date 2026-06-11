import { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Eye, Trash2, CheckCircle, Download, Copy, Truck } from "lucide-react";
import * as XLSX from "xlsx";
import { ordersService } from "../../services/firebaseService";

function formatDate(value) {
  if (!value) return "-";
  const date = (() => {
    if (typeof value === "string" || value instanceof Date) return new Date(value);
    if (typeof value?.toDate === "function") return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    if (value?._seconds) return new Date(value._seconds * 1000);
    return null;
  })();
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function formatMoney(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function getAddressText(order) {
  if (order?.address) return order.address;
  const shipping = order?.shippingAddress;
  if (!shipping || typeof shipping !== "object") return "-";

  const parts = [
    shipping.addressLine1,
    shipping.addressLine2,
    shipping.area,
    shipping.city,
    shipping.state,
    shipping.pincode ? `Pincode: ${shipping.pincode}` : "",
    shipping.landmark ? `Landmark: ${shipping.landmark}` : "",
    shipping.altPhone ? `Alt phone: ${shipping.altPhone}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}

function getCustomerName(order) {
  const shipping = order?.shippingAddress;
  return String(
    order?.customerName ??
      order?.customer?.name ??
      order?.name ??
      shipping?.name ??
      shipping?.fullName ??
      "",
  ).trim();
}

function getCustomerPhone(order) {
  const shipping = order?.shippingAddress;
  const raw =
    order?.customerPhone ??
    order?.customer?.phone ??
    order?.phone ??
    order?.contact ??
    shipping?.phone ??
    shipping?.contact ??
    "";
  return raw != null ? String(raw).trim() : "";
}

function getCustomerAltPhone(order) {
  const shipping = order?.shippingAddress;
  const raw =
    order?.customerAltPhone ?? shipping?.altPhone ?? order?.customer?.altPhone ?? "";
  return raw != null ? String(raw).trim() : "";
}

function getAddressOnlyLines(order) {
  const shipping = order?.shippingAddress;
  if (shipping && typeof shipping === "object") {
    const cityState = [shipping.city, shipping.state].filter(Boolean).join(", ");
    return [
      shipping.addressLine1,
      shipping.addressLine2,
      shipping.area,
      cityState,
      shipping.pincode ? `Pincode: ${shipping.pincode}` : "",
      shipping.landmark ? `Landmark: ${shipping.landmark}` : "",
    ]
      .map((line) => String(line ?? "").trim())
      .filter(Boolean);
  }

  const flat = String(order?.address || "").trim();
  if (!flat) return [];
  return flat
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Name on top, address in the middle, phone on bottom — used for display and clipboard. */
function getDeliveryCopyLines(order) {
  const lines = [];

  const name = getCustomerName(order);
  if (name) lines.push(name);

  lines.push(...getAddressOnlyLines(order));

  const phone = getCustomerPhone(order);
  if (phone) lines.push(phone);

  const altPhone = getCustomerAltPhone(order);
  if (altPhone) lines.push(`Alternate phone: ${altPhone}`);

  return lines.length ? lines : ["-"];
}

function getAddressClipboardText(order) {
  return getDeliveryCopyLines(order).join("\n");
}

function getPlacedOnValue(order) {
  return (
    order?.createdAt ||
    order?.orderDate ||
    order?.placedAt ||
    order?.updatedAt ||
    null
  );
}

function parsePlacedDate(value) {
  if (!value) return null;
  const date = (() => {
    if (typeof value === "string" || value instanceof Date) return new Date(value);
    if (typeof value?.toDate === "function") return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    if (value?._seconds) return new Date(value._seconds * 1000);
    return null;
  })();
  if (!date || Number.isNaN(date.getTime())) return null;
  return date;
}

function summarizeLineItems(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (!items.length) return "";
  return items
    .map((item) => {
      const qty = Number(item?.qty ?? item?.quantity ?? 1);
      const name = String(item?.name ?? "Item").trim() || "Item";
      return `${name} × ${qty}`;
    })
    .join("; ");
}

function normalizeOrderStatus(order) {
  const normalized = String(order?.status ?? "paid").trim().toLowerCase();
  if (normalized === "cancelled") return "cancelled_waiting_refund";
  return normalized;
}

function startOfDayMs(isoDateStr) {
  const d = new Date(`${isoDateStr}T00:00:00`);
  return d.getTime();
}

function endOfDayMs(isoDateStr) {
  const d = new Date(`${isoDateStr}T23:59:59.999`);
  return d.getTime();
}

function passesExportDateFilter(order, fromIso, toIso) {
  if (!fromIso && !toIso) return true;
  const t = parsePlacedDate(getPlacedOnValue(order))?.getTime();
  if (t == null) return false;
  if (fromIso && t < startOfDayMs(fromIso)) return false;
  if (toIso && t > endOfDayMs(toIso)) return false;
  return true;
}

function passesExportStatusFilter(order, statusFilter) {
  if (statusFilter === "all") return true;
  return normalizeOrderStatus(order) === statusFilter;
}

function filterOrdersForExport(orders, { fromDate, toDate, statusFilter }) {
  return orders.filter(
    (o) =>
      passesExportDateFilter(o, fromDate, toDate) &&
      passesExportStatusFilter(o, statusFilter),
  );
}

function buildDailySummaryRows(orders) {
  const map = new Map();
  for (const order of orders) {
    const d = parsePlacedDate(getPlacedOnValue(order));
    const key = d ? d.toISOString().slice(0, 10) : "Unknown date";
    const prev = map.get(key) || { count: 0, total: 0 };
    const amt = Number(order?.total || 0);
    prev.count += 1;
    prev.total += Number.isFinite(amt) ? amt : 0;
    map.set(key, prev);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, { count, total }]) => ({
      Date: dateKey,
      "Order count": count,
      "Total (INR)": Math.round(total * 100) / 100,
    }));
}

function getStatusLabel(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "paid") return "Paid";
  if (normalized === "pending") return "Pending";
  if (normalized === "shipped") return "Shipped";
  if (normalized === "cancelled_waiting_refund") return "Cancelled (Waiting to be refunded)";
  if (normalized === "cancelled_refunded") return "Cancelled and Refunded";
  if (normalized === "cancelled") return "Cancelled (Waiting to be refunded)";
  return status || "Paid";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedAddressOrderId, setCopiedAddressOrderId] = useState("");
  const [trackingIdInput, setTrackingIdInput] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [exportFromDate, setExportFromDate] = useState("");
  const [exportToDate, setExportToDate] = useState("");
  const [exportStatus, setExportStatus] = useState("all");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await ordersService.getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus, trackingId) => {
    try {
      const payload = { status: newStatus };
      if (trackingId !== undefined) payload.trackingId = trackingId;
      await ordersService.updateOrderStatus(orderId, payload);
      const updated = orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, ...(trackingId !== undefined ? { trackingId } : {}) }
          : order,
      );
      setOrders(updated);
      setSelectedOrder(updated.find((o) => o.id === orderId) || null);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setSavingTracking(true);
    try {
      const tracking = trackingIdInput.trim();
      await ordersService.updateOrderStatus(selectedOrder.id, {
        status: selectedOrder.status || "shipped",
        trackingId: tracking,
      });
      const updated = orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, trackingId: tracking } : o,
      );
      setOrders(updated);
      setSelectedOrder({ ...selectedOrder, trackingId: tracking });
    } catch (error) {
      console.error("Error saving tracking ID:", error);
    } finally {
      setSavingTracking(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await ordersService.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleCopyAddress = async (order) => {
    if (!order) return;
    const text = getAddressClipboardText(order);
    if (!text || text === "-") return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedAddressOrderId(String(order?.id || ""));
      setTimeout(() => setCopiedAddressOrderId(""), 1800);
    } catch (error) {
      console.error("Failed to copy address:", error);
      window.alert("Could not copy address. Please copy manually.");
    }
  };

  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "cancelled_waiting_refund":
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "cancelled_refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const orderStats = orders.reduce(
    (acc, order) => {
      const status = String(order?.status || "").toLowerCase();
      const total = Number(order?.total || 0);
      acc.totalOrders += 1;
      acc.revenue += Number.isFinite(total) ? total : 0;
      if (status === "pending") acc.pending += 1;
      if (status === "paid") acc.paid += 1;
      return acc;
    },
    { totalOrders: 0, pending: 0, paid: 0, revenue: 0 },
  );

  const exportFilteredOrders = useMemo(
    () =>
      filterOrdersForExport(orders, {
        fromDate: exportFromDate,
        toDate: exportToDate,
        statusFilter: exportStatus,
      }),
    [orders, exportFromDate, exportToDate, exportStatus],
  );

  const handleExportExcel = useCallback(() => {
    if (exportFromDate && exportToDate && exportFromDate > exportToDate) {
      window.alert("From date cannot be after to date.");
      return;
    }
    if (!exportFilteredOrders.length) {
      window.alert("No orders match the selected export filters.");
      return;
    }

    const sorted = [...exportFilteredOrders].sort((a, b) => {
      const ta = parsePlacedDate(getPlacedOnValue(a))?.getTime() ?? 0;
      const tb = parsePlacedDate(getPlacedOnValue(b))?.getTime() ?? 0;
      return tb - ta;
    });

    const detailRows = sorted.map((order) => {
      const placed = parsePlacedDate(getPlacedOnValue(order));
      return {
        "Order ID": String(order.id ?? ""),
        "Order date": placed ? placed.toISOString().slice(0, 10) : "",
        "Placed on": placed ? placed.toLocaleString("en-IN") : "-",
        "Customer name": order.customerName || "",
        Email: order.customerEmail || "",
        Phone: order.customerPhone || "",
        "Alt phone": order.customerAltPhone || "",
        Address: getAddressText(order),
        Items: summarizeLineItems(order),
        "Total (INR)": Math.round(Number(order.total || 0) * 100) / 100,
        Status: getStatusLabel(order.status),
        "Payment ID": order.razorpay_payment_id || "",
      };
    });

    const summaryRows = buildDailySummaryRows(sorted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows), "Orders");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "By date");

    const slug = exportStatus === "all" ? "all" : exportStatus;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, `orders-export-${slug}-${stamp}.xlsx`);
  }, [exportFilteredOrders, exportStatus]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage customer orders and payment details
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">Total Orders</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {orderStats.totalOrders}
            </p>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-yellow-700">Pending</p>
            <p className="mt-2 text-2xl font-bold text-yellow-800">{orderStats.pending}</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-green-700">Paid</p>
            <p className="mt-2 text-2xl font-bold text-green-800">
              {orderStats.paid}
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-blue-700">Revenue</p>
            <p className="mt-2 text-2xl font-bold text-blue-800">
              ₹{formatMoney(orderStats.revenue)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Export to Excel</h2>
            <p className="mt-1 text-sm text-gray-500">
              Filter by order date and status, then download a spreadsheet. The file has an
              Orders sheet (one row per order) and a By date sheet (counts and totals per
              calendar day).
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                From date
              </label>
              <input
                type="date"
                value={exportFromDate}
                onChange={(e) => setExportFromDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                To date
              </label>
              <input
                type="date"
                value={exportToDate}
                onChange={(e) => setExportToDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div className="flex min-w-[180px] flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </label>
              <select
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              >
                <option value="all">All orders</option>
                <option value="pending">Pending only</option>
                <option value="paid">Paid only</option>
                <option value="shipped">Shipped only</option>
                <option value="cancelled_waiting_refund">
                  Cancelled (waiting to be refunded)
                </option>
                <option value="cancelled_refunded">Cancelled and refunded</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={loading || orders.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4 shrink-0" />
              Download .xlsx
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{exportFilteredOrders.length}</span>{" "}
            order{exportFilteredOrders.length === 1 ? "" : "s"} with current filters. Leave dates
            empty to include all dates.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        <div className="font-semibold text-gray-900">#{order.id}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.razorpay_payment_id
                            ? `Payment: ${order.razorpay_payment_id}`
                            : "Payment: -"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-gray-900 font-medium">
                          {order.customerName || "-"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {order.customerEmail || "-"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {order.customerPhone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{formatMoney(order.total)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(getPlacedOnValue(order))}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingIdInput(order.trackingId || "");
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-brand-navy to-brand-maroon text-white p-6 flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.id}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl font-bold hover:bg-white/20 rounded-lg p-2"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">CUSTOMER NAME</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.customerName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">EMAIL</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.customerEmail || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">PHONE</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.customerPhone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">ALT PHONE</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.customerAltPhone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">DATE</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(getPlacedOnValue(selectedOrder))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">PAYMENT ID</p>
                  <p className="text-sm font-bold text-gray-900 break-all">
                    {selectedOrder.razorpay_payment_id || "-"}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-500 font-semibold">
                    DELIVERY ADDRESS
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(selectedOrder)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedAddressOrderId === String(selectedOrder.id)
                      ? "Copied"
                      : "Copy name & address"}
                  </button>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  {getDeliveryCopyLines(selectedOrder).map((line, idx) => (
                    <p key={`${line}-${idx}`} className="text-gray-900 font-medium leading-6">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-semibold mb-3">
                  ORDER ITEMS
                </p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => {
                    const qty = Number(item.qty || item.quantity || 1);
                    const price = Number(item.price || 0);
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded border border-black/10 overflow-hidden bg-white">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">Qty: {qty}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          ₹{(price * qty).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">TOTAL:</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{formatMoney(selectedOrder.total)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <p className="font-semibold text-gray-900">Order Status</p>
                <select
                  value={normalizeOrderStatus(selectedOrder)}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled_waiting_refund">
                    Cancelled (waiting to be refunded)
                  </option>
                  <option value="cancelled_refunded">Cancelled and refunded</option>
                </select>
                <p className="text-xs text-gray-500">
                  The customer receives an email whenever you change status (paid, pending, shipped, cancelled waiting refund, cancelled and refunded).
                </p>
              </div>

              {/* ST Courier Tracking ID */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold text-blue-900">ST Courier Tracking ID</p>
                </div>
                {selectedOrder.trackingId && (
                  <p className="text-xs text-blue-700">
                    Current: <span className="font-bold">{selectedOrder.trackingId}</span>
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingIdInput}
                    onChange={(e) => setTrackingIdInput(e.target.value)}
                    placeholder="Enter AWB / Tracking number"
                    className="flex-1 rounded-lg border border-blue-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTracking}
                    disabled={savingTracking}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Truck className="h-4 w-4" />
                    {savingTracking ? "Saving…" : "Save"}
                  </button>
                </div>
                <p className="text-xs text-blue-600">
                  Customers can track their shipment from My Orders once this is set.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleStatusChange(
                      selectedOrder.id,
                      "shipped",
                      trackingIdInput.trim() || undefined,
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark Shipped
                </button>
                <button
                  onClick={() => handleDelete(selectedOrder.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold inline-flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Order
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
