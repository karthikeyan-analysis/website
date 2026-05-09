import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Eye, Trash2, CheckCircle } from "lucide-react";
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

function getPlacedOnValue(order) {
  return (
    order?.createdAt ||
    order?.orderDate ||
    order?.placedAt ||
    order?.updatedAt ||
    null
  );
}

function getStatusLabel(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "completed") return "Delivered";
  if (normalized === "paid") return "Paid";
  if (normalized === "pending") return "Pending";
  if (normalized === "shipped") return "Shipped";
  if (normalized === "delivered") return "Delivered";
  if (normalized === "cancelled") return "Cancelled";
  return status || "Paid";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, { status: newStatus });
      const updated = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      );
      setOrders(updated);
      setSelectedOrder(updated.find((o) => o.id === orderId) || null);
    } catch (error) {
      console.error("Error updating order status:", error);
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

  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "completed":
      case "paid":
      case "delivered":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
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
      if (status === "completed" || status === "delivered") acc.completed += 1;
      return acc;
    },
    { totalOrders: 0, pending: 0, completed: 0, revenue: 0 },
  );

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
            <p className="text-xs font-semibold uppercase text-green-700">Completed</p>
            <p className="mt-2 text-2xl font-bold text-green-800">
              {orderStats.completed}
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-blue-700">Revenue</p>
            <p className="mt-2 text-2xl font-bold text-blue-800">
              ₹{formatMoney(orderStats.revenue)}
            </p>
          </div>
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
                <p className="text-sm text-gray-500 font-semibold mb-2">
                  DELIVERY ADDRESS
                </p>
                <p className="text-gray-900 font-medium">
                  {getAddressText(selectedOrder)}
                </p>
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
                  value={selectedOrder.status || "Paid"}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed (Legacy)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <p className="text-xs text-gray-500">
                  Customer gets an email for every status change.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleStatusChange(
                      selectedOrder.id,
                      selectedOrder.status === "Pending" ? "Delivered" : "Delivered",
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark Delivered
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
