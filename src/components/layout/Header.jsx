import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Home,
  Info,
  Mail,
  Menu as MenuIcon,
  Phone,
  ShoppingBag,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import Container from "../ui/Container";
import OfferBanner from "./OfferBanner";

const navTriggerClass =
  "flex w-max items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white/90 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cta lg:px-3 lg:py-1.5 lg:text-[13px]";

/** Hover-controlled nav dropdown; high z-index so panels paint above the white header below. */
function HoverNavDropdown({ menuId, label, items }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div
      className="relative z-[200]"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        id={`${menuId}-trigger`}
        type="button"
        className={navTriggerClass}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={`${menuId}-panel`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {/* pt-2 bridges hover gap between trigger and panel (reduces accidental close) */}
      <div
        id={`${menuId}-panel`}
        role="menu"
        aria-labelledby={`${menuId}-trigger`}
        className={`absolute left-0 top-full z-[250] pt-2 transition duration-150 ${
          open ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      >
        <div className="w-[13.5rem] overflow-hidden rounded-xl bg-brand-cta/95 p-1 shadow-soft backdrop-blur">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              className="block rounded-lg px-3 py-2 text-left text-xs font-semibold tracking-tight text-white/95 outline-none transition hover:bg-white/12 hover:text-white focus-visible:bg-white/12 lg:text-[13px]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hideOfferOnScrollDown = useScrollDirection(40);

  // Hide floating buttons while the drawer is open
  useEffect(() => {
    document.body.classList.toggle("drawer-open", mobileOpen);
    return () => document.body.classList.remove("drawer-open");
  }, [mobileOpen]);
  const location = useLocation();
  const isStorePage = location.pathname.startsWith("/book-store");
  const { itemCount, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 isolate bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      {/* Offer scroller at very top */}
      <div
        className={`relative z-50 overflow-hidden bg-slate-100 transition-[max-height,opacity] duration-300 ease-out ${
          hideOfferOnScrollDown ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <OfferBanner />
      </div>

      {/* Top nav (links + login/shop) */}
      <nav className="relative z-50 hidden bg-brand-cta text-white lg:block">
        <Container className="py-2">
          <div className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-md px-2.5 py-1.5 text-xs font-semibold transition lg:px-3 lg:text-[13px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `rounded-md px-2.5 py-1.5 text-xs font-semibold transition lg:px-3 lg:text-[13px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              About
            </NavLink>
            <HoverNavDropdown
              menuId="nav-courses-group"
              label="Group I & II"
              items={[
                { to: "/group-i", label: "Group I" },
                { to: "/group-ii", label: "Group II and II A" },
              ]}
            />
            <NavLink
              to="/statistical-services"
              className={({ isActive }) =>
                `rounded-md px-2.5 py-1.5 text-xs font-semibold transition lg:px-3 lg:text-[13px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Statistical Services
            </NavLink>
            <HoverNavDropdown
              menuId="nav-trb"
              label="TRB Courses"
              items={[
                { to: "/trb-ug", label: "UG TRB Exam" },
                { to: "/trb-pg", label: "PG TRB Exam" },
              ]}
            />
            <NavLink
              to="/batches"
              className={({ isActive }) =>
                `rounded-md px-2.5 py-1.5 text-xs font-semibold transition lg:px-3 lg:text-[13px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Batches
            </NavLink>
            <NavLink
              to="/achievements"
              className={({ isActive }) =>
                `rounded-md px-2.5 py-1.5 text-xs font-semibold transition lg:px-3 lg:text-[13px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Achievements
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `rounded-md px-2.5 py-1.5 text-xs font-semibold transition lg:px-3 lg:text-[13px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Contact
            </NavLink>

            <div className="ml-1 flex items-center gap-1">
              <a
                href="https://karthikeyananalysisstudycircle.vercel.app/login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 touch-manipulation items-center justify-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cta"
              >
                Student login
                <ExternalLink className="size-3.5 shrink-0 opacity-90" aria-hidden />
              </a>
              <Link
                to="/book-store"
                className="inline-flex min-h-9 touch-manipulation items-center justify-center gap-1.5 rounded-md bg-brand-purple px-3 py-1.5 text-xs font-bold text-white ring-1 ring-brand-purple/60 transition animate-blink hover:bg-brand-purple/90"
                title="Book shop"
              >
                <ShoppingBag className="size-4 shrink-0" aria-hidden />
                Shop
              </Link>
              {isStorePage ? (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="relative inline-flex min-h-9 touch-manipulation items-center justify-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-brand-navy shadow-sm ring-1 ring-brand-navy/15 transition hover:bg-brand-navy/[0.06]"
                  aria-label="Open cart"
                >
                  Cart
                  {itemCount > 0 ? (
                    <span className="flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-maroon px-1 text-[10px] font-bold leading-none text-white ring-1 ring-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>
        </Container>
      </nav>

      {/* Middle: banner only */}
      <div className="relative z-40 bg-white">
        <Container className="py-1.5 sm:py-2">
          <div className="grid min-h-14 grid-cols-[1fr_auto] items-center gap-3 lg:block">
            <img
              src="/banner.jpeg"
              alt="Karthikeyan Analysis"
              className="h-12 w-full max-w-none object-contain sm:h-14 md:h-16 lg:h-[4.25rem]"
              loading="eager"
              decoding="async"
            />

            {/* Mobile hamburger beside banner (no overlap) */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-10 touch-manipulation items-center justify-center rounded-xl bg-white text-brand-navy shadow-sm ring-1 ring-black/10 transition hover:bg-slate-50 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </Container>
      </div>

      {/* ─── Mobile drawer ─────────────────────────────────────────── */}
      <Dialog
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        className="relative z-[100]"
      >
        {/* Backdrop */}
        <DialogBackdrop
          transition={false}
          className="fixed inset-0 z-[99] bg-brand-navy/70 backdrop-blur-sm"
        />

        {/* Panel */}
        <DialogPanel
          id="mobile-nav-panel"
          transition={false}
          className="fixed inset-y-0 right-0 z-[100] flex h-[100dvh] w-[min(88vw,22rem)] flex-col overflow-hidden bg-white shadow-2xl outline-none"
        >
          {/* ── Branded header strip ── */}
          <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-brand-navy via-brand-navy to-brand-cta px-5 pb-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
            {/* subtle circle decoration */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/[0.05]" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-white/[0.04]" />

            <div className="relative flex items-center justify-between gap-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                <img
                  src="/logo.jpeg"
                  alt="Karthikeyan Analysis"
                  className="size-10 rounded-lg object-cover ring-2 ring-white/30"
                />
                <div>
                  <DialogTitle className="font-black text-[15px] leading-tight text-white">
                    Karthikeyan Analysis
                  </DialogTitle>
                  <p className="text-[10px] font-medium text-white/60 leading-tight">
                    Best E-Learning for TNPSC
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition active:bg-white/20"
                aria-label="Close menu"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            {/* CTA buttons in header */}
            <div className="relative mt-4 grid grid-cols-2 gap-2">
              <a
                href="https://karthikeyananalysisstudycircle.vercel.app/login"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-white/15 px-3 text-[12px] font-bold text-white ring-1 ring-white/25 transition active:bg-white/25"
                onClick={() => setMobileOpen(false)}
              >
                <GraduationCap className="size-3.5 shrink-0" aria-hidden />
                Student Login
              </a>
              <Link
                to="/book-store"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-brand-purple px-3 text-[12px] font-bold text-white ring-1 ring-brand-purple/60 transition active:opacity-80"
              >
                <ShoppingBag className="size-3.5 shrink-0" aria-hidden />
                Book Store
              </Link>
            </div>
          </div>

          {/* ── Scrollable nav ── */}
          <nav
            aria-label="Mobile navigation"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
          >
            {/* Main pages */}
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-brand-black/35">
              Navigate
            </p>
            <ul className="space-y-0.5">
              {[
                { to: "/", label: "Home", Icon: Home },
                { to: "/about", label: "About Us", Icon: Info },
                { to: "/batches", label: "Current Batches", Icon: Users },
                { to: "/achievements", label: "Achievements", Icon: Trophy },
                { to: "/contact", label: "Contact Us", Icon: Phone },
              ].map(({ to, label, Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition active:bg-brand-navy/[0.06] ${
                      location.pathname === to
                        ? "bg-brand-navy/[0.07] text-brand-navy"
                        : "text-brand-black hover:bg-black/[0.04]"
                    }`}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${location.pathname === to ? "bg-brand-navy text-white" : "bg-black/[0.05] text-brand-black/60"}`}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {label}
                    <ChevronRight className="ml-auto size-4 text-brand-black/25" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            {/* TNPSC Courses */}
            <p className="mb-1.5 mt-4 px-2 text-[10px] font-bold uppercase tracking-widest text-brand-black/35">
              TNPSC Courses
            </p>
            <div className="overflow-hidden rounded-xl ring-1 ring-black/[0.08]">
              {[
                { to: "/group-i", label: "Group I" },
                { to: "/group-ii", label: "Group II & II A" },
                { to: "/statistical-services", label: "Statistical Services" },
              ].map(({ to, label }, i, arr) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-11 touch-manipulation items-center gap-3 px-4 py-2.5 text-[14px] font-semibold transition active:bg-brand-navy/[0.06] ${
                    location.pathname === to
                      ? "bg-brand-navy/[0.07] text-brand-navy"
                      : "text-brand-black hover:bg-black/[0.03]"
                  } ${i < arr.length - 1 ? "border-b border-black/[0.07]" : ""}`}
                >
                  <Star className={`size-3.5 shrink-0 ${location.pathname === to ? "text-brand-navy" : "text-brand-black/30"}`} aria-hidden />
                  {label}
                  <ChevronRight className="ml-auto size-4 text-brand-black/25" aria-hidden />
                </Link>
              ))}
            </div>

            {/* TRB Courses */}
            <p className="mb-1.5 mt-4 px-2 text-[10px] font-bold uppercase tracking-widest text-brand-black/35">
              TRB Courses
            </p>
            <div className="overflow-hidden rounded-xl ring-1 ring-black/[0.08]">
              {[
                { to: "/trb-ug", label: "UG TRB Exam" },
                { to: "/trb-pg", label: "PG TRB Exam" },
              ].map(({ to, label }, i, arr) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-11 touch-manipulation items-center gap-3 px-4 py-2.5 text-[14px] font-semibold transition active:bg-brand-navy/[0.06] ${
                    location.pathname === to
                      ? "bg-brand-navy/[0.07] text-brand-navy"
                      : "text-brand-black hover:bg-black/[0.03]"
                  } ${i < arr.length - 1 ? "border-b border-black/[0.07]" : ""}`}
                >
                  <BookOpen className={`size-3.5 shrink-0 ${location.pathname === to ? "text-brand-navy" : "text-brand-black/30"}`} aria-hidden />
                  {label}
                  <ChevronRight className="ml-auto size-4 text-brand-black/25" aria-hidden />
                </Link>
              ))}
            </div>

            {/* Bottom padding so last item clears floating buttons */}
            <div className="h-6" />
          </nav>

          {/* ── Footer strip ── */}
          <div className="shrink-0 border-t border-black/[0.07] bg-slate-50 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
            <div className="mb-2.5 grid grid-cols-2 gap-2">
              <a
                href="tel:+916385939895"
                className="flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-brand-cta px-3 text-[12px] font-bold text-white transition active:opacity-80"
                onClick={() => setMobileOpen(false)}
              >
                <Phone className="size-3.5 shrink-0" aria-hidden />
                Call Now
              </a>
              <a
                href="mailto:karthikeyananalysisstudycircle@gmail.com"
                className="flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[12px] font-bold text-brand-navy ring-1 ring-black/10 transition active:bg-black/[0.04]"
                onClick={() => setMobileOpen(false)}
              >
                <Mail className="size-3.5 shrink-0" aria-hidden />
                Email Us
              </a>
            </div>
            {/* Social row */}
            <div className="flex items-center justify-center gap-3">
              {[
                { icon: "fa-brands fa-telegram", href: "https://t.me/karthikeyananalysis", color: "#2599CE", label: "Telegram" },
                { icon: "fa-brands fa-instagram", href: "https://www.instagram.com/karthikeyan_analysis?igsh=ZWw2ZGd6ZnEyeHA=", color: "#E4405F", label: "Instagram" },
                { icon: "fa-brands fa-youtube", href: "https://youtube.com/@karthikeyananalysis", color: "#FF0000", label: "YouTube" },
                { icon: "fa-brands fa-whatsapp", href: "https://wa.me/message/LNAXQMM3G4OBM1", color: "#25D366", label: "WhatsApp" },
              ].map(({ icon, href, color, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 touch-manipulation items-center justify-center rounded-full bg-white ring-1 ring-black/[0.08] transition active:scale-95"
                >
                  <i className={`${icon} text-[15px] leading-none`} style={{ color }} aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
