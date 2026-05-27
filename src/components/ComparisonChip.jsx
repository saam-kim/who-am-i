import React from "react";

export default function ComparisonChip({ value }) {
  if (!value || value === "-") return <span className="text-gray-300">-</span>;

  // Normalize labels
  const label = String(value);
  let chipClass = "bg-gray-100 text-gray-500";
  
  if (label.includes("낮은 세금") || label.includes("성장") || label.includes("시장 자율")) {
    // Pale Cobalt
    chipClass = "bg-blue-50 text-blue-600 border border-blue-100";
  } else if (label.includes("공동 부담") || label.includes("기회 투자") || label.includes("점진 인상")) {
    // Medium Cobalt
    chipClass = "bg-blue-100 text-blue-700 border border-blue-200";
  } else if (label.includes("능력 부담") || label.includes("기본 보장") || label.includes("생활 보장")) {
    // Deep Cobalt
    chipClass = "bg-brand text-white font-bold";
  }

  return (
    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold text-center truncate ${chipClass}`}>
      {label}
    </span>
  );
}
