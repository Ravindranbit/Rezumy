"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:bg-zinc-900 dark:border-zinc-800/60 dark:shadow-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx("px-5 py-4 border-b border-slate-100 dark:border-zinc-800/60", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={clsx("px-5 py-4", className)}>
      {children}
    </div>
  );
}
