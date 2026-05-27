import { useEffect, useMemo, useRef, useState } from "react";
import {
  SESSION_PHASES,
  getPhaseDefaultSeconds,
  getTaxPolicy,
  getBudgetDirection,
  getWagePolicy,
  useGameData,
  FUTURE_SELF_CARDS
} from "./useGameData";
import { getAppPath } from "./routes";
import { getLessonPhaseGuide } from "./lessonFlow";
import BrandMark from "./components/BrandMark";
import Timer from "./components/Timer";
import ComparisonChip from "./components/ComparisonChip";
import RoleReveal from "./components/RoleReveal";
import StudentApp from "./StudentApp"; // Used to render in fullscreen presentation
import Toast from "./components/Toast";

const TEACHER_PIN = "1234";
const AUTO_CREATE_LOCK_KEY = "constitution-game:auto-create-lock";

const formatTime = seconds => {
  const safeSeconds = Math.max(0, seconds ?? 0);
  const m = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const s = String(safeSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const csvEscape = value => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const formatDateTime = value => {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
};

const phaseLabel = phase =>
  SESSION_PHASES.find(item => item.key === phase)?.label ?? "토론";

const formatTaxPolicy = constitution => getTaxPolicy(constitution).label;
const formatBudgetDirection = constitution => getBudgetDirection(constitution).label;
const formatWagePolicy = constitution => getWagePolicy(constitution).label;

const downloadDetailedCsv = ({ pin, groups }) => {
  const headers = [
    "세션 PIN",
    "모둠",
    "접속 상태",
    "제출 상태",
    "제출 시각",
    "1차 세금 정책 방향",
    "1차 국가 예산 방향",
    "1차 최저임금 방향",
    "최종 세금 정책 방향",
    "최종 국가 예산 방향",
    "최종 최저임금 방향",
    "미래 위치",
    "가장 불리한 시민도 버틸 수 있는가?",
    "경제 활동의 자유는 얼마나 남아 있는가?",
    "모두가 이 규칙을 받아들일 수 있는가?",
    "역할 관점 해석",
    "역할 관점 메시지",
    "사건 카드 1",
    "사건 카드 2",
    "사건 카드 3"
  ];

  const rows = groups.map(group => {
    const firstRound = group.history?.[0];
    const firstConstitution = firstRound?.constitution ?? {};
    const eventCards = group.result?.eventCards ?? [];

    return [
      pin,
      group.name,
      group.connected ? "접속" : "미접속",
      group.isSubmitted ? "제출 완료" : "작성 중",
      formatDateTime(group.submittedAt),
      firstRound ? formatTaxPolicy(firstConstitution) : "",
      firstRound ? formatBudgetDirection(firstConstitution) : "",
      firstRound ? formatWagePolicy(firstConstitution) : "",
      formatTaxPolicy(group.constitution),
      formatBudgetDirection(group.constitution),
      formatWagePolicy(group.constitution),
      group.assignedClass?.label,
      group.result ? (group.result.survivalIndex >= 80 ? "기본 생활을 지킬 가능성이 높습니다." : group.result.survivalIndex >= 60 ? "기본 생활은 가능하지만 불안정합니다." : "생활 안정 장치가 부족합니다.") : "",
      group.result ? (group.result.assetGrowth >= 0 ? "자유가 넉넉히 유지됩니다." : group.result.assetGrowth >= -15 ? "자유의 균형이 필요합니다." : "자유에 큰 부담이 생길 수 있습니다.") : "",
      group.result ? (group.result.socialIntegration >= 80 ? "규칙 수용 가능성이 높습니다." : group.result.socialIntegration >= 60 ? "보완이 필요합니다." : "갈등 위험이 큽니다.") : "",
      group.result?.classResult?.label,
      group.result?.classResult?.message,
      eventCards[0] ? `${eventCards[0].title} - ${eventCards[0].question}` : "",
      eventCards[1] ? `${eventCards[1].title} - ${eventCards[1].question}` : "",
      eventCards[2] ? `${eventCards[2].title} - ${eventCards[2].question}` : ""
    ];
  });

  const csv = [headers, ...rows]
    .map(row => row.map(csvEscape).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `WhoAmI_정의로운사회만들기_수업기록_${pin || "session"}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function InterpretationCard({ title, status, body, question }) {
  return (
    <article className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col justify-between">
      <div>
        <span className="chip chip-cobalt text-[10px] px-2.5 py-0.5 font-bold mb-3">{title}</span>
        <h3 className="text-base font-bold text-brand-ink mb-2 leading-snug">{status}</h3>
        <p className="text-gray-600 text-xs leading-relaxed font-serif mb-4">{body}</p>
      </div>
      <strong className="text-xs text-brand leading-snug font-serif pt-3 border-t border-dashed border-gray-200">
        Q. {question}
      </strong>
    </article>
  );
}

function TimerStartPanel({
  groupLocked,
  isRunning,
  phase,
  remainingSeconds,
  defaultSeconds,
  onStart,
  onSetTime,
  autoStartTimer,
  setAutoStartTimer
}) {
  const [minutesInput, setMinutesInput] = useState("");
  const phaseName = phaseLabel(phase);

  const applyMinutes = event => {
    event.preventDefault();
    if (minutesInput.trim() === "") return;
    const minutes = Number(minutesInput);
    if (!Number.isFinite(minutes) || minutes < 0) return;
    onSetTime(Math.round(minutes * 60));
    setMinutesInput("");
  };

  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl shadow-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <span className="panel-label">수업 타이머</span>
          <h2 className="text-2xl font-bold text-brand-ink mt-1">
            {isRunning ? "타이머 진행 중" : "수업 시작 대기"}
          </h2>
          <p className="mt-2 text-xs font-serif text-gray-500">
            {phaseName} 단계 기본 권장 시간은 {formatTime(defaultSeconds)}입니다.
          </p>
          
          {/* Auto Start Option (T2) */}
          {!groupLocked && (
            <label className="flex items-center gap-2 mt-4 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={autoStartTimer}
                onChange={(e) => setAutoStartTimer(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-600">모둠 확정 시 자동으로 타이머 시작</span>
            </label>
          )}
        </div>

        <div className="flex flex-col md:items-end gap-3">
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4">
            <div className="text-right">
              <span className="text-[10px] block font-bold text-gray-400 tracking-wider">남은 시간</span>
              <Timer seconds={remainingSeconds} className="text-3xl" />
            </div>
            <button
              type="button"
              onClick={onStart}
              disabled={!groupLocked || isRunning}
              className="button-primary h-14 px-6 text-sm flex items-center gap-2 shadow-brand"
            >
              <span>{isRunning ? "진행 중" : "수업 시작"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-gray-100">
        <button type="button" className="timer-adjust-button" onClick={() => onSetTime(remainingSeconds - 60)}>
          -1분
        </button>
        <button type="button" className="timer-adjust-button" onClick={() => onSetTime(remainingSeconds + 60)}>
          +1분
        </button>
        <button type="button" className="timer-adjust-button" onClick={() => onSetTime(defaultSeconds)}>
          기본값 복원
        </button>
        <form className="timer-custom-form ml-auto flex items-center gap-2" onSubmit={applyMinutes}>
          <input
            type="number"
            min="0"
            max="90"
            step="1"
            value={minutesInput}
            onChange={event => setMinutesInput(event.target.value)}
            placeholder="직접 입력 (분)"
            className="field-control text-sm py-1.5 h-10 w-32 font-bold"
            aria-label="남은 시간 분 단위 입력"
          />
          <button type="submit" className="button-secondary h-10 px-4 text-xs">
            설정
          </button>
        </form>
      </div>
    </section>
  );
}

function LessonCoachPanel({ phase, submittedCount, groupCount }) {
  const guide = getLessonPhaseGuide(phase);

  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl shadow-2">
      <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
        <div>
          <span className="panel-label">수업 진행 코치</span>
          <h2 className="text-xl font-bold text-brand-ink mt-0.5">{guide.title}</h2>
        </div>
        <div className="bg-brand text-white font-extrabold text-sm px-4 py-2 rounded-2xl shadow-brand">
          제출 현황: {submittedCount}/{groupCount}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
        <article className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <span className="text-xs font-bold text-brand block mb-1">교사가 지금 할 일</span>
          <p className="text-xs text-gray-700 leading-relaxed font-serif">{guide.teacherAction}</p>
        </article>
        <article className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <span className="text-xs font-bold text-brand block mb-1">학생에게 던질 발문</span>
          <p className="text-xs text-gray-700 leading-relaxed font-serif">{guide.prompt}</p>
        </article>
        <article className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <span className="text-xs font-bold text-brand block mb-1">다음 단계 이동 기준</span>
          <p className="text-xs text-gray-700 leading-relaxed font-serif">{guide.evidence}</p>
        </article>
        <article className="p-4 bg-red-50/20 rounded-2xl border border-red-100/50">
          <span className="text-xs font-bold text-danger block mb-1">주의할 점</span>
          <p className="text-xs text-red-900 leading-relaxed font-serif">{guide.caution}</p>
        </article>
      </div>
    </section>
  );
}

function PhaseControls({ phase, onChange }) {
  const currentIndex = SESSION_PHASES.findIndex(item => item.key === phase);
  const nextPhase = SESSION_PHASES[currentIndex + 1] ?? null;

  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl shadow-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-5 mb-5">
        <div>
          <span className="panel-label">수업 흐름 관리</span>
          <h2 className="text-xl font-bold text-brand-ink mt-0.5">현재 단계: {phaseLabel(phase)}</h2>
          <p className="text-xs font-serif text-gray-500 mt-1">
            각 단계를 클릭해 직접 이동하거나, 우측 버튼을 눌러 다음 단계로 진행합니다. (단축키: Space)
          </p>
        </div>
        <button
          type="button"
          disabled={!nextPhase}
          onClick={() => nextPhase && onChange(nextPhase.key)}
          className="button-primary h-14 px-8 text-sm flex items-center gap-2 shadow-brand"
        >
          <span>{nextPhase ? `${nextPhase.label} 단계로 진행` : "모든 활동 완료"}</span>
          <span className="text-xs opacity-80">(Space)</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {SESSION_PHASES.map((item, index) => {
          const active = item.key === phase;
          const done = index < currentIndex;
          
          let btnClass = "border-gray-200 text-gray-500 hover:bg-gray-50";
          if (active) {
            btnClass = "border-brand bg-brand text-white shadow-brand";
          } else if (done) {
            btnClass = "border-brand-soft bg-brand-soft/30 text-brand-deep font-semibold";
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`p-3 border rounded-xl flex flex-col justify-center items-center text-center transition-all ${btnClass}`}
            >
              <span className="text-sm font-bold">{item.label}</span>
              <span className={`text-[10px] mt-1 ${active ? "text-white/80" : "text-gray-400"}`}>
                {item.note}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TeacherEventCards({ cards = [] }) {
  if (!cards.length) return null;

  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl shadow-2">
      <span className="panel-label">오늘의 사회 뉴스</span>
      <h2 className="text-xl font-bold text-brand-ink mt-0.5 mb-4 font-serif">우리 사회 설계가 만든 사건</h2>
      <div className="event-grid">
        {cards.map((card, index) => (
          <article key={`${card.title}-${index}`} className={`event-card ${card.type ?? "mixed"} bg-white`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">사건 {index + 1}</p>
            <h3 className="text-base font-bold text-brand-ink leading-snug mt-1 mb-2 font-serif">{card.title}</h3>
            <p className="text-gray-600 text-xs leading-relaxed font-serif mb-3">{card.body}</p>
            <strong className="text-xs text-brand font-serif block border-t border-dashed border-gray-100 pt-2">Q. {card.question}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonTable({ groups, selectedGroupId, onSelect }) {
  return (
    <section className="panel p-6 bg-white border border-gray-200 rounded-3xl shadow-2">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <span className="panel-label">실시간 비교표</span>
          <h2 className="text-xl font-bold text-brand-ink mt-0.5">모둠별 선택 변화 비교</h2>
        </div>
        <p className="text-xs font-serif text-gray-500">
          행을 누르면 해당 모둠이 상세 보기 및 발표 모둠으로 선택됩니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="data-table w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 z-10 border-r border-gray-200">모둠</th>
              <th className="border-r border-gray-200">상태</th>
              <th colSpan="3" className="text-center border-r border-gray-200">1차 정책 설계</th>
              <th className="border-r border-gray-200">공개된 역할</th>
              <th colSpan="3" className="text-center">2차 정책 설계</th>
            </tr>
            <tr className="bg-gray-50/50 text-[11px] border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 z-10 border-r border-gray-200" />
              <th className="border-r border-gray-200" />
              <th>세금</th>
              <th>예산</th>
              <th className="border-r border-gray-200">최저임금</th>
              <th className="border-r border-gray-200" />
              <th>세금</th>
              <th>예산</th>
              <th>최저임금</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => {
              const active = group.id === selectedGroupId;
              const firstRound = group.history?.[0];
              
              const firstConstitution = firstRound?.constitution ?? 
                (group.isSubmitted || group.result ? group.constitution : null);
              
              const secondConstitution = firstRound && group.isSubmitted
                ? group.constitution
                : null;
              
              const roleLabel =
                group.assignedClass?.label ?? firstRound?.assignedClass?.label ?? "-";

              // Check if policy changed in second round
              const taxChanged = secondConstitution && firstConstitution && secondConstitution.taxPolicy !== firstConstitution.taxPolicy;
              const budgetChanged = secondConstitution && firstConstitution && secondConstitution.budgetDirection !== firstConstitution.budgetDirection;
              const wageChanged = secondConstitution && firstConstitution && secondConstitution.wagePolicy !== firstConstitution.wagePolicy;

              return (
                <tr
                  key={group.id}
                  onClick={() => onSelect(group.id)}
                  className={`cursor-pointer transition-all hover:bg-gray-50 ${
                    active ? "active bg-brand-soft/20 border-l-4 border-brand" : ""
                  }`}
                >
                  <td className="sticky left-0 bg-white font-bold border-r border-gray-200 z-10">
                    {group.name}
                  </td>
                  <td className="border-r border-gray-200 text-xs">
                    {group.isSubmitted ? (
                      <span className="chip chip-success py-0.5 px-2 text-[10px]">제출 완료</span>
                    ) : group.connected ? (
                      <span className="chip chip-cobalt py-0.5 px-2 text-[10px]">작성 중</span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">미접속</span>
                    )}
                  </td>
                  
                  {/* 1st Round Choices */}
                  <td>
                    <ComparisonChip value={firstConstitution ? getTaxPolicy(firstConstitution).shortLabel : "-"} />
                  </td>
                  <td>
                    <ComparisonChip value={firstConstitution ? getBudgetDirection(firstConstitution).shortLabel : "-"} />
                  </td>
                  <td className="border-r border-gray-200">
                    <ComparisonChip value={firstConstitution ? getWagePolicy(firstConstitution).shortLabel : "-"} />
                  </td>

                  {/* Assigned Role */}
                  <td className="border-r border-gray-200 font-serif font-bold text-xs text-brand-ink bg-gray-50/50">
                    {roleLabel}
                  </td>

                  {/* 2nd Round Choices with change indicator dot */}
                  <td>
                    {taxChanged && <span className="text-brand mr-1 animate-pulse">●</span>}
                    <ComparisonChip value={secondConstitution ? getTaxPolicy(secondConstitution).shortLabel : "-"} />
                  </td>
                  <td>
                    {budgetChanged && <span className="text-brand mr-1 animate-pulse">●</span>}
                    <ComparisonChip value={secondConstitution ? getBudgetDirection(secondConstitution).shortLabel : "-"} />
                  </td>
                  <td>
                    {wageChanged && <span className="text-brand mr-1 animate-pulse">●</span>}
                    <ComparisonChip value={secondConstitution ? getWagePolicy(secondConstitution).shortLabel : "-"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function TeacherDashboard({ pin, teacherPin = "" }) {
  const {
    session,
    groups,
    loading,
    phase,
    remainingSeconds,
    selectGroup,
    setPhase,
    setTimerSeconds,
    finalizeGroups,
    startSession,
    runRoulette,
    createSession,
    isDemoMode
  } = useGameData(pin);

  const [rolling, setRolling] = useState(false);
  const [createdPin, setCreatedPin] = useState(pin || "");
  const [setupMessage, setSetupMessage] = useState("");
  
  // Dropdown menu state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Auto Start Timer configuration (T2)
  const [autoStartTimer, setAutoStartTimer] = useState(false);

  // Fullscreen Presentation Modal (T5)
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const autoCreateRef = useRef(false);

  const groupList = useMemo(() => Object.values(groups), [groups]);
  
  const selectedGroup = session?.selectedGroupId
    ? groups[session.selectedGroupId]
    : groupList[0];

  const submittedCount = groupList.filter(group => group.isSubmitted).length;
  const connectedCount = groupList.filter(group => group.connected).length;
  const groupLocked = Boolean(session?.groupLocked);
  const isRunning = session?.status === "running";
  
  const displayResult = selectedGroup?.result ?? 
    ((phase === "secondDiscussion" || phase === "revision") ? selectedGroup?.history?.[0]?.result : null);
  
  const canOpenPresentation = Boolean(selectedGroup?.history?.[0] && selectedGroup?.isSubmitted);
  const defaultPhaseSeconds = getPhaseDefaultSeconds(phase);

  // Grouped comparison board by assigned class (F5)
  const groupedByClass = useMemo(() => {
    const categories = {
      upper: { label: "상류층 계열", teams: [] },
      middle: { label: "중산층 계열", teams: [] },
      lower: { label: "빈곤층 계열", teams: [] },
      unassigned: { label: "배정 대기", teams: [] }
    };

    groupList.forEach(g => {
      const classKey = g.assignedClass?.classKey ?? g.assignedClass?.key;
      if (classKey === "upper" || classKey === "middle" || classKey === "lower") {
        categories[classKey].teams.push(g);
      } else {
        categories.unassigned.teams.push(g);
      }
    });

    return categories;
  }, [groupList]);

  // Keyboard Shortcuts (P, Space, R)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

      if (e.key === "p" || e.key === "P") {
        // Toggle fullscreen presentation mode for selected group
        if (canOpenPresentation) {
          setIsFullscreenPresentation(prev => !prev);
        } else {
          setToastType("error");
          setToastMessage("이 모둠은 2차 제출 완료 후에만 발표 화면을 열 수 있습니다.");
        }
      } else if (e.key === " ") {
        // Space goes to next phase
        e.preventDefault();
        const currentIndex = SESSION_PHASES.findIndex(item => item.key === phase);
        const next = SESSION_PHASES[currentIndex + 1] ?? null;
        if (next) {
          setPhase(next.key);
          setToastType("success");
          setToastMessage(`[${next.label}] 단계로 이동했습니다.`);
        }
      } else if (e.key === "r" || e.key === "R") {
        // Trigger roulette
        if (selectedGroup && selectedGroup.isSubmitted && !selectedGroup.rouletteDone && !rolling) {
          // Trigger click logic on roulette
          const rouletteBtn = document.querySelector(".perspective-1000 + button");
          if (rouletteBtn) rouletteBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, selectedGroup, canOpenPresentation, rolling]);

  const handleCreate = async () => {
    if (autoCreateRef.current) return;
    autoCreateRef.current = true;

    try {
      const created = await createSession({
        durationSeconds: getPhaseDefaultSeconds("discussion")
      });
      const newPin = typeof created === "string" ? created : created.pin;
      setCreatedPin(newPin);
      window.sessionStorage.removeItem(AUTO_CREATE_LOCK_KEY);
      const teacherUrl = getAppPath({
        role: "teacher",
        teacherPin: TEACHER_PIN,
        pin: newPin
      });
      window.history.replaceState(null, "", teacherUrl);
      window.location.reload();
    } catch (err) {
      autoCreateRef.current = false;
      window.sessionStorage.removeItem(AUTO_CREATE_LOCK_KEY);
      setSetupMessage(err.message);
    }
  };

  useEffect(() => {
    if (teacherPin !== TEACHER_PIN || pin || createdPin) return;

    const lockedAt = Number(window.sessionStorage.getItem(AUTO_CREATE_LOCK_KEY) ?? 0);
    if (Date.now() - lockedAt < 8000) return;

    window.sessionStorage.setItem(AUTO_CREATE_LOCK_KEY, String(Date.now()));
    handleCreate();
  }, [teacherPin, pin, createdPin]);

  const handleStartSession = async () => {
    const result = await startSession();
    if (!result.ok) {
      setToastType("error");
      setToastMessage("이미 시작되었거나 세션을 찾을 수 없습니다.");
    } else {
      setToastType("success");
      setToastMessage("수업 타이머가 시작되었습니다.");
    }
  };

  const openStudentPreview = () => {
    const previewUrl = getAppPath({ role: "student", pin, preview: "1" });
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const openTeacherGuidePage = () => {
    const guideUrl = getAppPath({ role: "guide" });
    window.open(guideUrl, "_blank", "noopener,noreferrer");
  };

  const openWrapUpPage = () => {
    const wrapUpUrl = getAppPath({ role: "wrapup" });
    window.open(wrapUpUrl, "_blank", "noopener,noreferrer");
  };

  const openPresentationPreview = () => {
    const presentationUrl = getAppPath({ role: "student", presentation: "1", example: "1" });
    window.open(presentationUrl, "_blank", "noopener,noreferrer");
  };

  const handleSetTime = async seconds => {
    const result = await setTimerSeconds(seconds);
    if (!result.ok) {
      setToastType("error");
      setToastMessage("남은 시간 설정에 실패했습니다.");
      return;
    }
    setToastType("success");
    setToastMessage(`남은 시간을 ${formatTime(result.durationSeconds)}로 조정했습니다.`);
  };

  const handleFinalizeGroups = async () => {
    const result = await finalizeGroups();
    if (!result.ok) {
      setToastType("error");
      setToastMessage("입장한 모둠이 없습니다. 학생들이 먼저 모둠 참여 완료 후 진행해 주세요.");
    } else {
      setToastType("success");
      setToastMessage(`${result.count}개 모둠으로 게임 참여 모둠을 확정했습니다.`);
      // Auto Start Timer configuration (T2)
      if (autoStartTimer) {
        setTimeout(handleStartSession, 800);
      }
    }
  };

  const handleRouletteReveal = async () => {
    return await runRoulette(selectedGroup.id);
  };

  if (teacherPin !== TEACHER_PIN) {
    return (
      <main className="app-page center-page bg-canvas">
        <section className="brand-card bg-white p-8 rounded-3xl border border-gray-200 text-center">
          <div className="mb-6 flex items-center gap-4 justify-center">
            <BrandMark size="lg" />
            <div className="text-left">
              <p className="brand-kicker">교사용 접근 제한</p>
              <h1 className="brand-title text-2xl font-serif">교사용 PIN 번호가 필요합니다</h1>
            </div>
          </div>
          <p className="danger-callout text-sm justify-center leading-relaxed">
            교사용 대시보드는 4자리 교사용 PIN을 입력해야 진입할 수 있습니다.<br />
            입장 화면에서 '교사' 탭을 누르고 올바른 인증 코드를 입력하세요.
          </p>
          <button
            type="button"
            onClick={() => { window.location.href = getAppPath(); }}
            className="button-secondary mt-6 h-12 w-full text-base"
          >
            시작 화면으로 돌아가기
          </button>
        </section>
      </main>
    );
  }

  if (!pin && !createdPin) {
    return (
      <main className="app-page center-page bg-canvas">
        <section className="brand-card bg-white p-8 rounded-3xl border border-gray-200 text-center">
          <div className="mb-6 flex items-center gap-4 justify-center">
            <BrandMark size="lg" className="animate-spin duration-[4000ms]" />
            <div className="text-left">
              <p className="brand-kicker">교사용 대시보드</p>
              <h1 className="brand-title text-2xl font-serif">새 수업 세션을 준비 중입니다</h1>
            </div>
          </div>
          <p className="status-callout justify-center text-sm">
            잠시 후 데이터베이스 연결 완료 시 자동으로 대시보드로 이동합니다.
          </p>
          {setupMessage && (
            <div className="mt-4">
              <p className="danger-callout text-xs justify-center">{setupMessage}</p>
              <button type="button" onClick={handleCreate} className="button-primary mt-4 h-12 w-full text-sm">
                다시 세션 만들기 시도
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas text-xl font-bold text-brand font-serif">
        <div className="flex flex-col items-center gap-4">
          <BrandMark size="lg" className="animate-spin duration-[4000ms]" />
          <span>대시보드를 연동하는 중...</span>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-canvas text-center font-serif">
        <div className="max-w-md p-8 bg-white rounded-3xl border border-gray-200 shadow-2">
          <h2 className="text-2xl font-bold text-red-600 mb-4">세션이 존재하지 않습니다</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            잘못된 세션 PIN 번호입니다. 새로 대시보드를 생성하거나 URL을 다시 점검해 주십시오.
          </p>
          <button
            type="button"
            onClick={() => { window.location.hash = ""; window.location.reload(); }}
            className="button-secondary mt-6 h-12 px-6"
          >
            새 세션 만들기
          </button>
        </div>
      </main>
    );
  }

  // Check the current setup wizard step
  let setupStep = 1; // 1: 수업 준비 (groups entering)
  if (groupLocked) {
    setupStep = 2; // 2: 모둠 확정 (locked, wait start)
    if (isRunning) {
      setupStep = 3; // 3: 진행 중 (running)
    }
  }

  return (
    <main className="dashboard-shell bg-canvas flex flex-col h-screen select-none">
      
      {/* Sticky Header with Cobalt theme */}
      <header className="sticky top-0 z-40 bg-midnight h-18 text-white px-6 flex items-center justify-between border-b border-white/10 shadow-3">
        <div className="flex items-center gap-4">
          <BrandMark size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-brand-soft uppercase">
                Who am I 교사 대시보드
              </span>
              {isDemoMode && (
                <span className="text-[9px] font-extrabold bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded">
                  로컬 데모
                </span>
              )}
            </div>
            <h1 className="text-base font-bold font-serif leading-none mt-0.5">
              정의로운 사회 설계 세션 (PIN: <span className="font-sans text-accent tracking-wider font-extrabold text-lg">{pin}</span>)
            </h1>
          </div>
        </div>

        {/* 3-Step Wizard Bar (T1) */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              setupStep >= 1 ? "bg-brand text-white" : "bg-white/10 text-white/50"
            }`}>1</span>
            <span className={setupStep === 1 ? "text-white" : "text-white/40"}>수업 준비 (입장 대기)</span>
          </div>
          <span className="text-white/20">➔</span>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              setupStep >= 2 ? "bg-brand text-white" : "bg-white/10 text-white/50"
            }`}>2</span>
            <span className={setupStep === 2 ? "text-white" : "text-white/40"}>모둠 확정</span>
          </div>
          <span className="text-white/20">➔</span>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              setupStep >= 3 ? "bg-brand text-white" : "bg-white/10 text-white/50"
            }`}>3</span>
            <span className={setupStep === 3 ? "text-white" : "text-white/40"}>수업 진행</span>
          </div>
        </div>

        {/* Action Controls & Dropdown Menu (T3) */}
        <div className="flex items-center gap-4 relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="button-secondary text-white border-white/20 hover:bg-white/10 px-3.5 h-10 text-xs flex items-center gap-1.5"
          >
            <span>보조 기능 메뉴</span>
            <span>{dropdownOpen ? "▲" : "▼"}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-2xl shadow-3 p-2 text-brand-ink text-xs z-50 animate-fadeIn">
              <button onClick={() => { setDropdownOpen(false); openStudentPreview(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 font-semibold block">
                학생용 화면 보기 (새 탭)
              </button>
              <button onClick={() => { setDropdownOpen(false); openTeacherGuidePage(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 font-semibold block">
                활동 가이드 리허설 (새 탭)
              </button>
              <button onClick={() => { setDropdownOpen(false); openWrapUpPage(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 font-semibold block">
                수업 마무리 정리 (새 탭)
              </button>
              <button onClick={() => { setDropdownOpen(false); openPresentationPreview(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 font-semibold block">
                발표 샘플 미리보기 (새 탭)
              </button>
              <hr className="my-1.5 border-gray-100" />
              <button 
                onClick={() => { setDropdownOpen(false); downloadDetailedCsv({ pin, groups: groupList }); }} 
                className="w-full text-left px-3 py-2.5 rounded-lg bg-brand-soft text-brand font-bold block"
              >
                CSV 엑셀 다운로드
              </button>
            </div>
          )}

          <div className="bg-brand text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-brand/20">
            제출 {submittedCount}/{groupList.length}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="dashboard-body flex-1 flex overflow-hidden">
        
        {/* Sidebar: Group List */}
        <aside className="sidebar w-64 border-r border-gray-200 bg-white p-5 flex flex-col justify-between overflow-y-auto shrink-0 select-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="panel-label">실시간 연동</span>
                <h2 className="text-lg font-extrabold text-brand-ink">모둠 목록</h2>
              </div>
              
              {!groupLocked ? (
                <button
                  type="button"
                  onClick={handleFinalizeGroups}
                  disabled={connectedCount === 0}
                  className="button-primary px-3 h-8 text-[11px] font-bold shadow-brand"
                >
                  참가 확정
                </button>
              ) : (
                <span className="chip chip-success text-[10px] py-0.5 px-2 font-bold">확정됨</span>
              )}
            </div>

            <p className="text-[11px] font-serif text-gray-500 leading-snug">
              {groupLocked
                ? `수업 참여 ${groupList.length}개 모둠 확정 완료`
                : `현재 접속: ${connectedCount} / ${groupList.length} 모둠`}
            </p>

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-none">
              {groupList.map(g => {
                const active = g.id === selectedGroup?.id;

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => selectGroup(g.id)}
                    className={`group-button w-full p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                      active 
                        ? "border-brand bg-brand-soft/20 text-brand-ink ring-2 ring-brand/10 font-bold border-l-4 border-l-brand" 
                        : "border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-serif font-bold text-sm">{g.name}</span>
                      {g.isSubmitted && (
                        <span className="chip chip-success py-0.5 px-1.5 text-[9px] font-bold">제출</span>
                      )}
                    </div>

                    <div className="mt-2 flex gap-2 text-[10px] text-gray-400">
                      <span>{g.connected ? "접속" : "미접속"}</span>
                      <span>•</span>
                      <span>{g.isSubmitted ? "작성 완료" : "작성 중"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Central main dashboard view */}
        <section className="main-grid flex-1 overflow-y-auto p-6 bg-canvas space-y-6">
          
          <TimerStartPanel
            groupLocked={groupLocked}
            isRunning={isRunning}
            phase={phase}
            remainingSeconds={remainingSeconds}
            defaultSeconds={defaultPhaseSeconds}
            onStart={handleStartSession}
            onSetTime={handleSetTime}
            autoStartTimer={autoStartTimer}
            setAutoStartTimer={setAutoStartTimer}
          />

          <PhaseControls phase={phase} onChange={setPhase} />

          <LessonCoachPanel
            phase={phase}
            submittedCount={submittedCount}
            groupCount={groupList.length}
          />

          {/* Selected Group details / Roulette */}
          <section className="panel p-6 bg-white border border-gray-200 rounded-3xl shadow-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="panel-label">모둠 상세 분석</span>
                <h2 className="text-xl font-bold text-brand-ink mt-0.5">
                  {selectedGroup?.name || "선택된 모둠"}의 활동 내용 및 결과
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFullscreenPresentation(true)}
                  disabled={!canOpenPresentation}
                  className="button-secondary h-11 px-4 text-xs flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  <span>전체화면 발표</span>
                  <span className="text-[10px] text-gray-400 font-bold">(P)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Roulette revealing future self */}
              <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50/50">
                <span className="panel-label text-center block mb-2">미래의 나 룰렛</span>
                <RoleReveal 
                  selectedGroup={selectedGroup} 
                  onReveal={handleRouletteReveal} 
                  rolling={rolling}
                  setRolling={setRolling}
                />
              </div>

              {/* Selected group metrics and insights */}
              <div className="space-y-4">
                <div className="metric-card p-5 border border-gray-100 rounded-2xl bg-white shadow-1">
                  <span className="panel-label">1차 정책 설계 내용</span>
                  <div className="mt-3">
                    {selectedGroup?.isSubmitted || selectedGroup?.result ? (
                      <PolicySummary constitution={selectedGroup.constitution} />
                    ) : (
                      <p className="text-xs font-serif text-gray-400 italic">아직 1차 설계를 제출하지 않은 모둠입니다.</p>
                    )}
                  </div>
                </div>

                {displayResult ? (
                  <div className="space-y-4 animate-fadeIn">
                    <span className="panel-label block mt-2">1차 설계 영향 해석</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <InterpretationCard
                        title="가장 불리한 시민"
                        status={displayResult.survivalIndex >= 80 ? "보장 수준 높음" : displayResult.survivalIndex >= 60 ? "일부 취약지점 발생" : "안전 장치 위태로움"}
                        body={`생존 지수: ${displayResult.survivalIndex}/100. 최소한의 기초 생활 복지 제공 정도를 나타냅니다.`}
                        question="노동자와 취약계층이 사회에 동참할 동기가 부여되나요?"
                      />
                      <InterpretationCard
                        title="경제 활동의 자유"
                        status={displayResult.assetGrowth >= 0 ? "자율성 넉넉함" : displayResult.assetGrowth >= -15 ? "완만한 규제" : "자유에 강한 규제"}
                        body={`자산 상승률: ${displayResult.assetGrowth}%. 기업 활동과 노동에 대한 세금과 규제 완화 정도입니다.`}
                        question="투자자와 자영업자들의 고용 의지가 보장받나요?"
                      />
                      <InterpretationCard
                        title="사회적 공감/합의"
                        status={displayResult.socialIntegration >= 80 ? "합의 수준 높음" : displayResult.socialIntegration >= 60 ? "보완이 요구됨" : "사회 갈등 위험"}
                        body={`공동체 공감도: ${displayResult.socialIntegration}/100. 계층 간의 자산 불평등 완화율입니다.`}
                        question="더 불리한 사람에게 혜택을 주는 차등의 원칙이 지켜졌나요?"
                      />
                    </div>

                    <div className="p-4 bg-brand-soft/40 border border-brand/10 rounded-2xl">
                      <span className="text-xs font-bold text-brand block mb-1">
                        ★ {displayResult.classResult?.label || "공개 역할"} 입장에서의 성찰
                      </span>
                      <p className="text-xs text-gray-700 font-serif leading-relaxed">
                        {displayResult.classResult?.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border border-dashed border-gray-200 rounded-2xl text-center text-xs font-serif text-gray-400">
                    역할이 공개되고, 우리 정책 선택이 만들어낸 해석 지수가 대시보드에 연동됩니다.
                  </div>
                )}
              </div>

            </div>
          </section>

          <TeacherEventCards cards={displayResult?.eventCards ?? []} />

          <ComparisonTable
            groups={groupList}
            selectedGroupId={selectedGroup?.id}
            onSelect={selectGroup}
          />
        </section>

        {/* Collapsible Presentation Board (F5) */}
        {phase === "final" && (
          <aside className="w-80 border-l border-gray-200 bg-white p-5 overflow-y-auto shrink-0 flex flex-col justify-between select-none animate-slideLeft">
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <span className="panel-label">역할별 비교 보드</span>
                <h2 className="text-lg font-extrabold text-brand-ink mt-0.5">역할별 비교 분석</h2>
                <p className="text-[11px] font-serif text-gray-400 mt-1">
                  같은 역할을 받은 모둠별로 묶어 변화를 90초 발표 동안 빠르게 점검합니다.
                </p>
              </div>

              {["upper", "middle", "lower"].map(key => {
                const category = groupedByClass[key];
                return (
                  <div key={key} className="space-y-2 border-b border-gray-50 pb-3">
                    <span className="text-xs font-bold text-brand uppercase tracking-wider block">
                      {category.label} ({category.teams.length})
                    </span>
                    <div className="space-y-1.5">
                      {category.teams.map(t => {
                        const first = t.history?.[0]?.constitution;
                        const second = t.constitution;
                        
                        let changedText = "변화 없음";
                        let hasChanges = false;
                        if (first && second) {
                          const tax = first.taxPolicy !== second.taxPolicy;
                          const bud = first.budgetDirection !== second.budgetDirection;
                          const wage = first.wagePolicy !== second.wagePolicy;
                          if (tax || bud || wage) {
                            hasChanges = true;
                            changedText = `변경: ${tax ? "세금 " : ""}${bud ? "예산 " : ""}${wage ? "시급" : ""}`;
                          }
                        }

                        return (
                          <div 
                            key={t.id} 
                            onClick={() => selectGroup(t.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                              t.id === selectedGroup?.id 
                                ? "border-brand bg-brand-soft/20 text-brand-deep font-semibold" 
                                : "border-gray-100 bg-gray-50/50 hover:bg-gray-100"
                            }`}
                          >
                            <span className="font-serif">{t.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              hasChanges ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"
                            }`}>
                              {changedText}
                            </span>
                          </div>
                        );
                      })}
                      {category.teams.length === 0 && (
                        <p className="text-[10px] text-gray-300 italic font-serif">이 계열에 배정된 모둠이 아직 없습니다.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

      </div>

      {/* Fullscreen Presentation Modal Overlay (T5) */}
      {isFullscreenPresentation && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-canvas overflow-y-auto p-6 md:p-12 flex flex-col justify-between animate-fadeIn select-none">
          <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-between">
            <header className="border-b-2 border-brand pb-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark size="lg" />
                <div>
                  <span className="text-xs font-bold text-brand uppercase tracking-widest block">Who am I • 발표 모드</span>
                  <h1 className="text-3xl font-bold font-serif text-brand-ink mt-1">
                    {selectedGroup.name} 활동 설계도 발표
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 font-serif">이 모둠의 역할: <strong>{selectedGroup.assignedClass?.label}</strong></span>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPresentation(false)}
                  className="button-secondary border-red-200 text-red-600 hover:bg-red-50/50 h-12 px-6 rounded-xl flex items-center justify-center font-bold"
                >
                  발표 닫기 (Esc)
                </button>
              </div>
            </header>

            {/* Embed Student App presentation view directly to keep style consistency */}
            <div className="flex-1 my-4">
              <StudentApp 
                pin={pin} 
                groupId={selectedGroup.id} 
                presentationOnly={true} 
              />
            </div>

            <footer className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400 font-serif">
              * 발표 모둠 발표 권장 시간: 90초 (1분 30초). 다른 모둠원들은 경청하며 질문을 준비하세요.
            </footer>
          </div>
        </div>
      )}

      {/* Esc key listener to close fullscreen presentation */}
      {isFullscreenPresentation && (
        <kbd className="hidden" ref={() => {
          const escClose = (e) => {
            if (e.key === "Escape") setIsFullscreenPresentation(false);
          };
          window.addEventListener("keydown", escClose);
          return () => window.removeEventListener("keydown", escClose);
        }} />
      )}

      {/* Toast Alert */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage("")} 
      />

    </main>
  );
}
