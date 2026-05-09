import { CheckCircle2, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { ordersService } from "../services/firebaseService";

function formatMoney(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

export default function OrderPlacedPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await ordersService.getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error("Error loading order details:", error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const copyOrderId = async () => {
    if (!order?.id) return;
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <PageLayout
      title="Order Placed"
      subtitle="Your payment is successful and your order has been placed."
    >
      <section className="py-10">
        <Container className="max-w-3xl">
          <Card className="p-5 sm:p-8">
            {loading ? (
              <p className="text-center text-brand-black/60">Loading order details...</p>
            ) : !order ? (
              <div className="text-center">
                <p className="text-brand-black/60">
                  We could not load this order right now.
                </p>
                <Link to="/book-store" className="mt-4 inline-block text-brand-navy underline">
                  Go back to shop
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
                  <h2 className="mt-3 text-2xl font-bold text-brand-navy">
                    Order Confirmed
                  </h2>
                  <p className="mt-1 text-sm text-brand-black/65">
                    Thank you! Your order has been placed successfully.
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-black/55">
                    Order ID
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base font-bold text-brand-navy">{order.id}</p>
                    <button
                      type="button"
                      onClick={copyOrderId}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-black/[0.03]"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy ID"}
                    </button>
                  </div>
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                    Please copy and store this Order ID safely. You can use it to track your order on our website.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/10 p-4">
                    <p className="text-xs font-semibold text-brand-black/60">
                      Customer
                    </p>
                    <p className="mt-1 text-sm font-semibold text-brand-black">
                      {order.customerName}
                    </p>
                    <p className="text-sm text-brand-black/70">{order.customerEmail}</p>
                    <p className="text-sm text-brand-black/70">{order.customerPhone}</p>
                  </div>
                  <div className="rounded-xl border border-black/10 p-4">
                    <p className="text-xs font-semibold text-brand-black/60">
                      Total Paid
                    </p>
                    <p className="mt-1 text-2xl font-bold text-brand-navy">
                      Rs. {formatMoney(order.total)}
                    </p>
                    <p className="text-xs text-brand-black/55">
                      Status: {order.status || "Paid"}
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

                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-xs font-semibold text-brand-black/60">Items</p>
                  <div className="mt-3 space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={`${item?.id || item?.name || "item"}-${idx}`}
                        className="flex items-center justify-between rounded-lg bg-black/[0.02] px-3 py-2"
                      >
                        <p className="text-sm text-brand-black">
                          {item.name} x {item.qty || item.quantity || 1}
                        </p>
                        <p className="text-sm font-semibold text-brand-navy">
                          Rs. {formatMoney(Number(item.price || 0) * Number(item.qty || item.quantity || 1))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to={`/track-order?id=${encodeURIComponent(order.id)}`}>
                    <Button type="button" variant="secondary">
                      Track This Order
                    </Button>
                  </Link>
                  <Link to="/book-store">
                    <Button type="button">Continue Shopping</Button>
                  </Link>
                  <Link to="/">
                    <Button type="button" variant="secondary">
                      Go Home
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </Container>
      </section>
    </PageLayout>
  );
}
