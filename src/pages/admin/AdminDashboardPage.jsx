import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Package,
  ShoppingCart,
  Mail,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  productsService,
  contactsService,
  ordersService,
} from "../../services/firebaseService";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalMessages: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, orders, contacts] = await Promise.all([
          productsService.getProducts(),
          ordersService.getOrders(),
          contactsService.getContacts(),
        ]);

        const revenue = orders.reduce(
          (sum, order) => sum + (order.total || 0),
          0,
        );

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalMessages: contacts.length,
          revenue: revenue.toFixed(2),
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div
      className="bg-white rounded-xl shadow-md p-6 space-y-3 border-l-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className="h-12 w-12 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's your store overview
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Package}
                label="Total Products"
                value={stats.totalProducts}
                color="#8B5CF6"
              />
              <StatCard
                icon={ShoppingCart}
                label="Total Orders"
                value={stats.totalOrders}
                color="#3B82F6"
              />
              <StatCard
                icon={Mail}
                label="Messages"
                value={stats.totalMessages}
                color="#10B981"
              />
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={`₹${stats.revenue}`}
                color="#F59E0B"
              />
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-brand-navy via-brand-maroon to-brand-sky rounded-xl shadow-lg p-8 text-white space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Welcome to Admin Panel</h2>
              </div>
              <p className="text-white/90">
                Manage your products, orders, and customer messages all in one
                place. Use the navigation menu to access different sections of
                your admin panel.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="/admin/products"
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-purple-500"
              >
                <Package className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900">
                  Manage Products
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Add, edit, or delete products from your store
                </p>
              </a>

              <a
                href="/admin/orders"
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-blue-500"
              >
                <ShoppingCart className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900">View Orders</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Check order details and update statuses
                </p>
              </a>

              <a
                href="/admin/contacts"
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-green-500"
              >
                <Mail className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900">
                  Contact Messages
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  View and respond to customer inquiries
                </p>
              </a>

              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent">
                <TrendingUp className="h-8 w-8 text-amber-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900">System Info</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
