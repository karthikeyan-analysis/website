import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../hooks/useCart";

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

function formatMoney(value) {
  const n = Number(value || 0);
  return n.toFixed(2);
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
  };

  return (
    <PageLayout title="My Wishlist" subtitle="Products you've saved for later">
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4">
          <AccountNav active="Wishlist" />

          {wishlistItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-slate-200" />
              <p className="mt-3 text-base font-semibold text-slate-500">Your wishlist is empty</p>
              <p className="mt-1 text-sm text-slate-400">
                Browse our book store and save items you love
              </p>
              <Link
                to="/book-store"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy/90"
              >
                <ShoppingCart className="h-4 w-4" />
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm"
                >
                  <Link to={`/book-store/${item.id}`} className="shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border border-black/[0.07] bg-slate-50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/book-store/${item.id}`}
                      className="block truncate text-sm font-bold text-brand-navy hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.category && (
                      <p className="mt-0.5 text-xs text-slate-400">{item.category}</p>
                    )}
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        ₹{formatMoney(item.price)}
                      </span>
                      {item.mrpPrice && item.mrpPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{formatMoney(item.mrpPrice)}
                        </span>
                      )}
                    </div>
                    {item.stockStatus && (
                      <p className={`mt-0.5 text-xs font-semibold ${
                        String(item.stockStatus).toLowerCase().includes("out") ? "text-red-500" : "text-green-600"
                      }`}>
                        {item.stockStatus}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-navy/90"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
