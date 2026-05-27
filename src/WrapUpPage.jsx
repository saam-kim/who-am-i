import { useState } from "react";
import { getAppPath } from "./routes";
import BrandMark from "./components/BrandMark";

const topCards = [
  {
    tone: "blue",
    icon: "?",
    title: "베일 뒤의 질문",
    items: [
      "내가 미래의 어떤 위치에 놓일지 전혀 모른다면, 어떤 사회 원칙을 선택해야 합니까?",
      "우리가 세운 첫 사회 제도는 가장 약하고 불리한 처지의 시민에게도 납득할 만한 것이었습니까?",
      "처음의 1차 설계와 역할 공개 후의 2차 설계 사이에서 판단 기준은 어떻게 달라졌습니까?",
      "나에게 유리한 제도와 공동체 전체에 정당한 제도는 어디에서 접점을 찾게 됩니까?"
    ]
  },
  {
    tone: "rust",
    icon: "!",
    title: "숫자 너머의 삶",
    items: [
      "세율과 예산, 최저임금 수치는 기호가 아니라 누군가의 집세와 치료비, 근로 시간과 여가를 결정하는 현실입니다.",
      "무지의 베일은 내 개인적 이익을 잠시 내려놓고, 서로 다른 삶의 무게를 골고루 상상해 보게 돕는 강력한 수단입니다.",
      "오늘 우리의 사회 설계는 누군가에게는 새로운 기회의 다리가 되었고, 누군가에게는 무거운 납세의 부담이 되었습니다.",
      "정의로운 제도 설계란 그 부담을 부인하는 것이 아닌, 왜 함께 나눌 수 있는지 모두가 수긍할 이유를 제시하는 것입니다."
    ]
  },
  {
    tone: "green",
    icon: "=",
    title: "공정함은 설득의 언어를 남긴다",
    items: [
      "정의로운 공동체는 모두의 소득과 결과를 똑같게 맞추는 곳이 아닌, 계층 간의 차이를 이성적으로 정당화할 수 있는 곳입니다.",
      "가장 열악한 위치에 놓인 사람도 규칙의 혜택을 이해하고 납득할 수 있는지 점검하는 것이 롤스 정의론의 핵심입니다.",
      "내가 만약 실패자의 자리에 서더라도 여전히 수긍할 수 있는 제도를 고르는 순간, 사회적 토론은 이익 다툼을 뛰어넘습니다."
    ]
  }
];

const bottomCards = [
  {
    tone: "gold",
    icon: "§",
    title: "오늘의 핵심 사상 개념",
    items: [
      "롤스의 정의론: 사회의 기본 구조와 제도는 사적 이해관계를 떠나 공정한 절차적 약속 위에서 설계되어야 한다는 이념",
      "무지의 베일: 자신의 선천적 재능이나 소득, 건강 수준 등 사회적 우연성을 알 수 없게 가려 판단의 공정성을 담보하는 장치",
      "차등의 원칙: 사회경제적 불평등이 허용되기 위해선, 그것이 사회의 '최소 수혜자(가장 불리한 처지의 시민)'에게 최대 혜택이 되어야 한다는 원칙",
      "절차로서의 정의: 만장일치로 합의된 공정한 절차적 기회를 거쳤다면, 그 과정의 결과물 또한 정의롭다고 보는 관점"
    ]
  },
  {
    tone: "blue",
    icon: "○",
    title: "함께 살아가는 연대의 시민성",
    items: [
      "내가 만약 기득권의 자리에 있을 때에도 다른 이웃들의 결핍과 제도의 부담을 똑같이 연대하여 바라보기",
      "남의 곤경에 냉담하지 않고, 모두가 공정하다고 자랑스럽게 설명할 수 있는 구조적 대안을 요구하기",
      "완벽한 하나의 제도를 영원히 외치기보다는, 변화하는 환경에 맞춰 서로 양보하고 조율해 가는 대화 의지 키우기"
    ]
  }
];

function WrapUpCard({ card, wide = false }) {
  let toneClass = "border-gray-200 bg-white";
  let iconClass = "bg-gray-100 text-gray-700";

  if (card.tone === "blue") {
    toneClass = "border-blue-200 bg-white shadow-brand/5";
    iconClass = "bg-brand-soft text-brand";
  } else if (card.tone === "rust") {
    toneClass = "border-red-200 bg-white";
    iconClass = "bg-red-50 text-red-600";
  } else if (card.tone === "green") {
    toneClass = "border-emerald-200 bg-white";
    iconClass = "bg-emerald-50 text-emerald-600";
  } else if (card.tone === "gold") {
    toneClass = "border-amber-200 bg-white";
    iconClass = "bg-amber-50 text-amber-600";
  }

  return (
    <section className={`panel p-6 border rounded-3xl shadow-1 ${toneClass} ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${iconClass}`}>
          {card.icon}
        </span>
        <h2 className="text-base font-bold text-brand-ink font-serif">{card.title}</h2>
      </div>
      <ul className="space-y-2.5">
        {card.items.map((item, index) => (
          <li key={index} className="text-xs text-gray-600 leading-relaxed font-serif flex gap-2">
            <span className="text-gray-400 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function WrapUpPage() {
  const [reflection, setReflection] = useState(() => {
    return localStorage.getItem("whoami:reflection") || "";
  });

  const handleSaveReflection = (e) => {
    const text = e.target.value;
    setReflection(text);
    localStorage.setItem("whoami:reflection", text);
  };

  const closePage = () => {
    window.close();
    if (!window.closed) {
      window.location.hash = "";
    }
  };

  return (
    <main className="min-h-screen bg-canvas p-6 md:p-12 space-y-8 select-none">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto border-b-2 border-brand pb-6 mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <span className="text-xs font-bold text-brand uppercase tracking-widest">Class Wrap-up</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-brand-ink mt-2">
            정의로운 사회를 위한 성찰과 연대
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-serif">
            롤스의 무지의 베일을 걷어내며 우리 마음속에 새겨야 할 민주 시민의 가치입니다.
          </p>
        </div>
        <button 
          type="button" 
          onClick={closePage} 
          className="button-secondary border-brand text-brand hover:bg-brand-soft h-12 px-6 rounded-xl font-bold"
        >
          마무리 닫기
        </button>
      </header>

      {/* Top 3 grids */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {topCards.map(card => (
          <WrapUpCard key={card.title} card={card} />
        ))}
      </div>

      {/* Bottom 2 grids */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {bottomCards.map(card => (
          <WrapUpCard key={card.title} card={card} wide />
        ))}
      </div>

      {/* Quote citation */}
      <div className="max-w-3xl mx-auto text-center py-8">
        <blockquote className="font-serif italic text-2xl text-brand-ink font-bold leading-normal">
          “정의는 사회 제도의 첫 번째 덕목이다. 그것은 진리가 사상 체계의 으뜸 덕목인 것과 같다.”
        </blockquote>
        <cite className="block text-xs font-bold uppercase tracking-widest text-brand mt-2 not-italic">
          존 롤스 (John Rawls, 정의론)
        </cite>
      </div>

      {/* Write class reflection (persists in localStorage) */}
      <section className="max-w-2xl mx-auto p-6 bg-white border border-brand/10 rounded-3xl shadow-2">
        <label className="field-label block font-serif text-sm">
          ✍ 오늘의 수업 회고 한 줄 적기 (작성 내용은 내 브라우저에 저장됩니다)
          <textarea
            value={reflection}
            onChange={handleSaveReflection}
            placeholder="오늘 무지의 베일 뒤에서 사회 제도를 설계하고 나의 새로운 역할을 마주하며 무엇을 느꼈는지 한 줄로 기록해 보세요..."
            className="field-control mt-2 text-sm font-serif min-h-[96px] leading-relaxed resize-none p-3.5"
            spellCheck={false}
          />
        </label>
      </section>

    </main>
  );
}
