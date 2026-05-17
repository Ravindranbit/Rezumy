"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-3 block text-[10px] font-bold tracking-[0.2em] uppercase opacity-40"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={clsx(
            "w-full border bg-white/30 px-4 py-3 text-sm text-ordr-text placeholder:text-ordr-text/20 transition-all duration-300 min-h-[120px] resize-none",
            "focus:outline-none focus:border-ordr-accent focus:bg-white",
            error
              ? "border-ordr-red"
              : "border-ordr/30 hover:border-ordr",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[10px] font-bold tracking-widest text-ordr-red uppercase">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
