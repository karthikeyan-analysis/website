import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CartDrawer from "./components/ecommerce/CartDrawer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingButtons from "./components/FloatingButtons";
import { CartProvider } from "./hooks/useCart";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ProtectedAdminRoute } from "./components/admin/ProtectedAdminRoute";

const HERO_CAROUSEL_IMAGES = [
  "/hero_carousal/14.png",
  "/hero_carousal/13.png",
  "/hero_carousal/12.png",
  "/hero_carousal/11.png",
  "/hero_carousal/10.png",
  "/hero_carousal/9.png",
  "/hero_carousal/6.png",
  "/hero_carousal/5.png",
  "/hero_carousal/4.png",
  "/hero_carousal/3.png",
  "/hero_carousal/2.png",
  "/hero_carousal/1.png",
];

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const GroupIPage = lazy(() => import("./pages/GroupIPage"));
const GroupIIPage = lazy(() => import("./pages/GroupIIPage"));
const GroupPage = lazy(() => import("./pages/GroupCoursesPage"));
const StatisticalPage = lazy(() => import("./pages/StatisticalServicesPage"));
const TrbPage = lazy(() => import("./pages/TrbCoursesPage"));
const TrbUGPage = lazy(() => import("./pages/TrbUGPage"));
const TrbPGPage = lazy(() => import("./pages/TrbPGPage"));
const BatchesPage = lazy(() => import("./pages/BatchesPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BookStorePage = lazy(() => import("./pages/BookStorePage"));

// Policy Pages
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsConditionsPage = lazy(() => import("./pages/TermsConditionsPage"));
const RefundPolicyPage = lazy(() => import("./pages/RefundPolicyPage"));
const ShippingPolicyPage = lazy(() => import("./pages/ShippingPolicyPage"));

// Admin Pages
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminCategoriesPage = lazy(
  () => import("./pages/admin/AdminCategoriesPage"),
);
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminContactsPage = lazy(() => import("./pages/admin/AdminContactsPage"));
const AdminTestimonialsPage = lazy(
  () => import("./pages/admin/AdminTestimonialsPage"),
);
const AdminOfferBannerPage = lazy(
  () => import("./pages/admin/AdminOfferBannerPage"),
);

function App() {
  useEffect(() => {
    HERO_CAROUSEL_IMAGES.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return (
    <AdminAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense
            fallback={
              <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 bg-slate-50 px-4">
                <div
                  className="h-10 w-10 animate-spin rounded-full border-2 border-brand-navy border-t-transparent"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold tracking-tight text-brand-navy">
                  Loading…
                </p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/group-i" element={<GroupIPage />} />
              <Route path="/group-ii" element={<GroupIIPage />} />
              <Route path="/group-i-ii" element={<GroupPage />} />
              <Route
                path="/statistical-services"
                element={<StatisticalPage />}
              />
              <Route path="/trb-courses" element={<TrbPage />} />
              <Route path="/trb-ug" element={<TrbUGPage />} />
              <Route path="/trb-pg" element={<TrbPGPage />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/book-store" element={<BookStorePage />} />

              {/* Policy Routes */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route
                path="/terms-conditions"
                element={<TermsConditionsPage />}
              />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicyPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedAdminRoute>
                    <AdminCategoriesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedAdminRoute>
                    <AdminProductsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedAdminRoute>
                    <AdminOrdersPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/contacts"
                element={
                  <ProtectedAdminRoute>
                    <AdminContactsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/testimonials"
                element={
                  <ProtectedAdminRoute>
                    <AdminTestimonialsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/offer-banner"
                element={
                  <ProtectedAdminRoute>
                    <AdminOfferBannerPage />
                  </ProtectedAdminRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <CartDrawer />
            <FloatingButtons />
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AdminAuthProvider>
  );
}

export default App;
