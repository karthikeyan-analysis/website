import { ChevronDown, ChevronUp, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ShipmentTracker from "../components/tracking/ShipmentTracker";
import { useUserAuth } from "../contexts/UserAuthContext";
import { userService } from "../services/userService";

function AccountNav({ active }) {
  const links = [
    { to: "/profile", label: "Profile" },
    { to: "/my-orders", label: "My Orders" },
    { to: "/addresses", label: "Addresses" },
    { to: "/wishlist", label: "Wishlist" },
  ];
  return (
    <nav className="flex flex-wrap gap-2 border-b border-black/[0.07] pb-4 mb-6">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            active === label
              ? "bg-brand-navy text-white"
              : "bg-black/[0.04] text-slate-600 hover:bg-black/[0.08]"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const d = (() => {
    if (typeof value === "string" || value instanceof Date) return new Date(value);
    if (typeof value?.toDate === "function") return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    return null;
  })();
  if (!d || isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(v) {
  return Number(v || 0).toFixed(2);
}

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  cancelled_waiting_refund: "bg-red-100 text-red-700",
  cancelled_refunded: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
};

function getStatusLabel(status) {
  const n = String(status || "").toLowerCase();
  if (n === "paid") return "Paid";
  if (n === "pending") return "Pending";
  if (n === "shipped") return "Shipped";
  if (n === "cancelled_waiting_refund" || n === "cancelled") return "Cancelled";
  if (n === "cancelled_refunded") return "Refunded";
  return status || "Paid";
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const statusKey = String(order.status || "paid").toLowerCase();

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex cursor-pointer items-start justify-between gap-4 p-5"
        onClick={() => setExpanded((p) => !p)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((p) => !p)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Order #{order.id}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[statusKey] || "bg-slate-100 text-slate-600"}`}>
              {getStatusLabel(order.status)}
            </span>
            {order.trackingId && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <Truck className="h-3 w-3" />
                Tracking available
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">{formatDate(order.createdAt)}</p>
          <p className="mt-0.5 text-sm font-bold text-slate-800">₹{formatMoney(order.total)}</p>
        </div>
        <div className="shrink-0 text-slate-400">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-black/[0.06] px-5 pb-5 pt-4 space-y-4">
          {/* Items */}
          <div className="space-y-2">
            {(order.items || []).map((item, i) => {
              const qty = Number(item.qty || item.quantity || 1);
              const price = Number(item.price || 0);
              return (
                <div key={i} className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg border border-black/[0.07] object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty: {qty} × ₹{formatMoney(price)}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-700">₹{formatMoney(qty * price)}</p>
                </div>
              );
            })}
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery Address</p>
              <p className="text-sm text-slate-600">{order.address}</p>
            </div>
          )}

          {/* Tracking ID + Tracker */}
          {order.trackingId && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ST Courier Tracking</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-700">AWB: {order.trackingId}</p>
                </div>
                <button
                  onClick={() => setShowTracking((p) => !p)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  <Truck className="h-3.5 w-3.5" />
                  {showTracking ? "Hide" : "Track Shipment"}
                </button>
              </div>
              {showTracking && (
                <div className="mt-3">
                  <ShipmentTracker awb={order.trackingId} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  const { user } = useUserAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    userService
      .getOrdersByEmail(user.email)
      .then((data) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <PageLayout title="My Orders" subtitle="View your purchase history and track shipments">
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4">
          <AccountNav active="My Orders" />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-200" />
              <p className="mt-3 text-base font-semibold text-slate-500">No orders yet</p>
              <p className="mt-1 text-sm text-slate-400">
                When you place orders, they&apos;ll appear here.
              </p>
              <Link
                to="/book-store"
                className="mt-5 inline-flex rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy/90"
              >
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
