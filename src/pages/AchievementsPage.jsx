import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { ChevronLeft, ChevronRight } from "lucide-react";

const achievements = [
  ["6", "TNPSC Combined Statistical Services (2021 - 2022)"],
  ["27", "TNPSC Combined Statistical Services (2022 - 2023)"],
  ["5", "TNPSC Assistant Director of Statistics (2024 - 2025)"],
  ["26", "TNPSC SI & BHS Examinations (2024 - 2025)"],
  ["05", "TNPSC Combined Technical Services (Interview Posts) 2026"],
  ["07", "TNPSC Combined Technical Services (Non-interview) 2026"],
];

const ACHIEVEMENT_CARD_COLORS = [
  "blue",
  "orange",
  "purple",
  "green",
  "pink",
  "cyan",
];

const achieverSlides = [
  "/acheiver/10.jpg",
  "/acheiver/9.jpg",
  "/acheiver/8.jpg",
  "/acheiver/7.jpg",
  "/acheiver/6.jpg",
  "/acheiver/5.jpg",
  "/acheiver/4.jpg",
  "/acheiver/3.jpg",
  "/acheiver/2.jpg",
  "/acheiver/1.jpg",
];

/** Snap carousel: scroll snaps + synced dots + prev/next aligned to viewport width */
function useRankerCarousel(slideCount) {
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const root = scrollerRef.current;
    if (!root || slideCount < 1) return;
    const w = root.clientWidth || 1;
    const i = Math.round(root.scrollLeft / w);
    setIndex(Math.max(0, Math.min(slideCount - 1, i)));
  }, [slideCount]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollBySlide = useCallback(
    (delta) => {
      const root = scrollerRef.current;
      if (!root || slideCount < 1) return;
      const w = root.clientWidth || 1;
      const cur = Math.round(root.scrollLeft / w);
      const raw = cur + delta;
      const next = ((raw % slideCount) + slideCount) % slideCount;
      root.scrollTo({ left: next * w, behavior: "smooth" });
    },
    [slideCount],
  );

  const goTo = useCallback(
    (i) => {
      const root = scrollerRef.current;
      if (!root || slideCount < 1) return;
      const w = root.clientWidth || 1;
      const idx = Math.max(0, Math.min(slideCount - 1, i));
      const maxLeft = Math.max(0, root.scrollWidth - w);
      const left = Math.min(idx * w, maxLeft);
      root.scrollTo({ left, behavior: "smooth" });
    },
    [slideCount],
  );

  return { scrollerRef, index, scrollBySlide, goTo };
}

function useInViewOnce(options = { rootMargin: "0px 0px -20% 0px", threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, options]);

  return { ref, inView };
}

function CountUp({ value, padTo = 0, start, durationMs = 900 }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) {
      setN(value);
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const from = 0;
    const to = Math.max(0, Number(value) || 0);

    const tick = (t) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value, durationMs]);

  const text = String(n).padStart(padTo, "0");
  return `+${text}`;
}

export default function AchievementsPage() {
  const { scrollerRef, index, scrollBySlide, goTo } = useRankerCarousel(
    achieverSlides.length,
  );
  const { ref: clearedRef, inView: clearedInView } = useInViewOnce();
  const achievementCounts = useMemo(
    () =>
      achievements.map(([count]) => ({
        value: Number.parseInt(count, 10) || 0,
        padTo: String(count).length,
      })),
    [],
  );

  return (
    <PageLayout
      title="Our Achievers"
      subtitle="At Karthikeyan Analysis, we take immense pride in our achievers — the dedicated aspirants who turned their hard work and our guidance into success in the Tamil Nadu Public Service Commission (TNPSC) examinations. Each achievement reflects our commitment to quality training, result-oriented strategy, and unwavering student support."
    >
      {/* Our Cleared Candidates Section */}
      <section ref={clearedRef} className="w-full bg-white/60 py-10 sm:py-14">
        <Container className="min-w-0">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">
              Our Cleared Candidates
            </h2>
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6 lg:gap-5">
            {achievements.map(([count, label], i) => {
              return (
                <article key={label} className="min-w-0 text-center">
                  <Card
                    color={ACHIEVEMENT_CARD_COLORS[i % ACHIEVEMENT_CARD_COLORS.length]}
                    className="h-full px-3 py-4 sm:p-7"
                  >
                    <p className="font-extrabold text-[clamp(1.5rem,6.5vw,2.75rem)] leading-none tracking-tight text-brand-navy sm:text-5xl">
                      <CountUp
                        value={achievementCounts[i]?.value ?? 0}
                        padTo={achievementCounts[i]?.padTo ?? String(count).length}
                        start={clearedInView}
                      />
                    </p>
                    <p className="mt-2 text-[10px] font-medium leading-snug text-brand-black/70 sm:text-sm">
                      {label}
                    </p>
                  </Card>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Our Top Rankers — touch snap carousel, full usable width */}
      <section className="w-full bg-white py-10 sm:py-14">
        <Container className="min-w-0">
          <div className="mb-6 sm:mb-10">
            <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">
              Our Achievers Gallery
            </h2>
          </div>

          <div className="relative min-w-0 max-w-full overflow-x-clip rounded-xl pb-14 sm:rounded-2xl sm:pb-12">
            <div
              ref={scrollerRef}
              tabIndex={0}
              aria-label="Achievers gallery — swipe sideways"
              className="relative flex aspect-[3/1] min-w-0 max-w-full snap-x snap-mandatory touch-pan-x touch-manipulation gap-0 overflow-x-auto overscroll-x-contain rounded-xl bg-neutral-100 sm:rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  scrollBySlide(-1);
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  scrollBySlide(1);
                }
              }}
            >
              {achieverSlides.map((src, i) => (
                <figure
                  key={`${src}-${i}`}
                  aria-hidden={i !== index}
                  aria-label={`Slide ${i + 1} of ${achieverSlides.length}`}
                  className="box-border min-w-0 max-w-full shrink-0 snap-start snap-always"
                  style={{ flex: "0 0 100%" }}
                >
                  <div className="relative isolate h-full w-full overflow-hidden rounded-xl bg-neutral-100 sm:rounded-2xl">
                    <img
                      src={src}
                      alt={`Achiever highlight ${i + 1}`}
                      className="h-full w-full object-contain object-center"
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                </figure>
              ))}
            </div>

            {/* Arrows inset so they aren’t clipped on narrow screens */}
            <button
              type="button"
              onClick={() => scrollBySlide(-1)}
              className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-brand-navy/92 text-white shadow-md ring-1 ring-white/20 backdrop-blur-sm transition active:scale-[0.97] hover:bg-brand-navy sm:size-11 sm:left-3"
              aria-label="Previous ranker"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollBySlide(1)}
              className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-brand-navy/92 text-white shadow-md ring-1 ring-white/20 backdrop-blur-sm transition active:scale-[0.97] hover:bg-brand-navy sm:size-11 sm:right-3"
              aria-label="Next ranker"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>

            {/* Dots */}
            <div className="absolute bottom-1 left-0 right-0 flex flex-wrap justify-center gap-1.5 px-4 sm:bottom-3 sm:gap-2">
              {achieverSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`h-2 touch-manipulation rounded-full transition-all sm:h-2.5 sm:min-w-2 ${
                    idx === index ? "bg-brand-navy px-3" : "w-2 bg-neutral-400"
                  }`}
                  aria-current={idx === index}
                  aria-label={`Show slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
