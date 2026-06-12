"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark";
export type AccentKey = "indigo" | "emerald" | "blue" | "violet" | "rose" | "amber";
export type AccentSelection = AccentKey | "custom";

type Ramp = Record<300 | 400 | 500 | 600, string>;
interface AccentDef { label: string; ramp: Ramp; fg: string; swatch: string }

// Accent ramps as "R G B" triples (consumed by CSS vars --accent-300..600).
// `fg` is the text color that sits ON the accent-600 button fill — white for deep
// accents, near-black for light ones (amber/emerald) where white is too low-contrast.
export const ACCENTS: Record<AccentKey, AccentDef> = {
  indigo:  { label: "Indigo",  swatch: "#6366f1", fg: "255 255 255", ramp: { 300: "165 180 252", 400: "129 140 248", 500: "99 102 241", 600: "79 70 229" } },
  emerald: { label: "Emerald", swatch: "#10b981", fg: "15 23 42",    ramp: { 300: "110 231 183", 400: "52 211 153", 500: "16 185 129", 600: "5 150 105" } },
  blue:    { label: "Blue",    swatch: "#3b82f6", fg: "255 255 255", ramp: { 300: "147 197 253", 400: "96 165 250", 500: "59 130 246", 600: "37 99 235" } },
  violet:  { label: "Violet",  swatch: "#8b5cf6", fg: "255 255 255", ramp: { 300: "196 181 253", 400: "167 139 250", 500: "139 92 246", 600: "124 58 237" } },
  rose:    { label: "Rose",    swatch: "#f43f5e", fg: "255 255 255", ramp: { 300: "253 164 175", 400: "251 113 133", 500: "244 63 94", 600: "225 29 72" } },
  amber:   { label: "Amber",   swatch: "#f59e0b", fg: "15 23 42",    ramp: { 300: "252 211 77", 400: "251 191 36", 500: "245 158 11", 600: "217 119 6" } },
};

const MODE_KEY = "rw_theme_mode";
const ACCENT_KEY = "rw_theme_accent";       // preset key or "custom"
const CUSTOM_HEX_KEY = "rw_theme_custom";    // the picked hex, e.g. "#6366f1"
const CUSTOM_RAMP_KEY = "rw_theme_custom_ramp"; // resolved ramp+fg JSON (so the no-flash init script needs no math)
const DEFAULT_CUSTOM = "#6366f1";

// ── Derive a full accent ramp + readable button text from a single base hex ────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const int = parseInt(n, 16) || 0;
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}
const mix = (c: number, target: number, amt: number) => Math.round(c + (target - c) * amt);
const trip = (rgb: number[]) => `${rgb[0]} ${rgb[1]} ${rgb[2]}`;
function relLum([r, g, b]: number[]) {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: number[], b: number[]) {
  const la = relLum(a), lb = relLum(b), hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
export function rampFromHex(hex: string): AccentDef {
  const base = hexToRgb(hex);
  const lighten = (amt: number) => base.map((c) => mix(c, 255, amt));
  const darken = (amt: number) => base.map((c) => mix(c, 0, amt));
  const r600 = darken(0.14);
  // Pick whichever button text color contrasts better against the 600 fill.
  const fg = contrast([255, 255, 255], r600) >= contrast([15, 23, 42], r600) ? "255 255 255" : "15 23 42";
  return {
    label: "Custom",
    swatch: hex,
    fg,
    ramp: { 300: trip(lighten(0.42)), 400: trip(lighten(0.20)), 500: trip(base), 600: trip(r600) },
  };
}

interface ThemeCtx {
  mode: ThemeMode;
  accent: AccentSelection;
  customHex: string;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (a: AccentKey) => void;
  setCustom: (hex: string) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

function applyMode(mode: ThemeMode) {
  const el = document.documentElement;
  el.classList.remove("light", "dark");
  el.classList.add(mode);
}

function applyRamp(def: AccentDef) {
  const el = document.documentElement;
  el.style.setProperty("--accent-300", def.ramp[300]);
  el.style.setProperty("--accent-400", def.ramp[400]);
  el.style.setProperty("--accent-500", def.ramp[500]);
  el.style.setProperty("--accent-600", def.ramp[600]);
  el.style.setProperty("--accent-foreground", def.fg);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [accent, setAccentState] = useState<AccentSelection>("indigo");
  const [customHex, setCustomHexState] = useState<string>(DEFAULT_CUSTOM);

  // Hydrate from localStorage on mount (the inline script in <head> already
  // applied the class to avoid a flash; this syncs React state to it).
  useEffect(() => {
    const m = (localStorage.getItem(MODE_KEY) as ThemeMode) || "dark";
    const a = (localStorage.getItem(ACCENT_KEY) as AccentSelection) || "indigo";
    const hex = localStorage.getItem(CUSTOM_HEX_KEY) || DEFAULT_CUSTOM;
    setModeState(m);
    setAccentState(a);
    setCustomHexState(hex);
    applyMode(m);
    applyRamp(a === "custom" ? rampFromHex(hex) : ACCENTS[a as AccentKey] ?? ACCENTS.indigo);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
    applyMode(m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(MODE_KEY, next);
      applyMode(next);
      return next;
    });
  }, []);

  const setAccent = useCallback((a: AccentKey) => {
    setAccentState(a);
    localStorage.setItem(ACCENT_KEY, a);
    applyRamp(ACCENTS[a]);
  }, []);

  const setCustom = useCallback((hex: string) => {
    const def = rampFromHex(hex);
    setAccentState("custom");
    setCustomHexState(hex);
    localStorage.setItem(ACCENT_KEY, "custom");
    localStorage.setItem(CUSTOM_HEX_KEY, hex);
    localStorage.setItem(CUSTOM_RAMP_KEY, JSON.stringify({ ...def.ramp, fg: def.fg }));
    applyRamp(def);
  }, []);

  return (
    <Ctx.Provider value={{ mode, accent, customHex, setMode, toggleMode, setAccent, setCustom }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// Inline script string for <head> — applies theme classes/vars before paint to
// prevent a flash of the wrong theme on first load.
export const THEME_INIT_SCRIPT = `
(function(){try{
  var m=localStorage.getItem('${MODE_KEY}')||'dark';
  var a=localStorage.getItem('${ACCENT_KEY}')||'indigo';
  var ramps=${JSON.stringify(Object.fromEntries(Object.entries(ACCENTS).map(([k, v]) => [k, v.ramp])))};
  var fgs=${JSON.stringify(Object.fromEntries(Object.entries(ACCENTS).map(([k, v]) => [k, v.fg])))};
  var el=document.documentElement;
  el.classList.remove('light','dark');el.classList.add(m);
  var r, fg;
  if(a==='custom'){
    var c=JSON.parse(localStorage.getItem('${CUSTOM_RAMP_KEY}')||'null');
    if(c){ r={'300':c['300'],'400':c['400'],'500':c['500'],'600':c['600']}; fg=c.fg; }
  }
  if(!r){ r=ramps[a]||ramps.indigo; fg=fgs[a]||fgs.indigo; }
  el.style.setProperty('--accent-300',r['300']);
  el.style.setProperty('--accent-400',r['400']);
  el.style.setProperty('--accent-500',r['500']);
  el.style.setProperty('--accent-600',r['600']);
  el.style.setProperty('--accent-foreground',fg);
}catch(e){}})();
`;
