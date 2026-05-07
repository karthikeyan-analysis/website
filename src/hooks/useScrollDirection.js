import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Tracks when the sticky top chrome should collapse (scroll down intent) vs expand.
 * Uses rAF-coalescing, cumulative deltas + hysteresis, and min time between toggles
 * so the bar doesn’t flicker at scroll boundaries or on trackpad jitter.
 */
export function useScrollDirection(topThresholdPx = 40) {
  const [collapseTopChrome, setCollapseTopChrome] = useState(false);
  const collapsedRef = useRef(false);
  const lastYRef = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const downAccumRef = useRef(0);
  const upAccumRef = useRef(0);
  const lastToggleMsRef = useRef(0);
  const rafRef = useRef(0);

  const setCollapsed = useCallback((value) => {
    if (collapsedRef.current === value) return;
    collapsedRef.current = value;
    setCollapseTopChrome(value);
  }, []);

  useEffect(() => {
    const DOWN_TO_HIDE = 64;
    const UP_TO_SHOW = 36;
    const MIN_TOGGLE_MS = 280;
    const NOISE_PX = 3;

    const tick = () => {
      rafRef.current = 0;
      const y = window.scrollY;
      const prevY = lastYRef.current;
      const dy = y - prevY;
      const now = Date.now();
      const collapsed = collapsedRef.current;

      lastYRef.current = y;

      // Always show chrome when near the top of the page
      if (y <= topThresholdPx) {
        downAccumRef.current = 0;
        upAccumRef.current = 0;
        if (collapsed) {
          setCollapsed(false);
          lastToggleMsRef.current = now;
        }
        return;
      }

      if (Math.abs(dy) < NOISE_PX) return;

      if (dy > 0) {
        downAccumRef.current += dy;
        upAccumRef.current = 0;
        if (
          !collapsed &&
          downAccumRef.current >= DOWN_TO_HIDE &&
          now - lastToggleMsRef.current >= MIN_TOGGLE_MS
        ) {
          setCollapsed(true);
          lastToggleMsRef.current = now;
          downAccumRef.current = 0;
        }
      } else {
        upAccumRef.current += -dy;
        downAccumRef.current = 0;
        if (
          collapsed &&
          upAccumRef.current >= UP_TO_SHOW &&
          now - lastToggleMsRef.current >= MIN_TOGGLE_MS
        ) {
          setCollapsed(false);
          lastToggleMsRef.current = now;
          upAccumRef.current = 0;
        }
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(tick);
    };

    lastYRef.current = window.scrollY;

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [setCollapsed, topThresholdPx]);

  return collapseTopChrome;
}
