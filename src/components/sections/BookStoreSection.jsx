import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "../../data/products";
import { useCart } from "../../hooks/useCart";

const homeProducts = products.slice(0, 2);

export default function BookStoreSection() {
  const { addToCart } = useCart();

  return (
    <section id="bookstore" className="bg-white py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 lg:grid-cols-[260px,1fr]">
        <aside className="self-start rounded-xl border border-black/10 bg-white p-5">
          <h3 className="font-semibold text-brand-navy">Categories</h3>
          <ul className="mt-4 space-y-2 text-sm text-brand-black/70">
            <li>
              <a href="#" className="hover:text-brand-navy">
                PYQ Banks
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-navy">
                Syllabus Guides
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-navy">
                Uncategorized
              </a>
            </li>
          </ul>
        </aside>

        <div>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-extrabold text-3xl text-brand-navy md:text-4xl">
              Book Store
            </h2>
            <Link
              to="/book-store"
              className="text-sm font-semibold text-brand-navy underline underline-offset-4"
            >
              View all products
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {homeProducts.map((product) => (
              <article
                key={product.id}
                className="relative rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="absolute left-4 top-4 rounded-full bg-brand-orange px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Sale!
                </span>
                <p className="mt-8 text-xs uppercase tracking-wider text-brand-purple">
                  {product.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-brand-navy">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-2xl font-bold text-brand-navy">
                    Rs. {product.price}
                  </span>
                  <span className="text-sm text-brand-black/45 line-through">
                    Rs. {product.oldPrice}
                  </span>
                </div>
                <div className="sticky bottom-3 mt-5 space-y-2">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light"
                  >
                    Quick Add
                  </button>
                  <p className="flex items-center justify-center gap-1 text-xs text-brand-sky">
                    <ShieldCheck className="h-4 w-4" /> SSL Secured Checkout
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
