import React from "react";
import BrandMark from "./BrandMark";

export default function FutureSelfCard({ group, phase, allGroups = {} }) {
  const futureSelf = group?.assignedClass;
  const result = group?.result ?? group?.history?.[0]?.result;
  const revealed = Boolean(futureSelf);

  // Split priority criteria into chips
  const priorities = futureSelf?.priority 
    ? futureSelf.priority.split(",").map(p => p.trim()) 
    : [];

  return (
    <div className="flip-container w-full min-h-[400px] my-6">
      <div className={`flipper w-full h-full relative transition-all duration-700 transform-gpu ${revealed ? "rotate-y-180" : ""}`}>
        
        {/* Card Back: Veil of Ignorance */}
        {!revealed ? (
          <section className="veil-card w-full h-full min-h-[400px] flex flex-col justify-between items-center text-center p-8 md:p-12 rounded-3xl select-none">
            <div className="flex flex-col items-center">
              <BrandMark size="lg" className="mb-6 animate-pulse" />
              <p className="panel-label">무지의 베일 (Veil of Ignorance)</p>
              <h2 className="text-3xl md:text-4xl font-serif text-white mt-4 font-bold leading-snug">
                아직 우리는 누구인지 모릅니다
              </h2>
              <p className="mt-4 text-base md:text-lg max-w-xl text-blue-100 font-serif leading-relaxed">
                내가 미래 사회의 어떤 위치(상류층, 중산층, 빈곤층 등)에서 살게 될지 전혀 알 수 없는 상태입니다. 
                모든 계층의 사람들이 받아들일 수 있는 가장 공정한 사회 제도를 함께 토론하고 설계해 보세요.
              </p>
            </div>
            <div className="veil-question border-t border-white/20 w-full max-w-md pt-4 mt-8">
              "내가 가장 불리한 위치의 빈곤층으로 태어나더라도, 이 사회 규칙을 납득할 수 있을까요?"
            </div>
          </section>
        ) : (
          /* Card Front: Revealed Role */
          <section className="future-card w-full h-full min-h-[400px] bg-white border border-brand/20 p-6 md:p-10 rounded-3xl shadow-3">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Role Card Graphic */}
              <div className="w-full md:w-64 flex flex-col items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-brand/10 to-brand-soft border border-brand/20 shadow-1 relative overflow-hidden">
                <span className="absolute top-3 left-3 bg-brand text-white text-xs px-2.5 py-1 rounded-full font-bold">
                  우리 모둠만의 미래
                </span>
                <div className="my-auto text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white mb-4 shadow-brand">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-brand-ink leading-tight font-serif">
                    {futureSelf.label}
                  </h3>
                </div>
              </div>

              {/* Role Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="chip chip-cobalt">역할 공개 완료</span>
                    <span className="text-sm font-semibold text-gray-500">지정 모둠: {group.name}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-brand-ink font-serif mb-3">
                    {futureSelf.headline}
                  </h2>
                  <p className="text-gray-700 leading-relaxed font-serif text-base mb-6">
                    {futureSelf.situation}
                  </p>

                  {/* Criteria split into chips */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      내가 특히 따져볼 성찰 기준
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {priorities.map((item, index) => (
                        <span key={index} className="chip chip-coral">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1st Round Causal Review */}
                {result && (
                  <div className="status-callout flex flex-col gap-1 border-l-4 border-success bg-success-soft/50 p-4 rounded-r-xl">
                    <p className="font-extrabold text-success text-sm font-serif">
                      ★ 내 역할에서 바라본 1차 설계 평가
                    </p>
                    <p className="text-gray-700 leading-relaxed text-sm font-serif">
                      {result.classResult.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Other Groups' Role Preview */}
            <div className="mt-8 pt-6 border-t border-gray-100 w-full">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                다른 모둠의 미래 위치 상황 (모든 모둠의 출발선과 처지는 서로 다릅니다)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {Object.values(allGroups).map(g => {
                  const isCurrent = g.id === group.id;
                  const otherRevealed = Boolean(g.assignedClass);
                  
                  return (
                    <div 
                      key={g.id} 
                      className={`p-2.5 rounded-lg border text-center text-xs flex flex-col justify-between min-h-[64px] ${
                        isCurrent 
                          ? "border-brand bg-brand-soft text-brand font-bold ring-2 ring-brand/20" 
                          : otherRevealed
                            ? "border-gray-200 bg-gray-50 text-gray-700"
                            : "border-gray-100 bg-gray-50/50 text-gray-400"
                      }`}
                    >
                      <span className="font-semibold block mb-1">{g.name}</span>
                      <span className="font-serif block truncate font-bold text-[10px]">
                        {otherRevealed ? g.assignedClass.label : "베일 속 ▾"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>
        )}

      </div>
    </div>
  );
}
