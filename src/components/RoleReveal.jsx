import React, { useState, useEffect } from "react";
import { FUTURE_SELF_CARDS } from "../useGameData";

export default function RoleReveal({ selectedGroup, onReveal, rolling, setRolling }) {
  const [slotText, setSlotText] = useState("아직 공개 전");
  const [isFlipped, setIsFlipped] = useState(false);
  const assignedClass = selectedGroup?.assignedClass;
  const rouletteDone = selectedGroup?.rouletteDone;

  useEffect(() => {
    if (rouletteDone && assignedClass) {
      setSlotText(assignedClass.label);
      setIsFlipped(true);
    } else {
      setSlotText("아직 공개 전");
      setIsFlipped(false);
    }
  }, [selectedGroup, rouletteDone, assignedClass]);

  const startRoulette = async () => {
    if (!selectedGroup || rolling || rouletteDone) return;

    setRolling(true);
    setIsFlipped(false);

    const labels = FUTURE_SELF_CARDS.map((card) => card.label);
    let index = 0;
    
    // Decelerating slot animation
    // Phase 1: Fast spin (0ms - 2800ms) with interval ~70ms
    const startTime = Date.now();
    const fastDuration = 2800;
    
    const spinFast = () => {
      if (Date.now() - startTime < fastDuration) {
        setSlotText(labels[index % labels.length]);
        index++;
        setTimeout(spinFast, 70);
      } else {
        // Phase 2: Decelerate (2800ms - 3500ms) with increasing delays
        spinSlow(120);
      }
    };

    const spinSlow = (delay) => {
      if (delay < 450) {
        setSlotText(labels[index % labels.length]);
        index++;
        setTimeout(() => spinSlow(delay * 1.5), delay);
      } else {
        // Complete spin, trigger reveal callback
        revealFinalCard();
      }
    };

    const revealFinalCard = async () => {
      const outcome = await onReveal();
      if (outcome?.picked?.label) {
        setSlotText(outcome.picked.label);
        // Add a slight delay before Y-axis flip for dramatic effect
        setTimeout(() => {
          setIsFlipped(true);
          setRolling(false);
        }, 300);
      } else {
        setRolling(false);
      }
    };

    spinFast();
  };

  return (
    <div className="flex flex-col items-center gap-6 my-6 w-full max-w-lg mx-auto">
      {/* 3D Card Container */}
      <div className="w-[260px] h-[360px] perspective-1000">
        <div 
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Card Back (Veil / Starry back) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-b from-midnight to-brand-deep border-2 border-brand/50 flex flex-col items-center justify-between p-6 shadow-3 text-white">
            <div className="w-full flex justify-between items-center text-xs tracking-widest text-brand-soft uppercase">
              <span>Who am I</span>
              <span>모둠: {selectedGroup?.name}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              {rolling ? (
                <div className="text-center">
                  {/* Slots rolling visualizer */}
                  <div className="text-xl font-serif text-accent animate-bounce mb-4 font-bold">
                    역할 결정 중...
                  </div>
                  <div className="text-2xl font-bold bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 truncate max-w-[200px]">
                    {slotText}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-accent flex items-center justify-center text-accent text-3xl font-bold mb-4 mx-auto animate-pulse">
                    ?
                  </div>
                  <p className="text-gray-300 font-serif text-sm">
                    베일 걷기 버튼을 누르면<br />미래의 역할이 공개됩니다.
                  </p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-gray-400">
              JOHN RAWLS VEIL OF IGNORANCE
            </div>
          </div>

          {/* Card Front (Revealed Role Details) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-white border-2 border-brand flex flex-col justify-between p-6 shadow-3 text-brand-ink">
            <div className="flex justify-between items-center w-full">
              <span className="chip chip-coral text-[10px] px-2 py-0.5 font-bold uppercase">
                {assignedClass?.classKey === "upper" ? "상류층" : assignedClass?.classKey === "middle" ? "중산층" : "빈곤층"}
              </span>
              <span className="text-xs font-semibold text-gray-500">{selectedGroup?.name}</span>
            </div>

            <div className="flex flex-col items-center text-center my-auto">
              <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center text-brand mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-serif mb-2">{assignedClass?.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-serif truncate max-w-[200px]" title={assignedClass?.headline}>
                {assignedClass?.headline}
              </p>
            </div>

            <div className="border-t border-dashed border-gray-100 pt-3 text-[10px] text-gray-400 text-center font-serif">
              가장 불리한 시민도 동의할 수 있는가?
            </div>
          </div>

        </div>
      </div>

      {/* Control Button */}
      <button
        type="button"
        disabled={rolling || !selectedGroup?.isSubmitted || rouletteDone}
        onClick={startRoulette}
        className="button-primary w-full max-w-xs h-14 text-base"
      >
        {rouletteDone ? "베일 걷기 완료" : rolling ? "베일 걷는 중..." : "베일 걷기 (역할 공개)"}
      </button>
    </div>
  );
}
