import { useEffect, useState } from "react";
import FirebaseSetupPanel from "./FirebaseSetupPanel";
import StudentApp from "./StudentApp";
import TeacherDashboard from "./TeacherDashboard";
import TeacherGuidePage from "./TeacherGuidePage";
import WrapUpPage from "./WrapUpPage";
import { getAppPath, getRouteParams } from "./routes";
import BrandMark from "./components/BrandMark";
import KeypadInput from "./components/KeypadInput";

export const TEACHER_PIN = "1234";

function StartScreen() {
  const [role, setRole] = useState("teacher");
  const [pin, setPin] = useState("");
  const [restorePin, setRestorePin] = useState("");
  const [groupId, setGroupId] = useState("group_1");
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null); // 'pin' | 'restorePin' | null

  const enter = () => {
    if (role === "teacher" && pin !== TEACHER_PIN) {
      setMessage("교사용 PIN이 올바르지 않습니다.");
      return;
    }

    if (role === "teacher") {
      window.location.href = getAppPath({
        role,
        teacherPin: TEACHER_PIN
      });
    } else {
      if (pin.length !== 6) {
        setMessage("6자리 참가 PIN을 입력해 주세요.");
        return;
      }
      window.location.href = getAppPath({
        role,
        pin,
        groupId
      });
    }
  };

  const openExistingTeacherSession = () => {
    if (pin !== TEACHER_PIN) {
      setMessage("교사용 PIN을 먼저 입력해 주세요.");
      return;
    }

    if (restorePin.length !== 6) {
      setMessage("복구할 6자리 세션 코드를 입력해 주세요.");
      return;
    }

    window.location.href = getAppPath({
      role: "teacher",
      teacherPin: TEACHER_PIN,
      pin: restorePin
    });
  };

  // Auto submit student pin when it reaches 6 digits
  useEffect(() => {
    if (role === "student" && pin.length === 6) {
      setMessage("");
    }
  }, [pin, role]);

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-3 bg-canvas">
      {/* Left 1/3 Graphic Panel */}
      <section className="lg:col-span-1 bg-midnight flex flex-col items-center justify-between p-10 text-white relative overflow-hidden select-none">
        {/* Glow effect backdrops */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-brand/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 w-full">
          <BrandMark size="sm" />
          <span className="font-serif font-bold text-sm tracking-wider opacity-90">Who am I</span>
        </div>

        {/* Breathing Silhouette SVG */}
        <div className="my-auto flex flex-col items-center">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse duration-[3000ms] text-brand-soft"
          >
            {/* Fog rings */}
            <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" strokeOpacity="0.05" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.08" strokeDasharray="4 4" />
            
            {/* Veil curtain shape */}
            <path d="M30 140C30 110 60 95 100 95C140 95 170 110 170 140" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" strokeLinecap="round" />
            
            {/* Human head */}
            <circle cx="100" cy="55" r="22" fill="white" />
            {/* Human body silhouette */}
            <path d="M100 85C70 85 45 105 45 138V185H155V138C155 105 130 85 100 85Z" fill="white" fillOpacity="0.85" />
            
            {/* Horizontal Veil Line */}
            <line x1="20" y1="85" x2="180" y2="85" stroke="#1a4dff" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="15" y1="102" x2="185" y2="102" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>

          <blockquote className="text-center mt-6 max-w-xs px-4">
            <p className="font-serif italic text-base text-gray-200">
              "정의는 사회 제도의 첫 번째 덕목이다."
            </p>
            <cite className="block text-[11px] uppercase tracking-widest text-brand-soft mt-2 font-bold not-italic">
              존 롤스 (John Rawls)
            </cite>
          </blockquote>
        </div>

        <div className="w-full text-center text-xs text-gray-500 font-serif">
          통합사회2 정의로운 사회 설계 시뮬레이터
        </div>
      </section>

      {/* Right 2/3 Registration/Entry Form */}
      <section className="lg:col-span-2 flex items-center justify-center p-6 md:p-12">
        <div className="brand-card w-full max-w-xl bg-white border border-gray-200 p-8 rounded-3xl shadow-2">
          
          {/* Logo & Headline */}
          <div className="mb-8 flex items-center gap-4">
            <BrandMark size="lg" />
            <div>
              <p className="brand-kicker">Who am I</p>
              <h1 className="brand-title font-serif text-3xl">정의로운 사회를 함께 설계해 봅니다</h1>
            </div>
          </div>

          {/* Teacher/Student segmented toggle */}
          <div className="segmented mb-6">
            <button
              type="button"
              onClick={() => {
                setRole("teacher");
                setPin("");
                setRestorePin("");
                setMessage("");
                setFocusedField(null);
              }}
              className={`h-12 text-base transition-all ${role === "teacher" ? "active" : ""}`}
            >
              교사 화면으로
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setPin("");
                setRestorePin("");
                setMessage("");
                setFocusedField(null);
              }}
              className={`h-12 text-base transition-all ${role === "student" ? "active" : ""}`}
            >
              학생 참여로
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            
            {/* Role: Teacher input */}
            {role === "teacher" ? (
              <label className="field-label block">
                교사용 인증 PIN
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pin}
                  onFocus={() => setFocusedField("pin")}
                  onChange={event => {
                    setMessage("");
                    setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
                  }}
                  placeholder="교사용 PIN 4자리"
                  className="field-control font-mono mt-1 text-center text-xl tracking-widest"
                />
              </label>
            ) : (
              /* Role: Student code */
              <label className="field-label block">
                참가 PIN (교사 대시보드 참고)
                <input
                  type="text"
                  inputMode="none" // Prevent mobile soft keyboard to prefer our custom Keypad
                  autoComplete="off"
                  value={pin}
                  onFocus={() => setFocusedField("pin")}
                  onChange={event => {
                    setMessage("");
                    setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  placeholder="6자리 PIN 코드 입력"
                  className="field-control font-mono mt-1 text-center text-xl tracking-widest"
                />
              </label>
            )}

            {/* Student Mode - Group Grid Selection */}
            {role === "student" && (
              <div className="space-y-2.5">
                <span className="field-label">우리 모둠 선택</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {Array.from({ length: 8 }, (_, index) => {
                    const id = `group_${index + 1}`;
                    const isSelected = groupId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setGroupId(id)}
                        className={`h-14 w-full text-base font-extrabold rounded-xl border transition-all ${
                          isSelected
                            ? "bg-brand text-white border-brand shadow-brand"
                            : "bg-surface-alt text-brand-ink border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {index + 1}모둠
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Existing Teacher Session Restore */}
            {role === "teacher" && (
              <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
                <label className="field-label block">
                  기존 세션 복구 코드
                  <input
                    value={restorePin}
                    inputMode="numeric"
                    onFocus={() => setFocusedField("restorePin")}
                    onChange={event => {
                      setMessage("");
                      setRestorePin(event.target.value.replace(/\D/g, "").slice(0, 6));
                    }}
                    placeholder="복구할 6자리 세션 코드"
                    className="field-control font-mono mt-1 text-center text-xl tracking-widest"
                  />
                </label>
                <button
                  type="button"
                  onClick={openExistingTeacherSession}
                  className="button-secondary h-12 w-full text-sm"
                >
                  기존 교사 세션 복구 및 열기
                </button>
              </div>
            )}

          </div>

          {/* Interactive Numerical Keypad for tablet-friendliness */}
          {focusedField && (
            <div className="mt-4 animate-fadeIn">
              <KeypadInput
                value={focusedField === "pin" ? pin : restorePin}
                onChange={(val) => {
                  setMessage("");
                  if (focusedField === "pin") {
                    setPin(val.slice(0, role === "teacher" ? 4 : 6));
                  } else {
                    setRestorePin(val.slice(0, 6));
                  }
                }}
                maxLength={focusedField === "pin" ? (role === "teacher" ? 4 : 6) : 6}
              />
            </div>
          )}

          {/* Action Button: Hover sweeps gradient */}
          <button
            type="button"
            onClick={enter}
            className="button-primary mt-8 h-14 w-full text-lg bg-gradient-to-r from-brand via-brand to-brand-deep bg-[length:200%_100%] bg-left hover:bg-right transition-all duration-500 shadow-brand flex items-center justify-center gap-2"
          >
            <span>시뮬레이션 입장하기</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {message && <p className="danger-callout mt-4 text-sm justify-center">{message}</p>}

          {/* Firebase Settings in Details Accordion */}
          <details className="group mt-6 border-t border-gray-100 pt-4">
            <summary className="list-none flex items-center justify-between text-xs font-bold text-gray-400 cursor-pointer select-none hover:text-gray-600">
              <span>서버 및 DB 설정 (고급 설정)</span>
              <span className="transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="mt-3">
              <FirebaseSetupPanel />
            </div>
          </details>

        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [, setRouteVersion] = useState(0);

  useEffect(() => {
    const refreshRoute = () => setRouteVersion(version => version + 1);

    window.addEventListener("hashchange", refreshRoute);
    window.addEventListener("popstate", refreshRoute);

    return () => {
      window.removeEventListener("hashchange", refreshRoute);
      window.removeEventListener("popstate", refreshRoute);
    };
  }, []);

  const params = getRouteParams();
  const role = params.get("role");
  const pin = params.get("pin") || "";
  const groupId = params.get("groupId") || "group_1";
  const teacherPin = params.get("teacherPin") || "";
  const preview = params.get("preview") === "1";
  const presentation = params.get("presentation") === "1";
  const presentationExample = params.get("example") === "1";

  if (role === "guide") {
    return <TeacherGuidePage />;
  }

  if (role === "wrapup") {
    return <WrapUpPage />;
  }

  if (role === "teacher") {
    return <TeacherDashboard pin={pin} teacherPin={teacherPin} />;
  }

  if (role === "student") {
    return (
      <StudentApp
        pin={pin}
        groupId={groupId}
        preview={preview}
        presentationOnly={presentation}
        presentationExample={presentationExample}
      />
    );
  }

  return <StartScreen />;
}
