import { ArrowLeft, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
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
      <section className="py-6 sm:py-8 lg:py-10">
        <Container className="max-w-6xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-brand-navy transition hover:bg-black/[0.03]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {product?.category ? (
              <span className="hidden rounded-full bg-black/[0.03] px-3 py-1 text-xs font-semibold text-brand-black/70 ring-1 ring-black/5 sm:inline-flex">
                {product.category}
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="py-12 text-center text-brand-black/60">Loading product...</div>
          ) : !product ? (
            <div className="py-12 text-center text-brand-black/60">Product not found.</div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(340px,420px),1fr] lg:items-start">
                <div className="lg:sticky lg:top-28">
                  <Card className="p-4 sm:p-6">
                    <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full min-h-[240px] w-full object-cover sm:min-h-[320px] lg:min-h-[360px]"
                        />
                      ) : (
                        <div className="grid min-h-[260px] place-items-center text-brand-black/45">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/5">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand-black/50">
                            Selling price
                          </p>
                          <p className="mt-1 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                            Rs. {selling.toFixed(2)}
                          </p>
                        </div>

                        {hasDiscount ? (
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-black/50">
                              MRP
                            </p>
                            <p className="mt-1 text-sm font-semibold text-brand-black/45 line-through">
                              Rs. {mrp.toFixed(2)}
                            </p>
                            <p className="mt-2 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                              {discountPct}% OFF
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <Button
                          disabled={Number(product.stock || 0) <= 0}
                          onClick={() =>
                            Number(product.stock || 0) > 0 && addToCart(product)
                          }
                          className="w-full"
                        >
                          {Number(product.stock || 0) > 0
                            ? "Add to Cart"
                            : "Out of stock"}
                        </Button>
                      </div>

                      <p className="mt-3 text-xs text-brand-black/55">
                        Stock: {product.stock ?? 0}
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="p-4 sm:p-6">
                    <p className="text-xs uppercase tracking-wide text-brand-purple">
                      {product.category || "Books"}
                    </p>
                    <h1 className="mt-2 text-xl font-bold leading-snug text-brand-navy sm:text-2xl lg:text-3xl">
                      {product.name}
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-brand-black/70 sm:text-[15px]">
                      {product.description}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <p className="text-xs font-semibold text-brand-black/60">
                          Ratings
                        </p>
                        <p className="mt-1 text-lg font-bold text-brand-navy">
                          {reviewStats.avg ? reviewStats.avg.toFixed(1) : "0.0"}{" "}
                          <span className="text-sm font-semibold text-brand-black/50">
                            / 5
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-brand-black/55">
                          {reviewStats.count} review
                          {reviewStats.count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <p className="text-xs font-semibold text-brand-black/60">
                          Category
                        </p>
                        <p className="mt-1 text-sm font-bold text-brand-navy">
                          {product.category || "Books"}
                        </p>
                        <p className="mt-1 text-xs text-brand-black/55">
                          Secure checkout via Razorpay
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-6">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-xl font-semibold text-brand-navy">
                        Ratings & Reviews
                      </h2>
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
                          <div key={r.id} className="rounded-xl border border-black/10 p-4">
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
                                <p className="text-xs text-brand-black/50">
                                  {formatDate(r.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-brand-black/80">
                              {r.review}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <form
                      onSubmit={submitReview}
                      className="mt-6 space-y-3 rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
                    >
                      <h3 className="text-lg font-semibold text-brand-navy">Write a review</h3>

                  {error ? (
                    <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
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
                      className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-navy sm:w-auto"
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
              </div>
            </div>
          )}
        </Container>
      </section>
    </PageLayout>
  );
}
