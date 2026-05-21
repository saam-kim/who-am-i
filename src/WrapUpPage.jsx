import { getAppPath } from "./routes";

const topCards = [
  {
    tone: "blue",
    icon: "?",
    title: "베일 뒤의 질문",
    items: [
      "내가 어떤 위치에 놓일지 모른다면, 어떤 사회 원칙을 선택해야 할까요?",
      "가장 불리한 시민에게도 설명할 수 있는 선택이었나요?",
      "처음의 선택과 마지막 선택 사이에서, 우리의 판단은 어떻게 달라졌나요?",
      "나에게 좋은 사회와 모두에게 설명 가능한 사회는 어디에서 만나나요?"
    ]
  },
  {
    tone: "rust",
    icon: "!",
    title: "숫자 너머의 삶",
    items: [
      "세금, 예산, 최저임금은 표의 항목이 아니라 누군가의 월세와 병원비, 일자리와 시간을 바꾸는 규칙입니다.",
      "무지의 베일은 내 이익을 잠시 내려놓고, 서로 다른 삶 앞에서도 설명 가능한 이유를 찾게 합니다.",
      "오늘 우리가 만든 사회는 누군가에게는 기회가 되고, 누군가에게는 부담이 되었습니다.",
      "정의로운 선택은 그 부담을 보지 않는 것이 아니라, 왜 함께 나눌 수 있는지 답하는 일입니다."
    ]
  },
  {
    tone: "green",
    icon: "=",
    title: "공정함은 이유를 남긴다",
    items: [
      "공정한 사회는 모두에게 같은 결과를 약속하는 사회가 아니라, 차이를 정당화할 수 있는 이유를 요구하는 사회입니다.",
      "특히 가장 불리한 위치의 시민에게도 납득 가능한 제도인지 묻는 태도가 정의로운 사회의 출발점입니다.",
      "내가 손해 보는 위치에 서도 받아들일 수 있는 규칙인지 묻는 순간, 토론은 이익 계산을 넘어섭니다.",
      "정의는 한 번에 완성되는 답이 아니라, 더 나은 이유를 함께 찾아가는 과정입니다."
    ]
  }
];

const bottomCards = [
  {
    tone: "gold",
    icon: "§",
    title: "오늘의 생각 도구",
    items: [
      "롤스의 정의론: 사회의 기본 제도는 공정한 원칙 위에서 설계되어야 한다는 생각",
      "무지의 베일: 내가 어떤 처지가 될지 모르는 상태에서 사회 원칙을 정해 보는 사고 실험",
      "차등의 원칙: 불평등이 허용되려면 가장 불리한 사람에게도 이익이 되어야 한다는 원칙",
      "공정으로서의 정의: 모두가 받아들일 수 있는 절차와 이유를 통해 정의를 판단하는 관점",
      "사회 제도: 개인의 선의만이 아니라 규칙과 구조가 사람들의 삶을 바꾼다는 관점"
    ]
  },
  {
    tone: "blue",
    icon: "○",
    title: "함께 고쳐 가는 시민",
    items: [
      "내가 유리한 위치에 있을 때에도 제도의 부담을 함께 바라보기",
      "타인의 처지를 상상하고, 공정하다고 말할 수 있는 근거를 요구하기",
      "완벽한 정답보다 더 나은 규칙을 함께 다시 만들기"
    ]
  }
];

function WrapUpCard({ card, wide = false }) {
  return (
    <section className={`wrapup-card wrapup-card-${card.tone} ${wide ? "wide" : ""}`}>
      <div className="wrapup-card-title">
        <span className="wrapup-icon" aria-hidden="true">
          {card.icon}
        </span>
        <h2>{card.title}</h2>
      </div>
      <ul>
        {card.items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function WrapUpPage() {
  const closePage = () => {
    window.close();

    if (!window.closed) {
      window.location.href = getAppPath();
    }
  };

  return (
    <main className="wrapup-page">
      <header className="wrapup-header">
        <div>
          <p className="brand-kicker">CLASS WRAP-UP</p>
          <h1>정의로운 사회를 위한 선택</h1>
        </div>
        <button type="button" onClick={closePage} className="button-secondary wrapup-close-button">
          닫기
        </button>
      </header>

      <div className="wrapup-grid-top">
        {topCards.map(card => (
          <WrapUpCard key={card.title} card={card} />
        ))}
      </div>

      <div className="wrapup-grid-bottom">
        {bottomCards.map(card => (
          <WrapUpCard key={card.title} card={card} wide />
        ))}
      </div>

      <blockquote className="wrapup-quote">
        <p>“정의는 사회 제도의 첫 번째 덕목이다.”</p>
        <cite>존 롤스</cite>
      </blockquote>
    </main>
  );
}
