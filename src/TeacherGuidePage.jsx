import { getAppPath } from "./routes";
import { CLASSROOM_SIMULATIONS } from "./lessonFlow";
import BrandMark from "./components/BrandMark";

const flowItems = [
  {
    phase: "1. 토론",
    time: "5분",
    title: "무지의 베일 뒤에서 토론하기",
    body: "학생들이 아직 자신의 미래 위치를 모르는 상태에서 세 가지 쟁점 카드(세금, 예산, 최저임금)를 확인하며 어떤 사회가 공정한지 모둠원들과 이야기 나눕니다."
  },
  {
    phase: "2. 1차 설계",
    time: "5분",
    title: "첫 정책 설계 및 제출",
    body: "세금 세율, 복지 예산 배분, 최저임금 수준을 선택합니다. 모든 정책을 고르고 '무지의 베일 체크리스트' 3가지 점검 항목을 모두 통과한 뒤 최종 제출합니다."
  },
  {
    phase: "3. 역할 공개",
    time: "5분",
    title: "미래의 나 확인하기",
    body: "대시보드의 룰렛을 돌려 각 모둠의 미래 역할(상류층, 중산층, 빈곤층 등)을 부여합니다. 학생들은 베일을 걷어 1차 사회 제도가 내 삶에 미칠 결과를 확인합니다."
  },
  {
    phase: "4. 2차 토론",
    time: "5분",
    title: "사건과 타자 관점 토론",
    body: "오늘의 사회 뉴스(사건 카드 3개)를 해석하며, 특정 사건이 나의 역할뿐 아니라 다른 시민들의 삶에 미친 이익과 부담을 공유하고 공정함을 재평가합니다."
  },
  {
    phase: "5. 2차 설계",
    time: "4분",
    title: "정책 수정 및 발표 준비",
    body: "부여받은 역할과 사회 환경을 고려하여 1차 정책 설계를 그대로 유지할 것인지, 혹은 바꿀 것인지 결정하여 최종 제출하고 발표 자료를 자동으로 채웁니다."
  },
  {
    phase: "6. 발표",
    time: "15분",
    title: "설계 흐름 비교 및 발표",
    body: "역할별 비교 보드를 활용해 발표 모둠을 지정하고, 1차 설계 - 역할 공개 - 사건 카드 - 2차 설계 변화와 그 공정성 근거를 발표(모둠당 90초)하게 합니다."
  }
];

const guideCards = [
  {
    title: "수업의 핵심 메커니즘",
    items: [
      "무지의 베일은 내 처지를 모르는 상태에서 가장 불리한 시민에게도 납득할 만한 원칙을 고민하게 돕습니다.",
      "2차 설계는 내 이익을 알게 된 뒤에도, 다른 이들의 입장을 존중하는 합리적 약속을 지킬 수 있는지 묻습니다.",
      "결과 점수의 높고 낮음보다, 정책을 수정하거나 유지한 이유를 '공정성의 언어'로 대변하는 것이 목표입니다."
    ]
  },
  {
    title: "교사의 주요 진행 발문",
    items: [
      "우리가 설계한 규칙은 이 사회에서 가장 어렵게 살아가는 빈곤층에게도 정당화될 수 있습니까?",
      "내가 유리한 상류층이 된 사실을 알고 난 뒤에도, 여전히 처음 세운 세금 약속이 정당하다고 생각하나요?",
      "사회 제도의 부담은 누가 나누어야 하며, 혜택은 어떤 방식으로 돌아가야 모두가 동의할 수 있습니까?"
    ]
  },
  {
    title: "대시보드 운영 팁",
    items: [
      "모둠 확정을 누르기 전에 학생들이 모두 접속 완료했는지 실시간 현황에서 모둠별 칩을 확인하세요.",
      "룰렛(역할 공개)을 돌리면 3.5초간 슬롯이 회전한 뒤 카드가 뒤집히며 분위기를 극적으로 이끕니다.",
      "비교표의 행을 클릭하면 해당 모둠의 데이터가 상세 화면 및 전체화면 발표 창으로 바로 로드됩니다."
    ]
  }
];

const shortcutKeys = [
  { key: "Space", desc: "현재 수업 단계를 다음 단계로 즉시 이동합니다." },
  { key: "P", desc: "선택한 모둠의 발표 카드를 현재 화면에 전체화면(빔프로젝터용)으로 엽니다. (다시 누르면 닫힘)" },
  { key: "R", desc: "선택한 모둠의 미래의 나 룰렛 회전 애니메이션을 즉시 시작합니다." }
];

export default function TeacherGuidePage() {
  const closePage = () => {
    window.close();
    if (!window.closed) {
      window.location.hash = "";
    }
  };

  return (
    <main className="min-h-screen bg-canvas p-6 md:p-12 print:bg-white print:p-0">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto border-b-2 border-brand pb-6 mb-8 flex justify-between items-start print:mb-4">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <span className="text-xs font-bold text-brand uppercase tracking-widest">Teacher Guide</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-brand-ink mt-2">
            Who am I : 정의로운 사회 만들기 활동 가이드
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-serif">
            수업을 스무스하게 진행할 수 있도록 설계된 교사용 참고 지도안 및 단축키 안내입니다.
          </p>
        </div>
        <button 
          type="button" 
          onClick={closePage} 
          className="button-secondary border-brand text-brand hover:bg-brand-soft h-12 px-6 rounded-xl font-bold print:hidden"
        >
          가이드 닫기
        </button>
      </header>

      {/* Grid: Timing & Flow */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2 print:shadow-none">
          <p className="panel-label">수업 타임라인 가이드</p>
          <h2 className="text-xl font-bold text-brand-ink mt-1 font-serif">50분 수업 흐름 요약</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {flowItems.map(item => (
              <article key={item.phase} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-brand">{item.phase}</span>
                    <span className="chip chip-coral py-0.5 px-2 text-[10px] font-bold">{item.time}</span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-ink leading-tight font-serif mb-2">{item.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-serif">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Dashboard Shortcut keys */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2 print:shadow-none">
          <p className="panel-label">신속 제어 기능</p>
          <h2 className="text-xl font-bold text-brand-ink mt-1 font-serif">대시보드 단축키 모음</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {shortcutKeys.map(sk => (
              <div key={sk.key} className="p-4 border border-gray-100 rounded-xl flex items-start gap-4">
                <kbd className="px-3 py-1.5 bg-brand-soft text-brand border border-brand/20 font-bold rounded-lg text-sm font-mono shadow-1 select-none">
                  {sk.key}
                </kbd>
                <div className="flex-1">
                  <p className="text-xs text-gray-700 leading-normal font-serif font-semibold mt-1">
                    {sk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core items & guides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guideCards.map(card => (
            <article key={card.title} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2 print:shadow-none">
              <h2 className="text-base font-bold text-brand-ink border-b border-gray-100 pb-3 mb-3 font-serif">
                {card.title}
              </h2>
              <ul className="space-y-3">
                {card.items.map((item, index) => (
                  <li key={index} className="text-xs text-gray-600 leading-relaxed font-serif flex gap-2">
                    <span className="text-brand font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Simulations */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2 print:shadow-none">
          <p className="panel-label">수업 리허설 피드백</p>
          <h2 className="text-xl font-bold text-brand-ink mt-1 mb-6 font-serif">실제 시뮬레이션 돌려보기 (수정사항 반영)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLASSROOM_SIMULATIONS.map(item => (
              <article key={item.round} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                <span className="chip chip-cobalt text-[10px] px-2 py-0.5 font-bold">{item.round}</span>
                <h3 className="text-sm font-bold text-brand-ink leading-tight font-serif">{item.situation}</h3>
                
                <dl className="space-y-2 text-xs">
                  <div>
                    <dt className="font-bold text-brand-ink font-serif">• 교사 관점 피드백:</dt>
                    <dd className="text-gray-600 leading-relaxed font-serif mt-0.5">{item.teacherFeedback}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-brand-ink font-serif">• 학생 관점 피드백:</dt>
                    <dd className="text-gray-600 leading-relaxed font-serif mt-0.5">{item.studentFeedback}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-success font-serif">• 업그레이드 조치:</dt>
                    <dd className="text-success leading-relaxed font-serif mt-0.5">{item.upgrade}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Printable adjustment style */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 12px;
          }
          .guide-page {
            padding: 0 !important;
          }
          .button-secondary, .button-primary {
            display: none !important;
          }
        }
      `}</style>
      
    </main>
  );
}
