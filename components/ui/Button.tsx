"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center font-bold tracking-[0.2em] uppercase transition-all duration-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30",
          {
            // Variants
            "bg-ordr-text text-white hover:bg-ordr-accent":
              variant === "primary",
            "border border-ordr bg-transparent text-ordr-text hover:bg-ordr-text hover:text-white":
              variant === "secondary",
            "text-ordr-text/60 hover:text-ordr-text hover:bg-ordr/10":
              variant === "ghost",
            "bg-ordr-red text-white hover:opacity-80":
              variant === "danger",
            // Sizes
            "text-[9px] px-4 py-2": size === "sm",
            "text-[10px] px-6 py-3": size === "md",
            "text-[11px] px-8 py-4": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
