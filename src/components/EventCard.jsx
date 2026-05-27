import React from "react";

const getCausalHeader = (title) => {
  if (title.includes("일자리는 늘었지만")) return "우리가 '성장 우선형' 예산을 골라서";
  if (title.includes("최소 생활 보장")) return "우리가 '기본 보장형' 예산을 골라서";
  if (title.includes("교육과 직업훈련")) return "우리가 '기회 투자형' 예산을 골라서";
  if (title.includes("조세 저항")) return "우리가 '능력 부담형' 세금을 골라서";
  if (title.includes("공공 서비스")) return "우리가 '낮은 세금형' 세금을 골라서";
  if (title.includes("노동자의 생활 안정이 높아졌지만")) return "우리가 '생활 보장형' 최저임금을 골라서";
  if (title.includes("저임금 노동자의 생활 불안")) return "우리가 '시장 자율형' 최저임금을 골라서";
  if (title.includes("갈등이 커졌습니다")) return "우리 사회의 불평등 격차가 커져서";
  if (title.includes("안정적인 사회 합의")) return "우리가 균형 잡힌 정책들을 골라서";
  return "우리 사회의 정책 선택의 결과로";
};

export default function EventCard({ card, index }) {
  const causalHeader = getCausalHeader(card.title || "");
  const type = card.type || "mixed";
  
  let typeTag = "공동체 소식";
  let typeClass = "chip-cobalt";
  if (type === "warning") {
    typeTag = "사회적 경고";
    typeClass = "chip-coral";
  } else if (type === "good") {
    typeTag = "사회적 성과";
    typeClass = "chip-success";
  }

  return (
    <article className={`event-card ${type} flex flex-col justify-between h-full bg-white`}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            사건 {index + 1}
          </span>
          <span className={`chip text-[11px] px-2 py-0.5 font-bold ${typeClass}`}>
            {typeTag}
          </span>
        </div>
        
        {/* Causal Header */}
        <p className="text-[11px] font-extrabold text-brand tracking-tight mb-1">
          {causalHeader} ▾
        </p>
        
        <h3 className="text-lg font-bold text-brand-ink leading-snug mb-2 font-serif">
          {card.title}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {card.body}
        </p>
      </div>

      <strong className="text-xs text-brand-deep font-serif pt-3 border-t border-dashed border-gray-100">
        Q. {card.question}
      </strong>
    </article>
  );
}
