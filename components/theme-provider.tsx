"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark";
export type AccentKey = "indigo" | "emerald" | "blue" | "violet" | "rose" | "amber";

// Accent ramps as "R G B" triples (consumed by CSS vars --accent-300..600).
// `fg` is the text color that sits ON the accent-600 button fill — white for deep
// accents, near-black for light ones (amber/emerald) where white is too low-contrast.
export const ACCENTS: Record<AccentKey, { label: string; ramp: Record<300 | 400 | 500 | 600, string>; fg: string; swatch: string }> = {
  indigo:  { label: "Indigo",  swatch: "#6366f1", fg: "255 255 255", ramp: { 300: "165 180 252", 400: "129 140 248", 500: "99 102 241", 600: "79 70 229" } },
  emerald: { label: "Emerald", swatch: "#10b981", fg: "15 23 42",    ramp: { 300: "110 231 183", 400: "52 211 153", 500: "16 185 129", 600: "5 150 105" } },
  blue:    { label: "Blue",    swatch: "#3b82f6", fg: "255 255 255", ramp: { 300: "147 197 253", 400: "96 165 250", 500: "59 130 246", 600: "37 99 235" } },
  violet:  { label: "Violet",  swatch: "#8b5cf6", fg: "255 255 255", ramp: { 300: "196 181 253", 400: "167 139 250", 500: "139 92 246", 600: "124 58 237" } },
  rose:    { label: "Rose",    swatch: "#f43f5e", fg: "255 255 255", ramp: { 300: "253 164 175", 400: "251 113 133", 500: "244 63 94", 600: "225 29 72" } },
  amber:   { label: "Amber",   swatch: "#f59e0b", fg: "15 23 42",    ramp: { 300: "252 211 77", 400: "251 191 36", 500: "245 158 11", 600: "217 119 6" } },
};

const MODE_KEY = "rw_theme_mode";
const ACCENT_KEY = "rw_theme_accent";

interface ThemeCtx {
  mode: ThemeMode;
  accent: AccentKey;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (a: AccentKey) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

function applyMode(mode: ThemeMode) {
  const el = document.documentElement;
  el.classList.remove("light", "dark");
  el.classList.add(mode);
}

function applyAccent(accent: AccentKey) {
  const { ramp, fg } = ACCENTS[accent];
  const el = document.documentElement;
  el.style.setProperty("--accent-300", ramp[300]);
  el.style.setProperty("--accent-400", ramp[400]);
  el.style.setProperty("--accent-500", ramp[500]);
  el.style.setProperty("--accent-600", ramp[600]);
  el.style.setProperty("--accent-foreground", fg);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [accent, setAccentState] = useState<AccentKey>("indigo");

  // Hydrate from localStorage on mount (the inline script in <head> already
  // applied the class to avoid a flash; this syncs React state to it).
  useEffect(() => {
    const m = (localStorage.getItem(MODE_KEY) as ThemeMode) || "dark";
    const a = (localStorage.getItem(ACCENT_KEY) as AccentKey) || "indigo";
    setModeState(m);
    setAccentState(a);
    applyMode(m);
    applyAccent(a);
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
    applyAccent(a);
  }, []);

  return <Ctx.Provider value={{ mode, accent, setMode, toggleMode, setAccent }}>{children}</Ctx.Provider>;
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
  var ramps=${JSON.stringify(Object.fromEntries(Object.entries(ACCENTS).map(([k,v])=>[k,v.ramp])))};
  var fgs=${JSON.stringify(Object.fromEntries(Object.entries(ACCENTS).map(([k,v])=>[k,v.fg])))};
  var el=document.documentElement;
  el.classList.remove('light','dark');el.classList.add(m);
  var r=ramps[a]||ramps.indigo;
  el.style.setProperty('--accent-300',r['300']);
  el.style.setProperty('--accent-400',r['400']);
  el.style.setProperty('--accent-500',r['500']);
  el.style.setProperty('--accent-600',r['600']);
  el.style.setProperty('--accent-foreground',fgs[a]||fgs.indigo);
}catch(e){}})();
`;
