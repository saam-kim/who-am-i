import { useEffect, useMemo, useState } from "react";
import {
  BUDGET_DIRECTION_OPTIONS,
  SESSION_PHASES,
  TAX_POLICY_OPTIONS,
  WAGE_POLICY_OPTIONS,
  getTaxPolicy,
  getBudgetDirection,
  getWagePolicy,
  useGameData
} from "./useGameData";
import { getLessonPhaseGuide } from "./lessonFlow";
import BrandMark from "./components/BrandMark";
import Stepper from "./components/Stepper";
import Timer from "./components/Timer";
import PolicyChoiceCard from "./components/PolicyChoiceCard";
import FutureSelfCard from "./components/FutureSelfCard";
import EventCard from "./components/EventCard";

const SUBMIT_CHECKS = [
  "가장 불리한 위치에 태어나도 받아들일 수 있는 규칙인가요?",
  "세금 부담과 예산 방향을 납득할 수 있게 정했나요?",
  "최저임금 방향이 노동자와 고용자 모두에게 감당 가능한가요?"
];

const formatTaxPolicy = constitution => getTaxPolicy(constitution).label;
const formatBudgetDirection = constitution => getBudgetDirection(constitution).label;
const formatWagePolicy = constitution => getWagePolicy(constitution).label;

const DISCUSSION_CARDS = [
  {
    title: "무지의 베일 뒤에 서기",
    body: "내가 내일 아침 눈을 떴을 때, 어떤 계층(부자, 보통 사람, 가난한 사람)으로 살아가게 될지 전혀 알 수 없다면, 어떤 세상의 원칙을 세우겠습니까?",
    prompt: "내 이익이 아니라 '누구나 동의할 수 있는' 규칙을 고민해 봅니다."
  },
  {
    title: "세금과 예산의 딜레마",
    body: "세금을 줄여 개인의 자유로운 경제 활동을 촉진하고 일자리를 늘릴 것인가, 아니면 복지 예산을 늘려 최저 생활 안전망을 보장할 것인가?",
    prompt: "각 선택이 불러올 긍정적 측면과 부정적 그늘을 비교 토론합니다."
  },
  {
    title: "최저임금의 양날의 검",
    body: "시장에 맡겨 더 많은 일자리 기회를 우선시할 것인가, 아니면 일하는 사람이 인간다운 품위를 지킬 수 있도록 높은 시급을 보장할 것인가?",
    prompt: "노동자와 작은 가게 사장님의 입장을 함께 고민해 봅니다."
  }
];

function PolicySummary({ constitution }) {
  return (
    <ul className="space-y-2 text-sm font-serif">
      <li className="flex items-center gap-2">
        <span className="font-bold text-brand">• 세금:</span> 
        <span className="text-gray-700">{formatTaxPolicy(constitution)}</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="font-bold text-brand">• 예산 방향:</span> 
        <span className="text-gray-700">{formatBudgetDirection(constitution)}</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="font-bold text-brand">• 최저임금:</span> 
        <span className="text-gray-700">{formatWagePolicy(constitution)}</span>
      </li>
    </ul>
  );
}

function getStudentInsights(result) {
  if (!result) return [];

  const survival =
    result.survivalIndex >= 80
      ? {
          status: "가장 불리한 시민도 기본 생활을 지킬 가능성이 큽니다.",
          body: "생계, 의료, 주거 같은 최소한의 안전망이 비교적 두텁게 마련된 사회입니다. 위기에 놓인 시민이 한 번의 실패로 무너지지 않을 가능성이 커졌습니다. 다만 이 보호를 위해 누가 어떤 부담을 나누는지까지 함께 설명해야 합니다.",
          question: "이 보호가 누구에게 가장 필요하고, 그 비용은 어떻게 나누면 공정할까요?"
        }
      : result.survivalIndex >= 60
        ? {
            status: "기본 생활은 가능하지만 불안정한 부분이 남아 있습니다.",
            body: "최소한의 안전망은 있지만, 실직·질병·주거 불안 같은 상황이 오면 가장 불리한 시민이 흔들릴 수 있습니다. 이 사회를 무지의 베일 뒤에서도 선택하려면 어떤 보호 장치를 더 보완해야 하는지 따져봐야 합니다.",
            question: "어떤 시민이 가장 먼저 어려움을 겪고, 무엇을 보완해야 할까요?"
          }
        : {
            status: "가장 불리한 위치에서는 생활 안정이 부족할 수 있습니다.",
            body: "성장이나 자유를 우선한 대신, 생계와 의료, 주거를 스스로 감당하기 어려운 시민에게 위험이 커질 수 있습니다. 내가 그 위치에 놓인다면 이 규칙을 받아들일 수 있는지 다시 물어봐야 합니다.",
            question: "가장 불리한 시민에게 이 사회를 어떻게 설명할 수 있을까요?"
          };

  const freedom =
    result.assetGrowth >= 0
      ? {
          status: "경제 활동의 자유가 넉넉히 유지됩니다.",
          body: "세금과 규제가 비교적 가볍게 느껴져 투자, 창업, 자산 형성의 여지가 큽니다. 노력의 보상이 잘 보이는 사회일 수 있지만, 이 자유가 생활이 불안한 시민에게도 기회로 이어지는지 확인해야 합니다.",
          question: "누가 더 자유로워지고, 그 자유에서 소외되는 시민은 없을까요?"
        }
      : result.assetGrowth >= -15
        ? {
            status: "공동체 부담과 경제 활동의 자유를 함께 따져볼 필요가 있습니다.",
            body: "복지와 사회 안정을 위해 어느 정도 부담을 나누지만, 경제 활동의 동기를 완전히 꺾는 수준은 아닙니다. 이 균형이 설득력을 가지려면 세금을 내는 시민에게도 이유가 분명해야 합니다.",
            question: "이 부담은 공동체를 위해 납득 가능한 수준인가요?"
          }
        : {
            status: "사회적 보장을 강화한 대신 경제 활동에 큰 부담이 생길 수 있습니다.",
            body: "가장 불리한 시민을 보호하는 힘은 커졌지만, 소득이 높거나 고용을 책임지는 시민은 노력의 보상이 줄었다고 느낄 수 있습니다. 평등을 위해 줄어든 자유를 어디까지 받아들일 수 있는지 논의해야 합니다.",
            question: "평등을 위해 제한된 자유를 어떤 시민이 가장 크게 느낄까요?"
          };

  const integration =
    result.socialIntegration >= 80
      ? {
          status: "서로 같은 규칙을 받아들일 가능성이 큽니다.",
          body: "계층 간 격차와 갈등이 비교적 낮아, 서로 다른 위치의 시민도 같은 제도를 공정하다고 느낄 여지가 큽니다. 이제 왜 이 균형이 우연이 아니라 공정한 설계인지 근거를 말해야 합니다.",
          question: "다른 위치의 시민에게도 이 규칙을 설득할 수 있을까요?"
        }
      : result.socialIntegration >= 60
        ? {
            status: "함께 살아갈 수 있지만 갈등을 줄일 보완이 필요합니다.",
            body: "사회 전체가 크게 흔들리지는 않지만, 어떤 시민은 혜택보다 부담을 더 크게 느낄 수 있습니다. 2차 토론에서는 가장 불만을 가질 시민이 누구인지 찾아보고, 그 시민에게 답할 수 있어야 합니다.",
            question: "어떤 시민이 이 제도에 가장 불만을 가질까요?"
          }
        : {
            status: "서로가 같은 규칙을 공정하다고 받아들이기 어려울 수 있습니다.",
            body: "계층 사이의 차이가 커져 공동체가 같은 방향으로 움직이기 어려운 사회입니다. 한쪽에는 자유나 이익이 커졌지만, 다른 쪽에는 불안과 박탈감이 커졌을 가능성이 있습니다.",
            question: "누구에게 혜택이 가고, 누구에게 부담이 커졌나요?"
          };

  return [
    {
      title: "가장 불리한 시민도 버틸 수 있는가?",
      ...survival
    },
    {
      title: "경제 활동의 자유는 얼마나 남아 있는가?",
      ...freedom
    },
    {
      title: "모두가 이 규칙을 받아들일 수 있는가?",
      ...integration
    }
  ];
}

function StudentInsightCards({ result }) {
  const insights = getStudentInsights(result);
  if (!insights.length) return null;

  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl mt-8">
      <div className="border-b border-gray-100 pb-4 mb-4">
        <p className="panel-label">우리 선택이 만든 결과</p>
        <h2 className="panel-heading text-xl mt-1">1차 설계 결과 살펴보기</h2>
        <p className="text-gray-500 text-sm mt-1 font-serif">
          우리 선택이 만든 사회를 세 가지 기준으로 읽어 봅니다. 점수가 아니라, 누구의 삶이 안정되고 누구에게 부담이 생기는지 살펴보세요.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map(insight => (
          <article key={insight.title} className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="chip chip-cobalt text-[10px] px-2 py-0.5 font-bold mb-3">{insight.title}</span>
              <h3 className="text-base font-bold text-brand-ink mb-2 leading-snug">{insight.status}</h3>
              <p className="text-gray-600 text-xs leading-relaxed font-serif mb-4">{insight.body}</p>
            </div>
            <strong className="text-xs text-brand leading-snug font-serif pt-3 border-t border-dashed border-gray-200">
              Q. {insight.question}
            </strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventCards({ cards = [] }) {
  if (!cards.length) return null;

  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl mt-8">
      <div className="border-b border-gray-100 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="panel-label">오늘의 사회 뉴스</p>
          <h2 className="panel-heading text-xl mt-1">우리 사회 설계가 만든 사건</h2>
        </div>
        <div className="text-xs font-serif text-gray-500 bg-brand-soft/50 border border-brand/10 px-3.5 py-2 rounded-xl max-w-sm">
          내 역할 말고 다른 시민 한 명을 골라 보세요. 그 시민도 이 사회를 공정하다고 느낄 수 있을까요?
        </div>
      </div>
      <div className="event-grid">
        {cards.map((card, index) => (
          <EventCard key={`${card.title}-${index}`} card={card} index={index} />
        ))}
      </div>
    </section>
  );
}

function StudentPhaseGuide({ phase, submitted, inputOpen }) {
  const guide = getLessonPhaseGuide(phase);
  const waitingMessage = submitted
    ? "제출은 완료되었습니다. 다른 모둠이 마칠 때까지 발표에 쓸 이유를 정리하세요."
    : inputOpen
      ? "지금은 선택하고 제출하는 시간입니다. 선택 이유를 말로 확인한 뒤 제출하세요."
      : "지금은 토론과 해석의 시간입니다. 화면을 읽고 모둠 의견을 먼저 맞추세요.";

  return (
    <section className="p-6 bg-brand-soft/30 border border-brand/10 rounded-3xl flex flex-col md:flex-row justify-between gap-6">
      <div className="max-w-xl">
        <p className="panel-label">지금 할 일</p>
        <h2 className="text-xl font-bold text-brand-ink mt-1 font-serif">{guide.title}</h2>
        <p className="text-gray-700 text-sm leading-relaxed mt-2 font-serif">{guide.studentTask}</p>
      </div>
      <div className="md:w-72 flex flex-col justify-between p-4 bg-white/70 border border-brand/5 rounded-2xl">
        <p className="text-xs text-gray-600 font-serif leading-normal">{waitingMessage}</p>
        <strong className="text-xs text-brand mt-2 leading-relaxed block font-serif">
          ★ {guide.prompt}
        </strong>
      </div>
    </section>
  );
}

function PresentationStepCard({ label, children, prompt }) {
  return (
    <div className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col justify-between min-h-[220px]">
      <div>
        <p className="panel-label">{label}</p>
        <div className="mt-3">
          {children}
        </div>
      </div>
      <div className="mt-4 text-xs font-serif text-brand-ink bg-brand-soft px-3 py-2 rounded-xl border border-brand/10">
        {prompt}
      </div>
    </div>
  );
}

function PresentationCard({ group }) {
  const firstRound = group?.history?.[0];
  const result = group?.result ?? group?.history?.[0]?.result;
  const eventCards = result?.eventCards ?? [];

  if (!firstRound && !result) {
    return (
      <section className="panel p-6 bg-white border border-gray-200 rounded-3xl mt-8">
        <p className="panel-label">발표 준비 카드</p>
        <h2 className="panel-heading text-xl mt-1">우리 모둠 발표 흐름</h2>
        <p className="status-callout mt-4 text-sm justify-center">
          1차 결과와 2차 설계가 쌓이면 발표에 사용할 카드가 이 화면에 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl mt-8 animate-fadeIn">
      <div className="border-b border-gray-100 pb-4 mb-4">
        <p className="panel-label">발표 준비 카드</p>
        <h2 className="panel-heading text-xl mt-1 font-serif">우리 모둠 발표 흐름</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PresentationStepCard
          label="1차 설계"
          prompt="왜 이 선택을 했는지, 다른 선택을 하지 않은 이유를 설명하세요."
        >
          <PolicySummary constitution={firstRound?.constitution ?? group.constitution} />
        </PresentationStepCard>

        <PresentationStepCard
          label="미래의 나"
          prompt="1차 설계가 나의 생활에 어떤 영향을 주었는지 말하세요."
        >
          <p className="font-bold text-gray-800 font-serif">
            {group.assignedClass?.label ?? firstRound?.assignedClass?.label ?? "아직 공개 전"}
          </p>
        </PresentationStepCard>

        <PresentationStepCard
          label="오늘의 사회 뉴스"
          prompt="사건 하나를 골라, 이 사회가 누구에게 유리하고 불리한지 설명하세요."
        >
          <ul className="space-y-1.5 text-xs text-gray-600 font-serif">
            {eventCards.slice(0, 3).map((card, index) => (
              <li key={`${card.title}-${index}`} className="truncate">
                • {card.title}
              </li>
            ))}
            {eventCards.length === 0 && <li>사건 카드가 공개되면 정리하세요.</li>}
          </ul>
        </PresentationStepCard>

        <PresentationStepCard
          label="2차 설계"
          prompt="달라진 선택은 무엇이고 왜 바꾸었는지, 혹은 유지한 이유는 무엇인지 설명하세요."
        >
          <PolicySummary constitution={group.constitution} />
        </PresentationStepCard>
      </div>
    </section>
  );
}

function PolicyChoiceControl({ 
  label, 
  valueLabel, 
  options, 
  selectedKey, 
  disabled, 
  onChange,
  firstRoundKey,
  isSecondConstitution
}) {
  return (
    <section className="control-card p-6 bg-white border border-gray-200 rounded-3xl shadow-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-extrabold text-brand-ink">{label}</h2>
          
          {/* Causal/Revision badge */}
          {isSecondConstitution && firstRoundKey && (
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              1차 선택: {options.find(opt => opt.key === firstRoundKey)?.label || ""}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isSecondConstitution && (
            selectedKey === firstRoundKey ? (
              <span className="chip chip-cobalt text-[10px] px-2 py-0.5 font-bold">유지</span>
            ) : (
              <span className="chip chip-coral text-[10px] px-2 py-0.5 font-bold">변경됨</span>
            )
          )}
          <div className="text-brand font-extrabold text-sm px-2.5 py-1 rounded bg-brand-soft">
            {valueLabel}
          </div>
        </div>
      </div>

      <div className="choice-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map(option => {
          const active = option.key === selectedKey;

          return (
            <PolicyChoiceCard
              key={option.key}
              option={option}
              active={active}
              disabled={disabled}
              onSelect={onChange}
            />
          );
        })}
      </div>
    </section>
  );
}

export default function StudentApp({
  pin,
  groupId,
  preview = false,
  presentationOnly = false,
  presentationExample = false
}) {
  const {
    group: liveGroup,
    groups: allGroups,
    loading,
    phase,
    inputOpen,
    remainingSeconds,
    connectGroup,
    updateConstitution,
    submitConstitution
  } = useGameData(presentationExample ? "" : pin, preview || presentationExample ? null : groupId);

  const [constitution, setConstitution] = useState({
    taxPolicy: "shared",
    taxRate: 35,
    budgetDirection: "opportunity",
    welfareBudget: 28,
    wagePolicy: "gradual",
    minimumWage: 11000
  });
  const [checkedItems, setCheckedItems] = useState([]);
  const [checklistOpen, setChecklistOpen] = useState(true);

  useEffect(() => {
    if (!preview && !presentationOnly && !presentationExample) {
      connectGroup();
    }
  }, [preview, presentationOnly, presentationExample]);

  useEffect(() => {
    if (liveGroup?.constitution) {
      const taxPolicy = getTaxPolicy(liveGroup.constitution);
      const budgetDirection = getBudgetDirection(liveGroup.constitution);
      const wagePolicy = getWagePolicy(liveGroup.constitution);
      setConstitution({
        ...liveGroup.constitution,
        taxPolicy: taxPolicy.key,
        taxRate: taxPolicy.taxRate,
        budgetDirection: budgetDirection.key,
        welfareBudget: budgetDirection.welfareBudget,
        wagePolicy: wagePolicy.key,
        minimumWage: wagePolicy.minimumWage
      });
    }
  }, [liveGroup?.constitution]);

  useEffect(() => {
    if (inputOpen && !liveGroup?.isSubmitted) {
      setCheckedItems([]);
    }
  }, [phase, liveGroup?.isSubmitted, inputOpen]);

  const previewGroup = useMemo(() => ({
    id: "preview",
    name: "학생용 화면 미리보기",
    connected: true,
    isSubmitted: false,
    constitution,
    history: []
  }), [constitution]);

  const SAMPLE_PRESENTATION_GROUP = {
    id: "group_sample",
    name: "샘플 모둠",
    connected: true,
    isSubmitted: true,
    assignedClass: {
      label: "자영업자",
      headline: "동네에서 음식점을 운영하는 모둠장 부모님",
      situation: "최근 인상된 시급과 공공요금으로 운영에 많은 고민을 하십니다.",
      priority: "운영 비용 절감, 임금 지원책, 안정적인 지역 상권 활성화"
    },
    constitution: {
      taxPolicy: "shared",
      taxRate: 35,
      budgetDirection: "basic",
      welfareBudget: 42,
      wagePolicy: "gradual",
      minimumWage: 11000
    },
    history: [
      {
        constitution: {
          taxPolicy: "low",
          taxRate: 18,
          budgetDirection: "growth",
          welfareBudget: 12,
          wagePolicy: "market",
          minimumWage: 9000
        },
        assignedClass: {
          label: "자영업자"
        }
      }
    ]
  };

  const group = presentationExample ? SAMPLE_PRESENTATION_GROUP : preview ? previewGroup : liveGroup;
  const visibleResult = group?.result ?? group?.history?.[0]?.result;
  const submitted = Boolean(group?.isSubmitted);
  const controlsDisabled = presentationOnly ? true : preview ? false : submitted || !inputOpen;
  const allChecked = new Set(checkedItems).size === SUBMIT_CHECKS.length;

  const canSubmit = useMemo(() => {
    return (
      inputOpen &&
      TAX_POLICY_OPTIONS.some(
        option => option.key === getTaxPolicy(constitution).key
      ) &&
      BUDGET_DIRECTION_OPTIONS.some(
        option => option.key === getBudgetDirection(constitution).key
      ) &&
      WAGE_POLICY_OPTIONS.some(
        option => option.key === getWagePolicy(constitution).key
      ) &&
      allChecked &&
      !preview &&
      !presentationOnly
    );
  }, [constitution, inputOpen, allChecked, preview, presentationOnly]);

  // Count selection completeness
  const selectionsMade = useMemo(() => {
    let count = 0;
    if (constitution.taxPolicy) count++;
    if (constitution.budgetDirection) count++;
    if (constitution.wagePolicy) count++;
    return count;
  }, [constitution]);

  const changeValue = async patch => {
    const next = { ...constitution, ...patch };
    setConstitution(next);
    if (!preview && !presentationOnly && !presentationExample) {
      await updateConstitution(next);
    }
  };

  const handleSubmit = async () => {
    if (preview || presentationOnly) return;
    await submitConstitution(constitution);
  };

  // Submit counts for other groups
  const submittedGroupsCount = useMemo(() => {
    const list = Object.values(allGroups || {});
    return list.filter(g => g.isSubmitted).length;
  }, [allGroups]);

  const totalGroupsCount = useMemo(() => {
    return Object.keys(allGroups || {}).length;
  }, [allGroups]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas text-xl font-bold text-brand font-serif">
        <div className="flex flex-col items-center gap-4">
          <BrandMark size="lg" className="animate-spin duration-[4000ms]" />
          <span>사회 설계 회의장 입장 중...</span>
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-canvas text-center font-serif">
        <div className="max-w-md p-8 bg-white rounded-3xl border border-gray-200 shadow-2">
          <h2 className="text-2xl font-bold text-red-600 mb-4">모둠 정보를 찾을 수 없습니다</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            이미 모둠이 확정되었거나 PIN 번호가 맞지 않습니다. 교사에게 문의 후 다시 접속해 주세요.
          </p>
          <button
            type="button"
            onClick={() => { window.location.hash = ""; window.location.reload(); }}
            className="button-secondary mt-6 h-12 px-6"
          >
            입장 화면으로 가기
          </button>
        </div>
      </main>
    );
  }

  if (presentationOnly) {
    return (
      <main className="student-page max-w-5xl bg-canvas min-h-screen">
        <div className="student-content">
          <header className="student-header border-b border-gray-200 pb-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BrandMark size="lg" />
              <div>
                <p className="brand-kicker">발표 자료</p>
                <h1 className="brand-title text-2xl font-serif">{group.name} 활동 발표</h1>
              </div>
            </div>
          </header>
          <PresentationCard group={group} />
        </div>
      </main>
    );
  }

  // First round choices (history[0]) to render revision comparison badges
  const firstRoundConstitution = group.history?.[0]?.constitution;

  return (
    <main className="bg-canvas min-h-screen">
      
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 py-4 px-6 shadow-1 select-none">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Group Details */}
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                정의로운 사회 설계 시뮬레이터
              </p>
              <h1 className="text-lg font-extrabold text-brand-ink leading-tight">
                {group.name} 회의실
              </h1>
            </div>
          </div>

          {/* Stepper indicator (always visible) */}
          <div className="overflow-x-auto py-1 scrollbar-none">
            <Stepper currentPhase={phase} />
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <span className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                남은 시간
              </span>
              <Timer seconds={remainingSeconds} className="text-2xl" />
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-32">
        {preview && (
          <section className="status-callout bg-brand-soft border-brand text-brand-ink p-4 rounded-2xl text-sm leading-relaxed">
            💡 <strong>교사용 미리보기 모드</strong>입니다. 이 화면에서의 조작이나 제출은 실제 실시간 데이터베이스에 반영되지 않습니다.
          </section>
        )}

        <StudentPhaseGuide phase={phase} submitted={submitted} inputOpen={inputOpen} />

        {/* Phase specific content renders */}
        
        {/* Discussion Screen: 3 Issue Cards */}
        {phase === "discussion" && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {DISCUSSION_CARDS.map((card, i) => (
              <article key={i} className="p-6 bg-white border border-gray-200 rounded-3xl shadow-1 flex flex-col justify-between min-h-[280px] hover:shadow-2 transition-shadow">
                <div>
                  <span className="chip chip-cobalt text-[10px] px-2.5 py-0.5 font-bold mb-3">쟁점 {i + 1}</span>
                  <h3 className="text-lg font-bold text-brand-ink font-serif mb-2 leading-snug">{card.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-serif">{card.body}</p>
                </div>
                <strong className="text-xs text-brand leading-relaxed block font-serif pt-4 border-t border-dashed border-gray-100 mt-4">
                  ★ 토론 쟁점: {card.prompt}
                </strong>
              </article>
            ))}
          </section>
        )}

        <FutureSelfCard group={group} phase={phase} allGroups={allGroups} />
        
        <StudentInsightCards result={visibleResult} />
        
        <EventCards cards={visibleResult?.eventCards ?? []} />

        {/* Submission Warnings when inputs are closed */}
        {!preview && !inputOpen && !submitted && phase !== "discussion" && (
          <div className={`${phase === "secondDiscussion" ? "info-callout" : "danger-callout"} text-sm rounded-2xl`}>
            {phase === "secondDiscussion"
              ? "지금은 2차 토론 단계입니다. 역할 카드와 사건 카드를 바탕으로 어떤 정책을 수정할지 의논하세요."
              : "지금은 설정을 편집하는 시간이 아닙니다. 교사의 안내를 기다려 주세요."}
          </div>
        )}

        {/* Policy Choice Controls */}
        <div className="grid gap-6">
          {/* Progress bar indicating selections */}
          {inputOpen && !submitted && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-gray-500">정책 설계 완성도 ({selectionsMade}/3)</span>
              <div className="flex-1 max-w-md h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand rounded-full transition-all duration-300" 
                  style={{ width: `${(selectionsMade / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <PolicyChoiceControl
            label="세금 정책 방향"
            valueLabel={getTaxPolicy(constitution).shortLabel}
            options={TAX_POLICY_OPTIONS}
            selectedKey={getTaxPolicy(constitution).key}
            disabled={controlsDisabled}
            firstRoundKey={firstRoundConstitution?.taxPolicy}
            isSecondConstitution={phase === "revision"}
            onChange={option =>
              changeValue({
                taxPolicy: option.key,
                taxRate: option.taxRate
              })
            }
          />

          <PolicyChoiceControl
            label="국가 예산 방향"
            valueLabel={getBudgetDirection(constitution).shortLabel}
            options={BUDGET_DIRECTION_OPTIONS}
            selectedKey={getBudgetDirection(constitution).key}
            disabled={controlsDisabled}
            firstRoundKey={firstRoundConstitution?.budgetDirection}
            isSecondConstitution={phase === "revision"}
            onChange={option =>
              changeValue({
                budgetDirection: option.key,
                welfareBudget: option.welfareBudget
              })
            }
          />

          <PolicyChoiceControl
            label="최저임금 방향"
            valueLabel={getWagePolicy(constitution).shortLabel}
            options={WAGE_POLICY_OPTIONS}
            selectedKey={getWagePolicy(constitution).key}
            disabled={controlsDisabled}
            firstRoundKey={firstRoundConstitution?.wagePolicy}
            isSecondConstitution={phase === "revision"}
            onChange={option =>
              changeValue({
                wagePolicy: option.key,
                minimumWage: option.minimumWage
              })
            }
          />
        </div>

        {/* Presentation Cards shown only in final stage */}
        {phase === "final" && <PresentationCard group={group} />}

        {/* Collapsible checklist + Submission Controls */}
        {inputOpen && (
          <footer className="mt-8 space-y-6">
            {!submitted ? (
              <section className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2">
                <button
                  type="button"
                  onClick={() => setChecklistOpen(!checklistOpen)}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <div>
                    <span className="panel-label">제출 전 최종 점검</span>
                    <h2 className="text-lg font-extrabold text-brand-ink mt-0.5">
                      무지의 베일 체크리스트 (모두 점검해야 제출됩니다)
                    </h2>
                  </div>
                  <span className="text-xl font-bold text-gray-400">
                    {checklistOpen ? "▲" : "▼"}
                  </span>
                </button>

                {checklistOpen && (
                  <div className="mt-4 grid gap-3 animate-fadeIn">
                    {SUBMIT_CHECKS.map((item, index) => {
                      const checked = checkedItems.includes(index);

                      return (
                        <label 
                          key={item} 
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                            checked 
                              ? "bg-brand-soft/30 border-brand text-brand-ink" 
                              : "bg-red-50/30 border-red-100 text-red-900 hover:bg-red-50/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            className="w-5 h-5 accent-brand cursor-pointer"
                            onChange={event => {
                              setCheckedItems(current =>
                                event.target.checked
                                  ? [...new Set([...current, index])]
                                  : current.filter(value => value !== index)
                              );
                            }}
                          />
                          <span className="text-sm font-semibold">{item}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null}

            {/* Submission button with sweep gradient & arrow interaction */}
            <button
              type="button"
              disabled={!canSubmit || submitted}
              onClick={handleSubmit}
              className={`button-primary flex h-20 w-full items-center justify-center text-2xl font-bold rounded-2xl transition-all shadow-brand ${
                submitted 
                  ? "bg-success border-success shadow-none text-white cursor-default" 
                  : "bg-gradient-to-r from-brand via-brand to-brand-deep bg-[length:200%_100%] bg-left hover:bg-right hover:scale-[1.01]"
              }`}
            >
              {submitted ? (
                <div className="flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>설계 제출 완료 (대기 중)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span>이 설계로 제출하기</span>
                  <span className="transition-transform group-hover:translate-x-2 duration-300">➔</span>
                </div>
              )}
            </button>
            
            {/* Submitted Wait Screen with Counter */}
            {submitted && !preview && (
              <div className="p-6 bg-success-soft/50 border border-success/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div>
                  <h3 className="font-bold text-success text-base">다른 모둠을 기다리고 있습니다</h3>
                  <p className="text-xs text-gray-600 font-serif mt-1">
                    제출 완료 후, 모둠원들과 함께 우리가 고른 선택을 다시 점검하거나 발표 내용을 정리하세요.
                  </p>
                </div>
                <div className="px-5 py-2.5 bg-success rounded-2xl text-white font-bold">
                  제출 현황: {submittedGroupsCount} / {totalGroupsCount} 모둠
                </div>
              </div>
            )}
          </footer>
        )}

      </div>
    </main>
  );
}
