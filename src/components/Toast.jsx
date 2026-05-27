import React, { useEffect } from "react";

export default function Toast({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bgClass = "bg-brand text-white border-brand";
  if (type === "error") {
    bgClass = "bg-danger text-white border-danger shadow-lg";
  } else if (type === "success") {
    bgClass = "bg-success text-white border-success";
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-3 max-w-sm animate-bounce ${bgClass}`}
      role="alert"
    >
      <span className="font-semibold text-sm leading-snug">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-white hover:opacity-85 text-xs font-bold w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
}
