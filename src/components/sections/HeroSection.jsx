import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Container from "../ui/Container";
import Badge from "../ui/Badge";

export default function HeroSection() {
  const slides = useMemo(
    () => [
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
    ],
    [],
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [paused, slides.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="absolute inset-0 noise opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 bg-transparent" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand-purple/20 blur-3xl animate-floaty"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-brand-sky/18 blur-3xl animate-floaty"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-brand-orange/16 blur-3xl animate-floaty"
        aria-hidden="true"
      />

      <Container className="relative pt-4 pb-14 md:pt-6 md:pb-20 lg:pt-8 lg:pb-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-2 md:order-1"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">TNPSC • TRB • Statistical Services</Badge>
            </div>

            <h1 className="mt-6 font-extrabold text-4xl leading-[1.05] tracking-tight md:text-6xl">
              <span className="bg-gradient-to-r from-brand-navy via-brand-purple to-brand-navy bg-clip-text text-transparent">
                Turning Analysis into Achievement.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-brand-black/70 md:text-lg">
              Specialized online coaching for TNPSC Group I, Group II, and
              Statistical Services — built for clarity, speed, and ranks.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/batches">
                <Button variant="gradient" className="px-5">
                  Explore Current Batches <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" className="px-5">
                  <Phone className="h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative order-1 md:order-2"
          >
            <div className="relative">
              <div
                className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-orange/14 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute -left-28 -bottom-24 h-64 w-64 rounded-full bg-brand-navy/12 blur-3xl"
                aria-hidden="true"
              />

              <div
                className="relative w-full overflow-hidden rounded-2xl bg-transparent"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {/* 5625×1875 ≈ 3:1 — lock the frame so images fit naturally */}
                <div className="relative aspect-[3/1] w-full">
                  {slides.map((src, i) => (
                    <motion.img
                      key={src}
                      src={src}
                      alt="Karthikeyan Analysis hero slide"
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-contain"
                      animate={{ opacity: i === active ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      style={{ willChange: "opacity" }}
                    />
                  ))}

                {/* subtle gradient overlay for text legibility */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent"
                  aria-hidden="true"
                />
                </div>
              </div>

              {/* Dots (below the carousel frame) */}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active
                        ? "w-8 bg-brand-navy"
                        : "w-3 bg-brand-navy/25 hover:bg-brand-navy/40"
                    }`}
                    style={{ pointerEvents: "auto" }}
                  />
                ))}
              </div>

            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
