import { Globe, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../ui/Container";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-navy text-white/85">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(900px circle at 10% 10%, rgba(102, 32, 130, 0.26), transparent 40%), radial-gradient(900px circle at 85% 0%, rgba(3, 169, 244, 0.2), transparent 40%), radial-gradient(900px circle at 40% 90%, rgba(230, 81, 0, 0.2), transparent 45%), radial-gradient(900px circle at 75% 70%, rgba(128, 8, 71, 0.18), transparent 46%)",
        }}
        aria-hidden="true"
      />
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <img
            src="/logo.jpeg"
            alt="Karthikeyan Analysis Logo"
            className="h-12 w-12 rounded-xl shadow-soft"
          />
          <p className="text-sm text-white/70">
            Elite TNPSC and TRB coaching with data-driven mentorship and
            structured preparation paths.
          </p>
          <div className="flex gap-3">
            <Link
              to="/"
              aria-label="Go to homepage"
              className="rounded-full bg-white/10 p-2 ring-1 ring-white/10 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              <Globe className="h-4 w-4" />
            </Link>
            <a
              href="https://www.google.com/maps/search/?api=1&query=110+Uthamar+Gandhi+Road%2C+Chennai+600034"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open location in Maps"
              className="rounded-full bg-white/10 p-2 ring-1 ring-white/10 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              <MapPin className="h-4 w-4" />
            </a>
            <a
              href="tel:+916385939895"
              aria-label="Call Karthikeyan Analysis"
              className="rounded-full bg-white/10 p-2 ring-1 ring-white/10 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <Link
                to="/"
                className="transition-colors hover:text-white"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="transition-colors hover:text-white"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/batches"
                className="transition-colors hover:text-white"
              >
                Our Batches
              </Link>
            </li>
            <li>
              <Link
                to="/achievements"
                className="transition-colors hover:text-white"
              >
                Our Achievers
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="transition-colors hover:text-white"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Our Policy</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <Link
                to="/refund-policy"
                className="transition-colors hover:text-white"
              >
                Cancellation & Refund
              </Link>
            </li>
            <li>
              <Link
                to="/shipping-policy"
                className="transition-colors hover:text-white"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-conditions"
                className="transition-colors hover:text-white"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-white">Contact</h4>
          <p className="flex items-start gap-2 text-sm font-numbers">
            <MapPin className="mt-0.5 h-4 w-4" /> No - 110, Uthamar Gandhi Road,
            Chennai - 600034.
          </p>
          <p className="flex items-start gap-2 text-sm font-numbers">
            <Phone className="mt-0.5 h-4 w-4" /> +91 63859 39895
          </p>
          <p className="text-sm">karthikeyananalysisstudycircle@gmail.com</p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70 backdrop-blur">
            Office: Online + Chennai center. Reach out for batch timings and
            admissions.
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
        <div>Copyright {new Date().getFullYear()} Karthikeyan Analysis Study Circle.</div>
        <div className="mt-1 text-[11px] font-semibold text-yellow-300">
          Crafted by{" "}
          <a
            href="https://legendaryone.in"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline transition-colors hover:text-yellow-200"
          >
            Legendary One
          </a>
        </div>
      </div>
    </footer>
  );
}
