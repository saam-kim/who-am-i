import React from "react";

const formatTime = seconds => {
  const safeSeconds = Math.max(0, seconds ?? 0);
  const m = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const s = String(safeSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export default function Timer({ seconds, className = "" }) {
  const isUrgent = seconds <= 30 && seconds > 0;

  return (
    <div
      className={`font-sans tabular-nums font-black transition-colors ${
        isUrgent ? "text-danger animate-pulse" : "text-brand"
      } ${className}`}
      aria-live="polite"
      aria-label={`남은 시간: ${Math.floor(seconds / 60)}분 ${seconds % 60}초`}
    >
      {formatTime(seconds)}
    </div>
  );
}
