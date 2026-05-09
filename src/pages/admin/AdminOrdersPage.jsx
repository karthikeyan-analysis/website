import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Eye, Edit2, Trash2, CheckCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("adminOrders");
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      // Add sample data for demo
      const sampleOrders = [
        {
          id: 1001,
          customerName: "John Doe",
          email: "john@example.com",
          phone: "+91 98765 43210",
          items: [
            { name: "TNPSC Book", qty: 2, price: 500 },
            { name: "Study Material", qty: 1, price: 300 },
          ],
          total: 1300,
          status: "Pending",
          date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString(),
          address: "123 Main St, Chennai",
        },
        {
          id: 1002,
          customerName: "Jane Smith",
          email: "jane@example.com",
          phone: "+91 87654 32109",
          items: [{ name: "Online Course", qty: 1, price: 2000 }],
          total: 2000,
          status: "Completed",
          date: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString(),
          address: "456 Oak Ave, Bangalore",
        },
      ];
      localStorage.setItem("adminOrders", JSON.stringify(sampleOrders));
      setOrders(sampleOrders);
    }
  }, []);

  const saveOrders = (updatedOrders) => {
    localStorage.setItem("adminOrders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order,
    );
    saveOrders(updated);
    setSelectedOrder(updated.find((o) => o.id === orderId));
  };

  const handleDelete = (orderId) => {
    if (confirm("Are you sure you want to delete this order?")) {
      saveOrders(orders.filter((o) => o.id !== orderId));
      setShowModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage customer orders and track shipments
          </p>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {orders.length === 0 ? (
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
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-gray-900 font-medium">
                          {order.customerName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {order.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.date}
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

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
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
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">
                    CUSTOMER NAME
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">EMAIL</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">PHONE</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">DATE</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.date}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">
                  DELIVERY ADDRESS
                </p>
                <p className="text-gray-900 font-medium">
                  {selectedOrder.address}
                </p>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-3">
                  ORDER ITEMS
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <p className="font-bold text-gray-900">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">TOTAL:</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{selectedOrder.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Status Management */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <p className="font-semibold text-gray-900">Order Status</p>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleStatusChange(
                      selectedOrder.id,
                      selectedOrder.status === "Pending"
                        ? "Completed"
                        : selectedOrder.status,
                    );
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark Complete
                </button>
                <button
                  onClick={() => handleDelete(selectedOrder.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold"
                >
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
