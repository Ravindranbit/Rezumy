"use client";

import { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface StatusBannerProps {
  type: "success" | "error";
  text: string;
  onClose: () => void;
}

export default function StatusBanner({ type, text, onClose }: StatusBannerProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-8 right-8 z-[100] w-full max-w-[320px] border rounded-xl p-4 flex items-center gap-3 text-sm shadow-2xl animate-toast-in ${
        type === "success"
          ? "bg-white border-emerald-100 text-emerald-800"
          : "bg-white border-red-100 text-red-800"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-500 shrink-0" />
      )}
      <span className="flex-1 font-medium">{text}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/5 rounded-md transition-colors shrink-0"
      >
        <X size={14} className="opacity-40" />
      </button>
    </div>
  );
}
