import { Search } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ShipmentTracker from "../components/tracking/ShipmentTracker";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { ordersService } from "../services/firebaseService";

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
  if (normalized === "paid") return "Paid";
  if (normalized === "pending") return "Pending";
  if (normalized === "dispatched") return "Dispatched";
  if (normalized === "shipped") return "Shipped";
  if (normalized === "cancelled_waiting_refund") return "Cancelled (Waiting to be refunded)";
  if (normalized === "cancelled_refunded") return "Cancelled and Refunded";
  if (normalized === "cancelled") return "Cancelled (Waiting to be refunded)";
  return status || "Paid";
}

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    const id = String(orderId || "").trim();
    if (!id) {
      setError("Please enter your Order ID.");
      setOrder(null);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await ordersService.getOrderById(id);
      if (!data) {
        setOrder(null);
        setError("Order not found. Please check the Order ID.");
        return;
      }
      setOrder(data);
    } catch (err) {
      console.error("Error tracking order:", err);
      setOrder(null);
      setError(err.message || "Unable to track order right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Track Order"
      subtitle="Enter your Order ID to check latest order status."
    >
      <section className="py-10">
        <Container className="max-w-3xl">
          <Card className="p-5 sm:p-8">
            <form onSubmit={handleTrack} className="space-y-3">
              <label className="block text-sm font-semibold text-brand-navy">
                Order ID
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Example: KA-1715248500000"
                  className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-navy"
                />
                <Button type="submit" className="sm:min-w-[140px]">
                  <Search className="h-4 w-4" />
                  Track
                </Button>
              </div>
            </form>

            {loading ? (
              <p className="mt-5 text-sm text-brand-black/60">Checking order...</p>
            ) : null}
            {error ? (
              <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {order ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-black/55">
                    Order ID
                  </p>
                  <p className="mt-1 text-base font-bold text-brand-navy">{order.id}</p>
                </div>


                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/10 p-4">
                    <p className="text-xs font-semibold text-brand-black/60">Status</p>
                    <p className="mt-1 text-lg font-bold text-brand-navy">
                      {getStatusLabel(order.status)}
                    </p>
                    {["paid", "dispatched"].includes(String(order.status || "").toLowerCase()) && (
                      <p className="mt-2 text-xs text-brand-black/60 leading-relaxed">
                        You will receive your tracking updates when your package has been shipped from the courier partner.
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-black/10 p-4">
                    <p className="text-xs font-semibold text-brand-black/60">Total</p>
                    <p className="mt-1 text-lg font-bold text-brand-navy">
                      Rs. {formatMoney(order.total)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-black/10 p-4">
                    <p className="text-xs font-semibold text-brand-black/60">Customer</p>
                    <p className="mt-1 text-sm font-semibold text-brand-black">
                      {order.customerName || "-"}
                    </p>
                    <p className="text-sm text-brand-black/70">
                      {order.customerEmail || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-black/10 p-4">
                    <p className="text-xs font-semibold text-brand-black/60">Placed On</p>
                    <p className="mt-1 text-sm font-semibold text-brand-black">
                      {formatDate(getPlacedOnValue(order))}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-xs font-semibold text-brand-black/60">
                    Delivery Address
                  </p>
                  <p className="mt-1 text-sm text-brand-black/80">
                    {order.address || "Address not available"}
                  </p>
                </div>

                {order.trackingId && (
                  <div>
                    <p className="mb-3 text-sm font-bold text-brand-navy">
                      Live Shipment Tracking (ST Courier)
                    </p>
                    <ShipmentTracker awb={order.trackingId} />
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-6 text-sm text-brand-black/65">
              Need help?{" "}
              <Link to="/contact" className="font-semibold text-brand-navy underline">
                Contact support
              </Link>
              .
            </div>
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
