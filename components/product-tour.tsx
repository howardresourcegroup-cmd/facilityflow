"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, MousePointerClick, Sparkles } from "lucide-react";

// ── Interactive product tour ───────────────────────────────────────────────────
// Spotlights real UI elements (anything carrying a matching data-tour attribute),
// walks the user through the app page by page, and advances either on "Next" or
// when the user actually clicks the highlighted element. Start it from anywhere:
//   window.dispatchEvent(new CustomEvent("rw:start-tour"))

export const TOUR_DONE_KEY = "rw_tour_done";

interface TourStep {
  target: string;          // data-tour value to spotlight
  path?: string;           // route the step lives on (navigates if needed)
  title: string;
  body: string;
  advanceOnClick?: boolean; // advance when the user clicks the target itself
  placement?: "bottom" | "top" | "right" | "left";
}

const STEPS: TourStep[] = [
  {
    target: "stats", path: "/",
    title: "Your live command center",
    body: "These numbers update in real time — active issues, rooms online, critical alerts, and how fast your team closes work.",
    placement: "bottom",
  },
  {
    target: "nav-property", path: "/",
    title: "Open your Property Map",
    body: "This is the heart of Roomward — your whole property as a live floor plan. Click it to go there.",
    advanceOnClick: true, placement: "right",
  },
  {
    target: "map-modes", path: "/property",
    title: "Three ways to see every room",
    body: "Flip between occupancy (who's in), housekeeping (what's clean), and status (what's broken). Try one.",
    placement: "bottom",
  },
  {
    target: "map-grid", path: "/property",
    title: "Click any room to drill in",
    body: "Every box is a real room. Click one to see its status, housekeeping state, every asset inside it, and any open issues.",
    placement: "top",
  },
  {
    target: "nav-work-orders", path: "/property",
    title: "Now, the work itself",
    body: "Every issue lives in Work Orders — assigned, prioritized, and tracked to done. Click to open it.",
    advanceOnClick: true, placement: "right",
  },
  {
    target: "new-work-order", path: "/work-orders",
    title: "Log anything in seconds",
    body: "New Work Order is always one tap away — pick the room, set a priority, assign a teammate, attach photos.",
    placement: "bottom",
  },
];

interface Rect { top: number; left: number; width: number; height: number }

export function ProductTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const targetRef = useRef<Element | null>(null);

  const current = STEPS[step];

  // Start listener
  useEffect(() => {
    const start = () => { setStep(0); setActive(true); };
    window.addEventListener("rw:start-tour", start);
    return () => window.removeEventListener("rw:start-tour", start);
  }, []);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_DONE_KEY, "1");
    setActive(false);
    setRect(null);
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      if (s >= STEPS.length - 1) {
        localStorage.setItem(TOUR_DONE_KEY, "1");
        setActive(false);
        setRect(null);
        return s;
      }
      return s + 1;
    });
  }, []);

  // Navigate to the step's page if we're not on it
  useEffect(() => {
    if (!active || !current?.path) return;
    if (pathname !== current.path) router.push(current.path);
  }, [active, step, current, pathname, router]);

  // Find + measure the target (poll briefly — element may still be rendering after nav)
  useEffect(() => {
    if (!active || !current) return;
    let cancelled = false;
    let tries = 0;
    setRect(null);          // drop the old spotlight while we locate the next target
    targetRef.current = null;

    const measure = () => {
      if (cancelled) return;
      const el = document.querySelector(`[data-tour="${current.target}"]`);
      if (el) {
        targetRef.current = el;
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else if (tries++ < 40) {
        setTimeout(measure, 150); // wait for the page/element to mount
      }
    };
    measure();

    const onRelayout = () => {
      const el = targetRef.current;
      if (!el || !document.contains(el)) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    window.addEventListener("resize", onRelayout);
    window.addEventListener("scroll", onRelayout, true);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onRelayout);
      window.removeEventListener("scroll", onRelayout, true);
    };
  }, [active, step, current, pathname]);

  // Advance when the user clicks the spotlighted element itself
  useEffect(() => {
    if (!active || !current?.advanceOnClick) return;
    const el = targetRef.current;
    if (!el) return;
    const onClick = () => setTimeout(next, 350); // let the navigation start first
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [active, step, current, rect, next]);

  if (!active || !current) return null;

  const pad = 8;
  const hole = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  // Tooltip position
  const tip: React.CSSProperties = { position: "fixed", zIndex: 121, maxWidth: 340 };
  if (hole) {
    const placement = current.placement ?? "bottom";
    if (placement === "bottom") { tip.top = hole.top + hole.height + 12; tip.left = Math.max(12, Math.min(hole.left, window.innerWidth - 360)); }
    if (placement === "top")    { tip.bottom = window.innerHeight - hole.top + 12; tip.left = Math.max(12, Math.min(hole.left, window.innerWidth - 360)); }
    if (placement === "right")  { tip.top = Math.max(12, hole.top); tip.left = hole.left + hole.width + 12; }
    if (placement === "left")   { tip.top = Math.max(12, hole.top); tip.right = window.innerWidth - hole.left + 12; }
  } else {
    tip.top = "40%"; tip.left = "50%"; tip.transform = "translateX(-50%)";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] pointer-events-none">
        {/* Dimmer with a spotlight hole. The hole area stays clickable (pointer-events pass through). */}
        {hole ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute rounded-xl ring-2 ring-accent-500"
            style={{
              top: hole.top, left: hole.left, width: hole.width, height: hole.height,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
              transition: "top .25s ease, left .25s ease, width .25s ease, height .25s ease",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/65" />
        )}

        {/* Click-blockers around the hole so only the target is interactive */}
        {hole && (
          <>
            <div className="absolute pointer-events-auto" style={{ top: 0, left: 0, right: 0, height: Math.max(0, hole.top) }} />
            <div className="absolute pointer-events-auto" style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
            <div className="absolute pointer-events-auto" style={{ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height }} />
            <div className="absolute pointer-events-auto" style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
          </>
        )}

        {/* Tooltip */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={tip}
          className="pointer-events-auto glass-card p-4 shadow-2xl border-accent-500/30"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{current.title}</p>
            <button onClick={finish} className="text-muted-foreground hover:text-foreground shrink-0" title="End tour">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{current.body}</p>
          {current.advanceOnClick && (
            <p className="flex items-center gap-1.5 text-[11px] text-accent-text mt-2">
              <MousePointerClick className="h-3.5 w-3.5" /> Click the highlighted item to continue
            </p>
          )}
          <div className="flex items-center justify-between mt-3.5">
            <span className="text-[10px] text-muted-foreground">{step + 1} of {STEPS.length}</span>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              )}
              {!current.advanceOnClick && (
                <button onClick={next} className="btn-primary h-7 px-3 text-[11px]">
                  {step === STEPS.length - 1 ? <>Finish <Sparkles className="h-3 w-3" /></> : <>Next <ArrowRight className="h-3 w-3" /></>}
                </button>
              )}
              {current.advanceOnClick && (
                <button onClick={next} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                  Skip step
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function startProductTour() {
  window.dispatchEvent(new CustomEvent("rw:start-tour"));
}
