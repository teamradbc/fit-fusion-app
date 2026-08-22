import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, BookOpen, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, Clock3, Dumbbell,
  Flame, Footprints, HeartPulse, History, Home, Info, LayoutGrid,
  LockKeyhole, Pause, Play, RotateCcw, ShieldAlert,
  Sparkles, TimerReset, Trophy, UserRound, Watch, Wind, X,
} from "lucide-react";
import {
  COOLDOWN, DAY1_SLOTS, LEVELS, MOVEMENTS, PATTERNS, SAFETY,
  SESSION_NOTES, VIDEO_IDS, WARMUP, progress,
} from "./App.jsx";

const PROFILE_KEY = "fit-fusion.profile.v2";
const PLAN_KEY = "fit-fusion.plan.v2";
const SESSION_KEY = "fit-fusion.session.v2";

const EMPTY_SESSION = {
  status: "idle",
  currentIndex: 0,
  progress: {},
  startedAt: null,
  lastSummary: null,
  history: [],
  feedback: null,
};

const STAGE_META = {
  warmup: { label: "آماده‌سازی", short: "گرم‌کردن", color: "var(--gold)", icon: Flame },
  main: { label: "بخش اصلی", short: "تمرین", color: "var(--mint)", icon: Dumbbell },
  cooldown: { label: "بازگشت بدن", short: "سردکردن", color: "var(--blue)", icon: Wind },
};

const faDigits = (value) => String(value ?? "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The demo still works when storage is blocked.
    }
  }, [key, value]);

  return [value, setValue];
}

function timeToSeconds(t) {
  if (!t) return 0;
  const parts = t.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(t) || 0;
}

function formatDuration(totalSeconds) {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${faDigits(minutes)} دقیقه`;
}

function todayLabel() {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
  } catch {
    return "تمرین امروز";
  }
}

function buildSession(level, week) {
  const warmup = WARMUP.parts.flatMap((part) =>
    part.sections.flatMap((section, sectionIndex) =>
      section.moves.map((move, moveIndex) => ({
        ...move,
        id: `warmup-${part.id}-${sectionIndex}-${moveIndex}`,
        stage: "warmup",
        section: section.region || part.title.replace(/^\d+\.\s*/, ""),
        target: move.reps,
        sets: 1,
      }))
    )
  );

  const workout = DAY1_SLOTS
    .filter((slot) => LEVELS[level].slots.includes(slot.slot))
    .flatMap((slot) => {
      const progression = progress[slot.prog](week);
      return slot.ids.map((id) => ({
        ...MOVEMENTS[id],
        id: `main-${id}`,
        sourceId: id,
        stage: "main",
        section: slot.type === "alt" ? `ست ترکیبی ${faDigits(slot.slot)}` : `حرکت ${faDigits(slot.slot)}`,
        sets: progression.sets,
        target:
          progression.mode === "duration"
            ? `${faDigits(progression.duration)} ثانیه نگه‌داشتن`
            : `${faDigits(progression.reps)} تکرار`,
        timerMode: progression.mode === "duration" ? "hold" : "rest",
      }));
    });

  const cooldown = COOLDOWN.moves.map((move, index) => ({
    ...move,
    id: `cooldown-${index}`,
    stage: "cooldown",
    section: "کشش پایانی",
    target: move.hold,
    sets: 1,
  }));

  return [...warmup, ...workout, ...cooldown];
}

function getCompletion(session, steps) {
  const total = steps.reduce((sum, step) => sum + step.sets, 0);
  const completed = steps.reduce(
    (sum, step) => sum + Math.min(session.progress?.[step.id] || 0, step.sets),
    0
  );
  return {
    total,
    completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}

function BrandMark({ compact = false }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <div className="brand-symbol" aria-hidden="true">
        <Activity size={compact ? 21 : 25} strokeWidth={2.6} />
      </div>
      <div>
        <strong>FIT FUSION</strong>
        <span>MOVE WITH CONTROL</span>
      </div>
    </div>
  );
}

function ProgressRing({ value, size = 84 }) {
  return (
    <div
      className="progress-ring"
      style={{ "--progress": `${value * 3.6}deg`, width: size, height: size }}
      aria-label={`${faDigits(value)} درصد پیشرفت`}
    >
      <div className="progress-ring__inner">
        <strong>{faDigits(value)}٪</strong>
        <span>انجام‌شده</span>
      </div>
    </div>
  );
}

function VideoPreview({ video, title, compact = false }) {
  const [open, setOpen] = useState(false);
  if (!video || !VIDEO_IDS[video.file]) return null;

  const videoId = VIDEO_IDS[video.file];
  const start = timeToSeconds(video.t);
  const end = video.end ? timeToSeconds(video.end) : null;
  const source = `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}${end ? `&end=${end}` : ""}&autoplay=1&rel=0`;
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <>
      <button
        className={`video-preview ${compact ? "video-preview--compact" : ""}`}
        onClick={() => setOpen(true)}
        aria-label={`پخش ویدیوی ${title || "حرکت"}`}
      >
        <img src={thumbnail} alt="" loading="lazy" />
        <span className="video-preview__shade" />
        <span className="video-preview__play"><Play fill="currentColor" size={20} /></span>
        {!compact && (
          <span className="video-preview__copy">
            <small>آموزش مربی</small>
            <strong>ویدیوی اجرای صحیح</strong>
          </span>
        )}
      </button>

      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="video-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`ویدیوی ${title || "حرکت"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">آموزش مربی</span>
                <strong>{title || "ویدیوی حرکت"}</strong>
              </div>
              <button className="icon-button" onClick={() => setOpen(false)} aria-label="بستن ویدیو">
                <X size={21} />
              </button>
            </div>
            <div className="video-frame">
              <iframe
                src={source}
                title={title || video.file}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Onboarding({ onComplete }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const valid = gender && Number(height) >= 100 && Number(height) <= 230 && Number(weight) >= 30 && Number(weight) <= 250;

  return (
    <main className="onboarding app-shell">
      <div className="onboarding__glow onboarding__glow--one" />
      <div className="onboarding__glow onboarding__glow--two" />
      <section className="onboarding__content">
        <div className="onboarding__top">
          <BrandMark />
          <span className="demo-pill"><Sparkles size={14} /> نسخه نمایشی</span>
        </div>

        <div className="onboarding__intro">
          <span className="step-kicker">پروفایل اولیه</span>
          <h1>تمرین باید با<br />بدن تو هماهنگ باشد.</h1>
          <p>این اطلاعات پایه، شروع شخصی‌سازی برنامه و اتصال آینده به داده‌های سلامتی است.</p>
        </div>

        <div className="form-card">
          <label className="field">
            <span>نام کوچک <em>اختیاری</em></span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="مثلاً سارا" />
          </label>

          <fieldset className="field">
            <legend>جنسیت</legend>
            <div className="segmented segmented--two">
              <button className={gender === "female" ? "is-active" : ""} onClick={() => setGender("female")}>زن</button>
              <button className={gender === "male" ? "is-active" : ""} onClick={() => setGender("male")}>مرد</button>
            </div>
          </fieldset>

          <div className="metric-grid">
            <label className="field metric-field">
              <span>قد</span>
              <div><input inputMode="numeric" value={height} onChange={(event) => setHeight(event.target.value.replace(/\D/g, ""))} placeholder="۱۷۵" /><b>cm</b></div>
            </label>
            <label className="field metric-field">
              <span>وزن</span>
              <div><input inputMode="numeric" value={weight} onChange={(event) => setWeight(event.target.value.replace(/\D/g, ""))} placeholder="۷۸" /><b>kg</b></div>
            </label>
          </div>

          <button
            className="primary-button primary-button--wide"
            disabled={!valid}
            onClick={() => onComplete({ name: name.trim(), gender, heightCm: Number(height), weightKg: Number(weight) })}
          >
            ساخت پروفایل و ادامه <ChevronLeft size={20} />
          </button>
          <p className="privacy-note"><LockKeyhole size={14} /> اطلاعات این نسخه فقط روی همین دستگاه ذخیره می‌شود.</p>
        </div>
      </section>
    </main>
  );
}

function AppHeader({ profile, minimal = false }) {
  return (
    <header className={`app-header ${minimal ? "app-header--minimal" : ""}`}>
      <BrandMark compact />
      {!minimal && (
        <div className="avatar" aria-label="پروفایل کاربر">
          {profile?.name ? profile.name.slice(0, 1) : <UserRound size={19} />}
        </div>
      )}
    </header>
  );
}

function HomeScreen({ profile, plan, session, steps, onStart, onOpenWorkout }) {
  const completion = getCompletion(session, steps);
  const active = session.status === "active";
  const lastHistory = session.history?.[0];
  const name = profile.name ? ` ${profile.name}` : "";

  return (
    <div className="screen screen--home">
      <AppHeader profile={profile} />
      <section className="home-welcome">
        <span>{todayLabel()}</span>
        <h1>سلام{name}،<br />آماده‌ای حرکت کنیم؟</h1>
      </section>

      <section className="today-card">
        <div className="today-card__top">
          <div>
            <span className="live-chip"><span /> برنامه امروز</span>
            <h2>تعادل و پایداری</h2>
            <p>فاز ۱ · هفته {faDigits(plan.week)} · جلسه ۱</p>
          </div>
          <ProgressRing value={completion.percent} />
        </div>

        <div className="session-facts">
          <span><Clock3 size={16} /> حدود ۶۰ دقیقه</span>
          <span><Dumbbell size={16} /> {faDigits(steps.filter((s) => s.stage === "main").length)} حرکت اصلی</span>
        </div>

        <button className="primary-button primary-button--wide today-cta" onClick={active ? onOpenWorkout : onStart}>
          <span className="cta-play"><Play size={18} fill="currentColor" /></span>
          <span><small>{active ? "از همان‌جایی که بودی" : "جلسه‌ی امروز"}</small>{active ? "ادامه تمرین" : "شروع تمرین"}</span>
          <ChevronLeft size={21} />
        </button>
      </section>

      <section className="week-section">
        <div className="section-title-row">
          <div><span className="eyebrow">ریتم هفتگی</span><h2>این هفته</h2></div>
          <button className="text-button" onClick={onOpenWorkout}>مشاهده برنامه <ChevronLeft size={16} /></button>
        </div>
        <div className="week-track">
          {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day, index) => (
            <div key={day + index} className={`day-dot ${index === 1 ? "is-today" : ""} ${index === 0 ? "is-done" : ""}`}>
              <span>{day}</span>
              <b>{faDigits(index + 1)}</b>
              <i>{index === 0 ? <Check size={11} /> : ""}</i>
            </div>
          ))}
        </div>
      </section>

      <section className="coach-card">
        <VideoPreview video={{ file: "Introduction", t: "00:00:00" }} title="معرفی دوره" compact />
        <div>
          <span className="eyebrow">پیام مربی</span>
          <h3>کنترل، قبل از شدت</h3>
          <p>هدف امروز اجرای باکیفیت حرکت‌هاست، نه فقط تمام‌کردن آن‌ها.</p>
        </div>
      </section>

      <section className="mini-stats">
        <article>
          <span className="stat-icon stat-icon--mint"><Trophy size={19} /></span>
          <div><small>جلسات کامل</small><strong>{faDigits(session.history?.length || 0)}</strong></div>
        </article>
        <article>
          <span className="stat-icon stat-icon--gold"><History size={19} /></span>
          <div><small>آخرین فعالیت</small><strong>{lastHistory ? formatDuration(lastHistory.durationSec) : "هنوز شروع نشده"}</strong></div>
        </article>
      </section>
    </div>
  );
}

function WorkoutHub({ plan, setPlan, session, steps, onStart, onResume, onTempo }) {
  const completion = getCompletion(session, steps);
  const stages = [
    { id: "warmup", title: "گرم‌کردن هدفمند", duration: "۲۵ دقیقه", description: "موبیلیتی و فعال‌سازی" },
    { id: "main", title: "تمرین اصلی", duration: "۲۵ دقیقه", description: `${faDigits(steps.filter((step) => step.stage === "main").length)} حرکت متناسب با سطح` },
    { id: "cooldown", title: "سردکردن", duration: "۱۰ دقیقه", description: "کشش و بازگشت بدن" },
  ];

  return (
    <div className="screen">
      <AppHeader minimal />
      <section className="page-intro">
        <span className="eyebrow">برنامه تمرینی</span>
        <h1>جلسه‌ی اول</h1>
        <p>یک مسیر کامل از آماده‌سازی بدن تا ریکاوری پایانی.</p>
      </section>

      <section className="control-card">
        <div className="control-row">
          <span>سطح اجرا</span>
          <small>حرکت‌ها با سطح تو تنظیم می‌شوند</small>
        </div>
        <div className="segmented segmented--three">
          {Object.entries(LEVELS).map(([key, item]) => (
            <button key={key} disabled={session.status === "active"} className={plan.level === key ? "is-active" : ""} onClick={() => setPlan((value) => ({ ...value, level: key }))}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="control-row control-row--week">
          <span>هفته برنامه</span>
          <small>فاز اول</small>
        </div>
        <div className="week-picker">
          {[1, 2, 3, 4, 5, 6].map((week) => (
            <button key={week} disabled={session.status === "active"} className={plan.week === week ? "is-active" : ""} onClick={() => setPlan((value) => ({ ...value, week }))}>
              {faDigits(week)}
            </button>
          ))}
        </div>
      </section>

      <section className="stage-list">
        <div className="section-title-row">
          <div><span className="eyebrow">ساختار جلسه</span><h2>سه مرحله، یک مسیر</h2></div>
          <span className="progress-label">{faDigits(completion.percent)}٪</span>
        </div>
        {stages.map((stage, index) => {
          const Icon = STAGE_META[stage.id].icon;
          const stageSteps = steps.filter((step) => step.stage === stage.id);
          const stageDone = stageSteps.reduce((sum, step) => sum + Math.min(session.progress?.[step.id] || 0, step.sets), 0);
          const stageTotal = stageSteps.reduce((sum, step) => sum + step.sets, 0);
          return (
            <article className="stage-card" key={stage.id}>
              <div className="stage-card__index">{faDigits(index + 1)}</div>
              <div className={`stage-card__icon stage-card__icon--${stage.id}`}><Icon size={21} /></div>
              <div className="stage-card__copy">
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
              <div className="stage-card__meta"><strong>{stage.duration}</strong><span>{faDigits(stageDone)}/{faDigits(stageTotal)}</span></div>
            </article>
          );
        })}
      </section>

      <section className="session-note-card">
        <div><Activity size={20} /><span><small>ریتم پیشنهادی</small><strong>{SESSION_NOTES.intensity}</strong></span></div>
        <button onClick={onTempo}><TimerReset size={18} /> مربی تمپو</button>
      </section>

      <button className="primary-button primary-button--wide hub-cta" onClick={session.status === "active" ? onResume : onStart}>
        <Play size={19} fill="currentColor" />
        {session.status === "active" ? "ادامه‌ی جلسه" : "شروع جلسه"}
        <ChevronLeft size={20} />
      </button>
    </div>
  );
}

function CountdownSheet({ seconds, title, onClose }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const endAt = useRef(Date.now() + seconds * 1000);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      const next = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setRunning(false);
        if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      setRemaining(Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000)));
      setRunning(false);
    } else {
      endAt.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };

  const reset = (value = seconds) => {
    setRemaining(value);
    endAt.current = Date.now() + value * 1000;
    setRunning(true);
  };

  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="modal-backdrop modal-backdrop--bottom" onClick={onClose}>
      <section className="timer-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="modal-head">
          <div><span className="eyebrow">ریکاوری فعال</span><strong>{title}</strong></div>
          <button className="icon-button" onClick={onClose} aria-label="بستن تایمر"><X size={21} /></button>
        </div>
        <div className={`timer-orbit ${remaining <= 3 ? "is-ending" : ""}`}>
          <div><strong>{faDigits(`${mins}:${secs}`)}</strong><span>{remaining ? "نفس عمیق و آرام" : "آماده‌ای، ادامه بده"}</span></div>
        </div>
        <div className="timer-presets">
          {[30, 60, 90].map((value) => <button key={value} onClick={() => reset(value)}>{faDigits(value)} ثانیه</button>)}
        </div>
        <div className="timer-actions">
          <button className="secondary-icon-button" onClick={() => reset()} aria-label="شروع دوباره تایمر"><RotateCcw size={21} /></button>
          <button className="timer-play" onClick={toggle} aria-label={running ? "توقف تایمر" : "ادامه تایمر"}>
            {running ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}
          </button>
          <button className="secondary-icon-button" onClick={onClose} aria-label="رد کردن تایمر"><ChevronLeft size={23} /></button>
        </div>
      </section>
    </div>
  );
}

function TempoSheet({ onClose }) {
  const phases = [
    { key: "down", label: "پایین، همراه دم", duration: 4, color: "var(--mint)" },
    { key: "hold", label: "مکث و کنترل", duration: 2, color: "var(--gold)" },
    { key: "up", label: "بالا، همراه بازدم", duration: 1, color: "var(--coral)" },
  ];
  const cycleLength = phases.reduce((sum, phase) => sum + phase.duration, 0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(null);
  const pausedElapsed = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setElapsed(pausedElapsed.current + (Date.now() - startedAt.current) / 1000), 100);
    return () => window.clearInterval(id);
  }, [running]);

  const position = elapsed % cycleLength;
  let cursor = 0;
  let active = phases[0];
  let phasePosition = position;
  phases.forEach((phase) => {
    if (position >= cursor && position < cursor + phase.duration) {
      active = phase;
      phasePosition = position - cursor;
    }
    cursor += phase.duration;
  });
  const remaining = Math.max(1, Math.ceil(active.duration - phasePosition));
  const cycles = Math.floor(elapsed / cycleLength);

  const toggle = () => {
    if (running) {
      pausedElapsed.current = elapsed;
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    pausedElapsed.current = 0;
  };

  return (
    <div className="modal-backdrop modal-backdrop--bottom" onClick={onClose}>
      <section className="timer-sheet" role="dialog" aria-modal="true" aria-label="مربی تمپو" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="modal-head">
          <div><span className="eyebrow">ریتم اجرای حرکت</span><strong>مربی تمپو ۴ · ۲ · ۱</strong></div>
          <button className="icon-button" onClick={onClose} aria-label="بستن مربی تمپو"><X size={21} /></button>
        </div>
        <div className="tempo-visual" style={{ "--tempo-color": active.color }}>
          <div><strong>{faDigits(remaining)}</strong><span>{active.label}</span></div>
        </div>
        <div className="tempo-phases">
          {phases.map((phase) => <span key={phase.key} className={active.key === phase.key ? "is-active" : ""} style={{ "--phase-color": phase.color }}>{faDigits(phase.duration)} ثانیه</span>)}
        </div>
        <p className="cycle-count">چرخه‌های کامل: <strong>{faDigits(cycles)}</strong></p>
        <div className="timer-actions">
          <button className="secondary-icon-button" onClick={reset} aria-label="شروع دوباره"><RotateCcw size={21} /></button>
          <button className="timer-play" onClick={toggle} aria-label={running ? "توقف تمپو" : "شروع تمپو"}>
            {running ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}
          </button>
          <button className="secondary-icon-button" onClick={onClose} aria-label="بستن"><Check size={22} /></button>
        </div>
      </section>
    </div>
  );
}

function GuidedSession({ steps, session, setSession, onExit, onFinish }) {
  const [showDetails, setShowDetails] = useState(true);
  const [timer, setTimer] = useState(null);
  const currentIndex = Math.min(session.currentIndex || 0, steps.length - 1);
  const step = steps[currentIndex];
  const complete = getCompletion(session, steps);
  const currentSets = session.progress?.[step.id] || 0;
  const stage = STAGE_META[step.stage];
  const StageIcon = stage.icon;

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowDetails(true);
  }, [currentIndex]);

  const completeSet = () => {
    const nextCount = Math.min(currentSets + 1, step.sets);
    const nextProgress = { ...session.progress, [step.id]: nextCount };
    const isLastSet = nextCount >= step.sets;
    const isLastStep = currentIndex >= steps.length - 1;

    setSession((value) => ({ ...value, progress: nextProgress }));

    if (!isLastSet) {
      setTimer({ seconds: step.timerMode === "hold" ? 35 : 90, title: step.timerMode === "hold" ? "زمان نگه‌داشتن" : "استراحت بین ست‌ها" });
      return;
    }

    if (isLastStep) {
      onFinish(nextProgress);
      return;
    }

    window.setTimeout(() => {
      setSession((value) => ({ ...value, progress: nextProgress, currentIndex: currentIndex + 1 }));
    }, 220);
  };

  const goTo = (index) => setSession((value) => ({ ...value, currentIndex: Math.max(0, Math.min(index, steps.length - 1)) }));

  return (
    <div className="guided-session">
      <header className="guided-header">
        <button className="icon-button" onClick={onExit} aria-label="خروج از جلسه"><ChevronRight size={23} /></button>
        <div><span>{stage.label}</span><strong>{faDigits(currentIndex + 1)} از {faDigits(steps.length)}</strong></div>
        <button className="icon-button" onClick={() => setTimer({ seconds: 90, title: "تایمر آزاد" })} aria-label="بازکردن تایمر"><Clock3 size={21} /></button>
      </header>
      <div className="guided-progress"><span style={{ width: `${((currentIndex + currentSets / step.sets) / steps.length) * 100}%` }} /></div>

      <main className="guided-content">
        <div className="stage-kicker" style={{ color: stage.color }}><StageIcon size={16} /> {stage.short} · {step.section}</div>
        <h1>{step.name}</h1>
        <div className="target-row">
          <strong>{step.target}</strong>
          {step.sets > 1 && <span>{faDigits(step.sets)} ست</span>}
          {step.optional && <span className="optional-chip">اختیاری</span>}
        </div>

        <VideoPreview video={step.video} title={step.name} />

        {step.sets > 1 && (
          <section className="set-progress-card">
            <div><span>پیشرفت حرکت</span><strong>ست {faDigits(Math.min(currentSets + 1, step.sets))} از {faDigits(step.sets)}</strong></div>
            <div className="set-dots">
              {Array.from({ length: step.sets }).map((_, index) => (
                <span key={index} className={index < currentSets ? "is-done" : index === currentSets ? "is-current" : ""}>
                  {index < currentSets ? <Check size={13} /> : faDigits(index + 1)}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="details-card">
          <button className="details-card__toggle" onClick={() => setShowDetails((value) => !value)} aria-expanded={showDetails}>
            <span><Info size={18} /> نکات اجرای صحیح</span>
            <ChevronDown size={19} className={showDetails ? "is-open" : ""} />
          </button>
          {showDetails && (
            <div className="details-card__body">
              {step.equipment?.length > 0 && <p className="equipment-line"><Dumbbell size={16} /> وسایل: {step.equipment.join("، ")}</p>}
              <ul>{step.cues?.map((cue, index) => <li key={index}><span>{faDigits(index + 1)}</span><p>{cue}</p></li>)}</ul>
              {step.variantEasy && <div className="variant variant--easy"><span>نسخه ساده‌تر</span><p>{step.variantEasy}</p></div>}
              {step.variantAdvanced && <div className="variant variant--advanced"><span>نسخه پیشرفته</span><p>{step.variantAdvanced}</p></div>}
              {step.safetyNote && <div className="safety-inline"><AlertTriangle size={17} /><p>{step.safetyNote}</p></div>}
            </div>
          )}
        </section>
      </main>

      <footer className="guided-actions">
        <button className="guided-actions__side" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} aria-label="حرکت قبلی"><ChevronRight size={22} /></button>
        <button className="complete-set-button" onClick={completeSet}>
          <span className="complete-icon"><CheckCircle2 size={22} /></span>
          <span><small>{step.sets > 1 ? `ست ${faDigits(Math.min(currentSets + 1, step.sets))}` : "این مرحله"}</small>{step.sets > 1 ? "ثبت ست" : "انجام شد"}</span>
        </button>
        <button className="guided-actions__side" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === steps.length - 1} aria-label="حرکت بعدی"><ChevronLeft size={22} /></button>
      </footer>

      {timer && <CountdownSheet seconds={timer.seconds} title={timer.title} onClose={() => setTimer(null)} />}
    </div>
  );
}

function SessionSummary({ summary, feedback, onFeedback, onHome, onRestart }) {
  const [rating, setRating] = useState(feedback?.rating || null);
  const [pain, setPain] = useState(feedback?.pain ?? null);

  const save = (nextRating = rating, nextPain = pain) => {
    setRating(nextRating);
    setPain(nextPain);
    onFeedback({ rating: nextRating, pain: nextPain });
  };

  return (
    <div className="summary-screen screen">
      <div className="success-orbit"><Trophy size={43} /></div>
      <span className="eyebrow">جلسه کامل شد</span>
      <h1>عالی بود.<br />بدنت امروز کار کرد.</h1>
      <p>ثبات و کیفیت حرکت، نتیجه‌ی تکرارهای کنترل‌شده است.</p>

      <section className="summary-grid">
        <article><Clock3 size={20} /><strong>{formatDuration(summary.durationSec)}</strong><span>زمان تمرین</span></article>
        <article><CheckCircle2 size={20} /><strong>{faDigits(summary.completed)}</strong><span>ست و مرحله</span></article>
        <article><Activity size={20} /><strong>{faDigits(summary.percent)}٪</strong><span>تکمیل برنامه</span></article>
      </section>

      <section className="feedback-card">
        <div><span className="eyebrow">بازخورد به مربی</span><h2>شدت جلسه چطور بود؟</h2></div>
        <div className="rating-row">
          {[1, 2, 3, 4, 5].map((value) => <button key={value} className={rating === value ? "is-active" : ""} onClick={() => save(value, pain)}>{faDigits(value)}</button>)}
        </div>
        <div className="pain-row">
          <span>درد غیرعادی داشتی؟</span>
          <div><button className={pain === false ? "is-active" : ""} onClick={() => save(rating, false)}>خیر</button><button className={pain === true ? "is-alert" : ""} onClick={() => save(rating, true)}>بله</button></div>
        </div>
      </section>

      <button className="primary-button primary-button--wide" onClick={onHome}>بازگشت به خانه <ChevronLeft size={20} /></button>
      <button className="ghost-button" onClick={onRestart}><RotateCcw size={17} /> اجرای دوباره‌ی دمو</button>
    </div>
  );
}

function LibraryScreen() {
  const [section, setSection] = useState("patterns");
  const [openId, setOpenId] = useState("squat");

  return (
    <div className="screen">
      <AppHeader minimal />
      <section className="page-intro">
        <span className="eyebrow">دانش حرکتی</span>
        <h1>کتابخانه</h1>
        <p>قبل از سرعت و وزنه، الگوی صحیح حرکت را بشناس.</p>
      </section>

      <div className="segmented library-switch">
        <button className={section === "patterns" ? "is-active" : ""} onClick={() => setSection("patterns")}><BookOpen size={17} /> الگوها</button>
        <button className={section === "safety" ? "is-active" : ""} onClick={() => setSection("safety")}><ShieldAlert size={17} /> ایمنی</button>
      </div>

      {section === "patterns" ? (
        <section className="accordion-list">
          {PATTERNS.map((pattern) => (
            <article className={`accordion-card ${openId === pattern.id ? "is-open" : ""}`} key={pattern.id}>
              <button onClick={() => setOpenId(openId === pattern.id ? null : pattern.id)} aria-expanded={openId === pattern.id}>
                <span className="pattern-icon"><Footprints size={19} /></span>
                <span><strong>{pattern.nameFa}</strong><small>{pattern.name}</small></span>
                <ChevronDown size={20} />
              </button>
              {openId === pattern.id && (
                <div className="accordion-body"><p>این نشانه‌ها نباید در حرکت دیده شوند:</p><div className="avoid-grid">{pattern.avoid.map((item) => <span key={item}>{item}</span>)}</div></div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="safety-list">
          <div className="safety-hero"><ShieldAlert size={23} /><div><strong>بدون درد، با کنترل</strong><p>در صورت درد تیز، بی‌حسی، سرگیجه یا از دست‌رفتن کنترل، تمرین را متوقف کن.</p></div></div>
          {SAFETY.map((item, index) => (
            <article key={item.title}><span className={index === 1 || index === 6 ? "is-danger" : ""}>{index === 1 || index === 6 ? <AlertTriangle size={18} /> : <Info size={18} />}</span><div><h3>{item.title}</h3><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul></div></article>
          ))}
        </section>
      )}
    </div>
  );
}

function ProfileScreen({ profile, setProfile, session, plan, onReset }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const saveProfile = () => {
    setProfile(draft);
    setEditing(false);
  };

  return (
    <div className="screen">
      <AppHeader minimal />
      <section className="profile-hero">
        <div className="profile-avatar">{profile.name ? profile.name.slice(0, 1) : <UserRound size={29} />}</div>
        <div><span className="eyebrow">پروفایل ورزشکار</span><h1>{profile.name || "ورزشکار Fit Fusion"}</h1><p>فاز ۱ · سطح {LEVELS[plan.level].label}</p></div>
      </section>

      <section className="body-metrics">
        <article><span>قد</span><strong>{faDigits(profile.heightCm)}</strong><small>cm</small></article>
        <article><span>وزن</span><strong>{faDigits(profile.weightKg)}</strong><small>kg</small></article>
        <article><span>جلسه</span><strong>{faDigits(session.history?.length || 0)}</strong><small>کامل</small></article>
      </section>

      <section className="health-card">
        <div className="health-card__icons"><span><Watch size={21} /></span><span><HeartPulse size={21} /></span></div>
        <div><span className="eyebrow">در نسخه‌ی اصلی</span><h2>اتصال به داده‌های سلامتی</h2><p>ضربان قلب، خواب، ریکاوری و فعالیت روزانه می‌تواند تصویر کامل‌تری به مربی بدهد.</p></div>
        <button disabled>اتصال ساعت و Health App <LockKeyhole size={15} /></button>
      </section>

      <section className="settings-card">
        <button onClick={() => setEditing(true)}><UserRound size={19} /><span><strong>ویرایش اطلاعات پایه</strong><small>نام، قد و وزن</small></span><ChevronLeft size={19} /></button>
        <button><BarChart3 size={19} /><span><strong>گزارش پیشرفت</strong><small>پس از چند جلسه فعال می‌شود</small></span><ChevronLeft size={19} /></button>
        <button className="reset-row" onClick={onReset}><RotateCcw size={19} /><span><strong>بازنشانی نسخه‌ی دمو</strong><small>پاک‌کردن اطلاعات ذخیره‌شده</small></span><ChevronLeft size={19} /></button>
      </section>

      {editing && (
        <div className="modal-backdrop modal-backdrop--bottom" onClick={() => setEditing(false)}>
          <section className="edit-sheet" role="dialog" aria-modal="true" aria-label="ویرایش پروفایل" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="modal-head"><strong>ویرایش اطلاعات پایه</strong><button className="icon-button" onClick={() => setEditing(false)} aria-label="بستن"><X size={21} /></button></div>
            <label className="field"><span>نام کوچک</span><input value={draft.name || ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <div className="metric-grid">
              <label className="field metric-field"><span>قد</span><div><input inputMode="numeric" value={draft.heightCm} onChange={(event) => setDraft({ ...draft, heightCm: Number(event.target.value) })} /><b>cm</b></div></label>
              <label className="field metric-field"><span>وزن</span><div><input inputMode="numeric" value={draft.weightKg} onChange={(event) => setDraft({ ...draft, weightKg: Number(event.target.value) })} /><b>kg</b></div></label>
            </div>
            <button className="primary-button primary-button--wide" onClick={saveProfile}>ذخیره تغییرات <Check size={19} /></button>
          </section>
        </div>
      )}
    </div>
  );
}

function BottomNav({ active, onChange }) {
  const items = [
    { id: "home", label: "خانه", icon: Home },
    { id: "workout", label: "تمرین", icon: Dumbbell },
    { id: "library", label: "کتابخانه", icon: LayoutGrid },
    { id: "profile", label: "پروفایل", icon: UserRound },
  ];
  return (
    <nav className="bottom-nav" aria-label="ناوبری اصلی">
      {items.map((item) => {
        const Icon = item.icon;
        return <button key={item.id} className={active === item.id ? "is-active" : ""} onClick={() => onChange(item.id)} aria-current={active === item.id ? "page" : undefined}><span><Icon size={21} /></span><small>{item.label}</small></button>;
      })}
    </nav>
  );
}

export default function AppV2() {
  const [profile, setProfile] = usePersistedState(PROFILE_KEY, null);
  const [plan, setPlan] = usePersistedState(PLAN_KEY, { level: "intermediate", week: 1 });
  const [session, setSession] = usePersistedState(SESSION_KEY, EMPTY_SESSION);
  const [activeTab, setActiveTab] = useState("home");
  const [guided, setGuided] = useState(false);
  const [showTempo, setShowTempo] = useState(false);
  const steps = useMemo(() => buildSession(plan.level, plan.week), [plan.level, plan.week]);

  const startSession = () => {
    if (session.status !== "active") {
      setSession((value) => ({
        ...value,
        status: "active",
        currentIndex: 0,
        progress: {},
        startedAt: new Date().toISOString(),
        lastSummary: null,
        feedback: null,
      }));
    }
    setActiveTab("workout");
    setGuided(true);
  };

  const finishSession = (finalProgress) => {
    const finishedAt = Date.now();
    const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : finishedAt - 60 * 60 * 1000;
    const completion = getCompletion({ ...session, progress: finalProgress }, steps);
    const summary = {
      id: finishedAt,
      date: new Date(finishedAt).toISOString(),
      durationSec: Math.max(60, Math.round((finishedAt - startedAt) / 1000)),
      completed: completion.completed,
      percent: completion.percent,
      level: plan.level,
      week: plan.week,
    };
    setSession((value) => ({
      ...value,
      status: "completed",
      progress: finalProgress,
      lastSummary: summary,
      history: [summary, ...(value.history || [])].slice(0, 12),
    }));
    setGuided(false);
  };

  const restartSession = () => {
    setSession((value) => ({ ...EMPTY_SESSION, history: value.history || [] }));
    setActiveTab("workout");
  };

  const resetDemo = () => {
    if (!window.confirm("همه‌ی اطلاعات ذخیره‌شده‌ی نسخه دمو پاک شود؟")) return;
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(PLAN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setProfile(null);
    setPlan({ level: "intermediate", week: 1 });
    setSession(EMPTY_SESSION);
    setActiveTab("home");
  };

  if (!profile) return <Onboarding onComplete={setProfile} />;

  if (guided && session.status === "active") {
    return <GuidedSession steps={steps} session={session} setSession={setSession} onExit={() => setGuided(false)} onFinish={finishSession} />;
  }

  const content = session.status === "completed" && activeTab === "workout" && session.lastSummary ? (
    <SessionSummary
      summary={session.lastSummary}
      feedback={session.feedback}
      onFeedback={(feedback) => setSession((value) => ({ ...value, feedback }))}
      onHome={() => setActiveTab("home")}
      onRestart={restartSession}
    />
  ) : activeTab === "home" ? (
    <HomeScreen profile={profile} plan={plan} session={session} steps={steps} onStart={startSession} onOpenWorkout={() => setActiveTab("workout")} />
  ) : activeTab === "workout" ? (
    <WorkoutHub plan={plan} setPlan={setPlan} session={session} steps={steps} onStart={startSession} onResume={() => setGuided(true)} onTempo={() => setShowTempo(true)} />
  ) : activeTab === "library" ? (
    <LibraryScreen />
  ) : (
    <ProfileScreen profile={profile} setProfile={setProfile} session={session} plan={plan} onReset={resetDemo} />
  );

  return (
    <div className="app-shell" dir="rtl" lang="fa">
      {content}
      <BottomNav active={activeTab} onChange={setActiveTab} />
      {showTempo && <TempoSheet onClose={() => setShowTempo(false)} />}
    </div>
  );
}
