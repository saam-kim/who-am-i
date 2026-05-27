import React from "react";

export default function BrandMark({ size = "md", className = "" }) {
  const dimensions = size === "lg" ? "w-14 h-14" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "lg" ? 36 : size === "sm" ? 20 : 26;

  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-brand text-white shadow-brand ${dimensions} ${className}`}
      aria-hidden="true"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Eye/Vision + Veil Metaphor */}
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M5 19h14M8 21h8" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
