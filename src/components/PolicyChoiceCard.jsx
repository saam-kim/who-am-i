import React from "react";

const POLICY_EXAMPLES = {
  // Tax
  low: "예: 개인/기업 세금이 줄어 상권과 소비 활성화에 기여합니다.",
  shared: "예: 생활필수품 부가가치세처럼 모든 시민이 고르게 세금을 냅니다.",
  ability: "예: 소득이 많을수록 더 높은 세율을 적용하는 누진세율을 높입니다.",
  // Budget
  growth: "예: 신산업 연구개발 지원, SOC 투자 등으로 일자리를 창출합니다.",
  basic: "예: 생활이 어려운 계층에 생계 급여와 영구 임대 주거를 보장합니다.",
  opportunity: "예: 맞춤형 직업 교육과 보육 서비스를 통해 재기를 돕습니다.",
  // Wage
  market: "예: 일자리를 유지하기 위해 업종별 여건에 맞게 임금을 조절합니다.",
  gradual: "예: 소상공인 부담과 노동자 소득을 고려해 매년 완만히 인상합니다.",
  living: "예: 물가를 반영해 한 가구의 최소 주거·교육비 수준을 지급합니다."
};

export default function PolicyChoiceCard({ option, active, disabled, onSelect }) {
  // Determine chart levels (1 to 3) based on option key
  let level = 2; // Default Shared/Opportunity/Gradual
  const key = option.key;
  if (["low", "growth", "market"].includes(key)) level = 1;
  if (["ability", "basic", "living"].includes(key)) level = 3;

  const exampleText = POLICY_EXAMPLES[key] || "";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect && onSelect(option)}
      className={`choice-card ${active ? "active" : ""} w-full h-full text-left flex flex-col justify-between`}
      aria-pressed={active}
    >
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-start w-full">
          <span>{option.label}</span>
        </div>
        <small className="mt-2 block text-gray-600 leading-relaxed">
          {option.description}
        </small>
        
        {/* Real-life Example */}
        <p className="mt-3 text-xs font-serif text-brand-ink/80 italic border-l-2 border-brand-strong/40 pl-2">
          {exampleText}
        </p>
      </div>

      {/* Mini Bar Chart */}
      <div className="mini-chart w-24">
        {[1, 2, 3].map(barIndex => (
          <div
            key={barIndex}
            className={`mini-chart-bar h-2 w-full rounded-sm ${
              barIndex <= level 
                ? active 
                  ? "bg-brand" 
                  : "bg-brand-strong"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </button>
  );
}
