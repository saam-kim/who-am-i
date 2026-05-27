import React from "react";
import { SESSION_PHASES } from "../useGameData";

export default function Stepper({ currentPhase, onClick }) {
  const currentIndex = SESSION_PHASES.findIndex(p => p.key === currentPhase);

  return (
    <nav className="flex items-center gap-2 md:gap-4 select-none" aria-label="수업 단계">
      {SESSION_PHASES.map((item, index) => {
        const isActive = item.key === currentPhase;
        const isDone = index < currentIndex;
        
        let stateClass = "text-gray-400";
        let dotClass = "bg-gray-300";
        
        if (isActive) {
          stateClass = "text-brand font-extrabold";
          dotClass = "bg-brand ring-4 ring-blue-100";
        } else if (isDone) {
          stateClass = "text-brand-deep font-semibold";
          dotClass = "bg-brand-deep";
        }

        return (
          <React.Fragment key={item.key}>
            <button
              type="button"
              onClick={() => onClick && onClick(item.key)}
              className={`flex items-center gap-2 text-sm focus-visible:outline-none transition-all ${stateClass}`}
              title={item.note}
            >
              <span className={`w-3.5 h-3.5 rounded-full transition-all ${dotClass}`} />
              <span className="hidden md:inline">{item.label}</span>
            </button>
            {index < SESSION_PHASES.length - 1 && (
              <span 
                className={`h-0.5 w-4 md:w-8 transition-colors ${
                  index < currentIndex ? "bg-brand-deep" : "bg-gray-200"
                }`} 
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
