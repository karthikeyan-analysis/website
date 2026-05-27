import { Headset, ShieldCheck, SlidersHorizontal, Truck } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { useCart } from "../hooks/useCart";
import {
  categoriesService,
  productsService,
} from "../services/firebaseService";
import {
  STOCK_STATUS,
  getStockStatusLabel,
  isPurchasableStockStatus,
  normalizeStockStatus,
} from "../utils/stockStatus";

function productCoverImageUrl(product) {
  const listed = Array.isArray(product?.images)
    ? product.images.map((u) => String(u || "").trim()).filter(Boolean)
    : [];
  return listed[0] || product?.image || "";
}

const trustItems = [
  {
    title: "Secure Payment",
    desc: "All our payments are SSL secured.",
    icon: ShieldCheck,
  },
  {
    title: "Delivered With Care",
    desc: "Super fast shipping to your door.",
    icon: Truck,
  },
  {
    title: "Excellent Service",
    desc: "Live chat and phone support.",
    icon: Headset,
  },
];

export default function BookStorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productCategories, setProductCategories] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [data, firestoreCategories] = await Promise.all([
          productsService.getProducts(),
          categoriesService.getCategories().catch((err) => {
            console.error("Error loading categories:", err);
            return [];
          }),
        ]);
        setProducts(data);
        const fromFirestore = firestoreCategories
          .map((c) => String(c?.name || "").trim())
          .filter(Boolean);
        const fromProducts = [
          ...new Set(
            data
              .map((p) => String(p?.category || "").trim())
              .filter(Boolean),
          ),
        ];
        const merged = [
          ...new Set([...fromFirestore, ...fromProducts]),
        ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        setProductCategories(merged);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (item) => activeCategory === "All" || item.category === activeCategory,
      ),
    [activeCategory, products],
  );

  return (
    <PageLayout
      title="Book Store"
      subtitle="Latest syllabus-based and exam-focused books designed to support aspirants from foundation to final revision."
    >
      <section className="bg-gradient-to-b from-black/[0.02] to-white py-14">
        <Container className="grid gap-7 lg:grid-cols-[280px,1fr]">
          <aside className="h-fit lg:sticky lg:top-28">
            <Card color="purple" className="p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                <SlidersHorizontal className="h-4 w-4" /> Categories
              </p>
              <div className="mt-4 space-y-2">
                {["All", ...productCategories].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                      activeCategory === category
                        ? "bg-brand-navy text-white"
                        : "bg-black/[0.02] text-brand-black/80 hover:bg-black/[0.04]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </Card>
          </aside>

          <div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No products available in this category
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const coverSrc = productCoverImageUrl(product);
                  const stockStatus = normalizeStockStatus(
                    product.stockStatus,
                    product.stock,
                  );
                  const stockStatusLabel = getStockStatusLabel(stockStatus);
                  const canAddToCart = isPurchasableStockStatus(stockStatus);
                  const cartButtonLabel =
                    stockStatus === STOCK_STATUS.LAUNCHING_SOON
                      ? "Launching Soon"
                      : canAddToCart
                        ? "Add to Cart"
                        : "Out of Stock";
                  return (
                  <article
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/book-store/${product.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/book-store/${product.id}`);
                      }
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="mb-4 overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                      {coverSrc ? (
                        <div className="relative w-full aspect-[1279/1600] bg-white">
                          <img
                            src={coverSrc}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-contain object-center transition duration-300 group-hover:opacity-95"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[1279/1600] w-full items-center justify-center text-sm text-brand-black/45">
                          No image
                        </div>
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-wide text-brand-purple">
                      {product.category}
                    </p>
                    <h2 className="mt-2 line-clamp-3 text-base font-semibold text-brand-navy">
                      {product.name}
                    </h2>
                    <p className="mt-3 text-xs text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-4">
                      {(() => {
                        const selling = Number(product.price) || 0;
                        const mrp = Number(product.mrpPrice) || 0;
                        const hasDiscount = mrp > selling && selling > 0;
                        const discountPct = hasDiscount
                          ? Math.round(((mrp - selling) / mrp) * 100)
                          : 0;

                        return (
                          <div className="space-y-1">
                            <div className="flex items-end gap-2">
                              <p className="text-2xl font-bold text-brand-navy">
                                Rs. {selling.toFixed(2)}
                              </p>
                              {hasDiscount ? (
                                <p className="text-sm text-brand-black/45 line-through">
                                  Rs. {mrp.toFixed(2)}
                                </p>
                              ) : null}
                            </div>
                            {hasDiscount ? (
                              <p className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                {discountPct}% OFF
                              </p>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-navy/70">
                      Tap to view details
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-purple">
                      {stockStatusLabel}
                    </p>

                    <div className="mt-4">
                      <Button
                        type="button"
                        className="w-full"
                        disabled={!canAddToCart}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (canAddToCart) addToCart(product);
                        }}
                      >
                        {cartButtonLabel}
                      </Button>
                    </div>
                  </article>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="bg-white/60 py-16">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {trustItems.map((item) => (
              <Card key={item.title} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-navy text-brand-orange">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-brand-black/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
