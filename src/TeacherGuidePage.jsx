import { getAppPath } from "./routes";
import { CLASSROOM_SIMULATIONS } from "./lessonFlow";

const flowItems = [
  {
    phase: "도입",
    time: "3분",
    title: "활동의 약속 확인",
    body: "오늘의 선택은 정답 맞히기가 아니라, 내가 어떤 사람이 될지 모르는 상태에서 모두에게 설명 가능한 사회 원칙을 찾아보는 과정이라고 안내합니다."
  },
  {
    phase: "1차 토론",
    time: "5분",
    title: "무지의 베일 뒤에서 설계하기",
    body: "학생들이 아직 자신의 위치를 모르는 상태에서 세금, 예산 방향, 최저임금 방향을 선택하게 합니다."
  },
  {
    phase: "1차 설계",
    time: "3분",
    title: "선택과 이유 제출",
    body: "각 선택지가 누구에게 어떤 부담과 혜택을 줄 수 있는지 근거를 짧게 말하게 한 뒤 제출하도록 합니다."
  },
  {
    phase: "역할 공개",
    time: "8분",
    title: "내가 사는 사회로 읽기",
    body: "공개된 미래의 나 카드 관점에서 1차 설계가 나의 삶에 어떤 영향을 주는지 확인합니다."
  },
  {
    phase: "2차 토론",
    time: "5분",
    title: "나와 타인 모두에게 설명하기",
    body: "사건 카드를 통해 다른 시민의 처지를 함께 고려하고, 기존 선택을 유지하거나 바꿀 이유를 논의합니다."
  },
  {
    phase: "발표",
    time: "15분",
    title: "설계 과정과 변화 설명",
    body: "1차 선택, 역할 공개 후 해석, 사건 카드, 2차 선택의 변화 또는 유지 이유를 중심으로 발표하게 합니다."
  }
];

const guideCards = [
  {
    title: "수업의 핵심",
    items: [
      "무지의 베일은 내 처지를 모르는 상태에서 공정한 원칙을 고민하게 하는 장치입니다.",
      "2차 설계는 자기 이익을 알게 된 뒤에도 타인에게 설명 가능한 선택을 유지할 수 있는지 묻는 단계입니다.",
      "결과보다 중요한 것은 선택을 바꾸거나 유지한 이유를 공정성의 언어로 설명하는 과정입니다."
    ]
  },
  {
    title: "교사의 주요 발문",
    items: [
      "이 선택은 가장 불리한 시민에게도 납득 가능한가요?",
      "내가 유리한 위치에 있다는 사실을 알고도 같은 원칙을 선택할 수 있나요?",
      "어떤 부담은 사회가 함께 나누어야 하고, 어떤 부담은 개인이 감당해야 한다고 보나요?"
    ]
  },
  {
    title: "운영 체크",
    items: [
      "학생용 화면을 먼저 보여주며 선택지가 숫자가 아니라 정책 방향임을 설명합니다.",
      "역할 공개 전에는 개인 역할을 추측하거나 배정하지 않도록 안내합니다.",
      "발표에서는 점수보다 선택의 변화, 근거, 타자 이해가 드러나도록 유도합니다."
    ]
  }
];

const presentationChecklist = [
  "1차 설계에서 선택한 세 가지 방향과 그 이유",
  "미래의 나 카드가 공개된 뒤 내 삶에 생긴 변화",
  "오늘의 사회 뉴스가 보여준 다른 시민의 처지",
  "2차 설계에서 바뀐 선택 또는 유지한 선택의 이유",
  "이 사회가 공정하다고 말할 수 있는 근거와 남은 고민"
];

export default function TeacherGuidePage() {
  const closePage = () => {
    window.close();

    if (!window.closed) {
      window.location.href = getAppPath();
    }
  };

  return (
    <main className="guide-page">
      <header className="guide-header">
        <div>
          <p className="brand-kicker">TEACHER GUIDE</p>
          <h1>Who am I : 정의로운 사회 만들기 활동 가이드</h1>
          <p>
            수업 중 교사가 학생용 화면과 발표 화면을 오가며 활동 흐름을 안내할 때 쓰는 진행용 자료입니다.
          </p>
        </div>
        <button type="button" onClick={closePage} className="button-secondary guide-close-button">
          닫기
        </button>
      </header>

      <section className="guide-card guide-intro-card">
        <p className="panel-label">활동 설명</p>
        <h2>학생들에게 먼저 이렇게 안내하세요</h2>
        <p>
          우리는 오늘 내가 부자인지, 가난한지, 노동자인지, 사업자인지 모르는 상태에서 사회의 기본 규칙을
          정해 봅니다. 이후 내가 어떤 시민인지 공개되면, 처음 만든 사회가 나에게도 타인에게도 공정한지
          다시 검토합니다.
        </p>
      </section>

      <section className="guide-flow-grid">
        {flowItems.map(item => (
          <article key={item.phase} className="guide-flow-card">
            <div className="guide-flow-meta">
              <span>{item.phase}</span>
              <strong>{item.time}</strong>
            </div>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="guide-three-grid">
        {guideCards.map(card => (
          <article key={card.title} className="guide-card">
            <h2>{card.title}</h2>
            <ul>
              {card.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="guide-card guide-simulation-section">
        <p className="panel-label">수업 리허설 피드백</p>
        <h2>세 번 돌려 보니 이런 장면이 생깁니다</h2>
        <div className="guide-simulation-grid mt-5">
          {CLASSROOM_SIMULATIONS.map(item => (
            <article key={item.round} className="guide-simulation-card">
              <p className="panel-label">{item.round}</p>
              <h3>{item.situation}</h3>
              <dl>
                <div>
                  <dt>교사 관점</dt>
                  <dd>{item.teacherFeedback}</dd>
                </div>
                <div>
                  <dt>학생 관점</dt>
                  <dd>{item.studentFeedback}</dd>
                </div>
                <div>
                  <dt>반영한 업그레이드</dt>
                  <dd>{item.upgrade}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className="guide-bottom-grid">
        <article className="guide-card">
          <p className="panel-label">발표 안내</p>
          <h2>발표에서 꼭 드러나야 할 것</h2>
          <ul>
            {presentationChecklist.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="guide-card guide-message-card">
          <p className="panel-label">마무리 메시지</p>
          <h2>오늘의 핵심 문장</h2>
          <p>
            공정한 사회는 나에게 유리한 사회가 아니라, 내가 어떤 위치에 있더라도 받아들일 수 있는 이유를
            가진 사회입니다.
          </p>
        </article>
      </section>
    </main>
  );
}
