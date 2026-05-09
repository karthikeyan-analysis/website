import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { useCart } from "../hooks/useCart";
import { productsService } from "../services/firebaseService";

function formatDate(value) {
  if (!value) return "";
  try {
    const date =
      typeof value === "string" || value instanceof Date
        ? new Date(value)
        : value?._seconds
          ? new Date(value._seconds * 1000)
          : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingReview, setSavingReview] = useState(false);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    review: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const [productData, reviewRows] = await Promise.all([
          productsService.getProductById(id),
          productsService.getProductReviews(id),
        ]);
        setProduct(productData);
        setReviews(Array.isArray(reviewRows) ? reviewRows : []);
      } catch (e) {
        console.error("Error loading product details:", e);
        setError(e.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const reviewStats = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 };
    const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    return { avg: total / reviews.length, count: reviews.length };
  }, [reviews]);

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      productId: id,
      productName: product?.name || "",
      name: reviewForm.name.trim(),
      email: reviewForm.email.trim(),
      rating: Number(reviewForm.rating),
      review: reviewForm.review.trim(),
    };

    if (!payload.name || !payload.email || !payload.review) {
      setError("Please fill name, email and review.");
      return;
    }

    setSavingReview(true);
    try {
      const saved = await productsService.addProductReview(payload);
      setReviews((prev) => [saved, ...prev]);
      setReviewForm((prev) => ({ ...prev, review: "", rating: 5 }));
    } catch (e2) {
      console.error("Error submitting review:", e2);
      setError(e2.message || "Failed to submit review");
    } finally {
      setSavingReview(false);
    }
  };

  const selling = Number(product?.price) || 0;
  const mrp = Number(product?.mrpPrice) || 0;
  const hasDiscount = mrp > selling && selling > 0;
  const discountPct = hasDiscount ? Math.round(((mrp - selling) / mrp) * 100) : 0;

  return (
    <PageLayout
      title={product?.name || "Product Details"}
      subtitle="View complete book details and ratings from learners."
    >
      <section className="py-10">
        <Container>
          {loading ? (
            <div className="py-12 text-center text-brand-black/60">Loading product...</div>
          ) : !product ? (
            <div className="py-12 text-center text-brand-black/60">Product not found.</div>
          ) : (
            <div className="space-y-8">
              <Card className="grid gap-6 p-5 md:grid-cols-[360px,1fr]">
                <div className="overflow-hidden rounded-xl border border-black/10 bg-black/[0.02]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full min-h-[260px] w-full object-cover"
                    />
                  ) : (
                    <div className="grid min-h-[260px] place-items-center text-brand-black/45">
                      No image
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-purple">
                    {product.category || "Books"}
                  </p>
                  <h1 className="mt-2 text-2xl font-bold text-brand-navy">{product.name}</h1>
                  <p className="mt-3 text-sm text-brand-black/70">{product.description}</p>

                  <div className="mt-5 flex items-end gap-3">
                    <p className="text-3xl font-bold text-brand-navy">Rs. {selling.toFixed(2)}</p>
                    {hasDiscount ? (
                      <>
                        <p className="text-base text-brand-black/45 line-through">
                          Rs. {mrp.toFixed(2)}
                        </p>
                        <p className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          {discountPct}% OFF
                        </p>
                      </>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm text-brand-black/60">
                    Stock available: {product.stock ?? 0}
                  </p>

                  <div className="mt-5">
                    <Button
                      disabled={Number(product.stock || 0) <= 0}
                      onClick={() => Number(product.stock || 0) > 0 && addToCart(product)}
                    >
                      {Number(product.stock || 0) > 0 ? "Add to Cart" : "Out of stock"}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-brand-navy">Ratings & Reviews</h2>
                  <p className="text-sm text-brand-black/70">
                    {reviewStats.count} review{reviewStats.count === 1 ? "" : "s"} •{" "}
                    {reviewStats.avg ? reviewStats.avg.toFixed(1) : "0.0"} / 5
                  </p>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-brand-black/60">
                      No reviews yet. Be the first to review this product.
                    </p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="rounded-lg border border-black/10 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-brand-black">{r.name}</p>
                            <p className="text-xs text-brand-black/60">{r.email}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`h-4 w-4 ${
                                    idx < Number(r.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-brand-black/50">{formatDate(r.createdAt)}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-brand-black/80">{r.review}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={submitReview} className="mt-6 space-y-3 rounded-lg border border-black/10 p-4">
                  <h3 className="text-lg font-semibold text-brand-navy">Write a review</h3>

                  {error ? (
                    <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                  ) : null}

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-navy"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-navy"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-brand-black/70">Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))
                      }
                      className="rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-navy"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} Star{n === 1 ? "" : "s"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Write your review"
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm((p) => ({ ...p, review: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-navy"
                  />

                  <Button type="submit" disabled={savingReview}>
                    {savingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </Container>
      </section>
    </PageLayout>
  );
}
