"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-11 w-[96px] rounded-full border border-slate-200 bg-slate-100/80 dark:border-zinc-800 dark:bg-zinc-900/80" />;
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-11 w-[96px] items-center rounded-full border border-slate-200 bg-slate-100/90 p-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgba(15,23,42,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:shadow-none dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={isDark}
    >
      <span className={`pointer-events-none absolute left-3 flex items-center transition-opacity duration-200 ${isDark ? "opacity-35" : "opacity-100"}`}>
        <SunMedium size={14} className="text-amber-500 dark:text-zinc-500" />
      </span>

      <span
        className={`absolute left-1 top-1 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? "translate-x-[44px] border-zinc-700 bg-zinc-950 text-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.7)]"
            : "translate-x-0 border-slate-200 bg-white text-slate-900 shadow-[0_8px_18px_-10px_rgba(15,23,42,0.45)] dark:border-zinc-700"
        }`}
      >
        {isDark ? <Moon size={16} className="text-white" /> : <SunMedium size={16} className="text-amber-500" />}
      </span>
    </button>
  );
}
