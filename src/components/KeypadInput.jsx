import React from "react";

export default function KeypadInput({ value, onChange, maxLength = 6 }) {
  const handleNumberPress = (num) => {
    if (value.length < maxLength) {
      onChange(value + num);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange("");
  };

  const buttons = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "C", "0", "⌫"
  ];

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-50 border border-gray-200 p-4 rounded-2xl shadow-1 mt-4">
      <div className="grid grid-cols-3 gap-2.5">
        {buttons.map((btn) => {
          let btnClass = "bg-white text-brand-ink font-bold border border-gray-200 hover:bg-gray-100";
          let action = () => handleNumberPress(btn);

          if (btn === "C") {
            btnClass = "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100";
            action = handleClear;
          } else if (btn === "⌫") {
            btnClass = "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200";
            action = handleBackspace;
          }

          return (
            <button
              key={btn}
              type="button"
              onClick={action}
              className={`h-14 md:h-16 text-lg rounded-xl flex items-center justify-center transition-all active:scale-95 select-none ${btnClass}`}
            >
              {btn}
            </button>
          );
        })}
      </div>
    </div>
  );
}
