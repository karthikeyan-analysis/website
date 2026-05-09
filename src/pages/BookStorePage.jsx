import {
  BadgeCheck,
  Headset,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import { useCart } from "../hooks/useCart";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import { productsService } from "../services/firebaseService";

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
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getProducts();
        setProducts(data);
        // Extract unique categories
        const categories = [...new Set(data.map((p) => p.category))];
        setProductCategories(categories);
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
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-brand-navy p-4 text-white shadow-soft">
                <p className="text-xs uppercase tracking-wide text-brand-orange">
                  Secure Payment
                </p>
                <p className="mt-1 text-sm">All payments are SSL secured</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-brand-navy ring-1 ring-black/10">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
                  <Truck className="h-4 w-4" /> Delivered with care
                </p>
                <p className="mt-1 text-sm">Super fast shipping to your door</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-brand-navy ring-1 ring-black/10">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
                  <BadgeCheck className="h-4 w-4" /> Trusted Coaching
                </p>
                <p className="mt-1 text-sm">Results-driven mentorship</p>
              </div>
            </div>

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
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                  >
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
                      <p className="text-2xl font-bold text-brand-navy">
                        Rs. {parseFloat(product.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {product.stock}
                      </p>
                    </div>
                    <Button
                      disabled={product.stock <= 0}
                      onClick={() => product.stock > 0 && addToCart(product)}
                      className="mt-5 w-full"
                    >
                      {product.stock > 0 ? "Quick Add" : "Out of stock"}
                    </Button>
                    <p className="mt-3 flex items-center gap-1 text-xs text-brand-sky">
                      <ShieldCheck className="h-4 w-4" /> SSL Secured
                    </p>
                  </article>
                ))}
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
