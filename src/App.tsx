import { createContext, useContext, useEffect, useMemo, useState, type DragEvent as ReactDragEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircuitBoard,
  Clock3,
  Code2,
  Eye,
  EyeOff,
  Flame,
  FlaskConical,
  Gauge,
  Globe2,
  GraduationCap,
  GripVertical,
  Home,
  Layers3,
  Lightbulb,
  Lock,
  Menu,
  MessageCircleQuestion,
  Mic,
  MicOff,
  MoreHorizontal,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Undo2,
  User,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { Badge, Button, Card, Heading, IconButton, Input, Progress, Select, Toggle } from "./ui";
import { CourseModule } from "./CourseModule";
import { ExplainWithAIModal } from "./components/ExplainWithAIModal";
import { FloatingAIChatbot } from "./components/FloatingAIChatbot";
import { copy, I18nContext, localeNames, useI18n, type Locale } from "./context/I18nContext";
import {
  learningModules,
  learningLessons,
  getModule,
  getLesson,
  dashboardStats,
  activities,
  currentUser,
  assessments as mockAssessmentsSummary,
} from "./mockData";
import { assessments as fullAssessments } from "./data/assessments";
import { instructorLearners } from "./data/instructorAnalytics";
import { presetCircuits } from "./data/circuitData";

export type View =
  | "dashboard"
  | "agent"
  | "learn"
  | "lesson"
  | "module"
  | "lab"
  | "results"
  | "ai"
  | "quiz"
  | "challenges"
  | "progress"
  | "profile"
  | "settings"
  | "instructor";

type Entry = "landing" | "login" | "signup" | "onboarding" | "app";

function LanguageControl({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className={`language-control ${compact ? "language-compact" : ""}`}>
      <IconButton label={`Language: ${localeNames[locale]}`} onClick={() => setOpen(!open)}>
        <Globe2 size={19} />
        <span className="locale-code">{locale.toUpperCase()}</span>
      </IconButton>
      {open && (
        <Card className="language-menu">
          <div className="language-menu-head">
            <Globe2 size={17} />
            <div>
              <strong>Choose language</strong>
              <small>Lessons and AI adapt instantly</small>
            </div>
          </div>
          {Object.entries(localeNames).map(([value, label]) => (
            <Button
              variant="ghost"
              className={locale === value ? "active" : ""}
              key={value}
              onClick={() => {
                setLocale(value as Locale);
                setOpen(false);
              }}
            >
              <span>{value.toUpperCase()}</span>
              {label}
              {locale === value && <Check size={15} />}
            </Button>
          ))}
        </Card>
      )}
    </div>
  );
}

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: Home },
  { id: "learn" as View, label: "Learn", icon: BookOpen },
  { id: "lab" as View, label: "Quantum Lab", icon: CircuitBoard },
  { id: "challenges" as View, label: "Challenges", icon: Trophy },
  { id: "ai" as View, label: "AI Tutor", icon: Bot },
  { id: "progress" as View, label: "Progress", icon: BarChart3 },
  { id: "instructor" as View, label: "Instructor", icon: GraduationCap },
] as const;

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`logo ${dark ? "logo-dark" : ""}`}>
      <span className="qb-mark" aria-hidden="true">
        <span className="qb-ring" />
        <span className="qb-tail" />
      </span>
      <span className="qb-wordmark">Qubrix</span>
    </div>
  );
}

function Landing({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  const features = [
    { icon: BookOpen, title: "Learn", text: "Clear, structured lessons built for curious minds." },
    { icon: CircuitBoard, title: "Build", text: "Create circuits visually, one gate at a time." },
    { icon: Play, title: "Simulate", text: "Run real simulations and see quantum behavior." },
    { icon: Sparkles, title: "Understand", text: "Get patient, contextual guidance from Qubrix AI." },
  ];
  return (
    <div className="landing">
      <header className="marketing-nav">
        <Logo />
        <div className="marketing-links">
          <Button variant="ghost" onClick={onStart}>Learn</Button>
          <Button variant="ghost" onClick={onStart}>Quantum Lab</Button>
          <Button variant="ghost" onClick={onStart}>Challenges</Button>
          <Button variant="ghost" onClick={onStart}>AI Tutor</Button>
        </div>
        <div className="nav-actions">
          <LanguageControl compact />
          <Button variant="ghost" onClick={onLogin}>Log in</Button>
          <Button onClick={onStart}>Get started</Button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <Badge tone="primary"><Sparkles size={14} /> Your quantum journey starts here</Badge>
            <Heading level={1}>Quantum computing, finally made <span>understandable.</span></Heading>
            <p>Learn concepts, build quantum circuits, run simulations and understand every result with AI-powered guidance.</p>
            <div className="hero-actions">
              <Button onClick={onStart} icon={<ArrowRight size={17} />}>Start learning</Button>
              <Button variant="outline" onClick={onStart} icon={<FlaskConical size={17} />}>Explore Quantum Lab</Button>
            </div>
            <div className="learner-proof">
              <div className="avatar-stack"><span>A</span><span>M</span><span>J</span></div>
              <div><strong>12,000+ learners</strong><small>building quantum confidence</small></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <Card className="circuit-card">
              <div className="card-top"><Badge tone="cyan">LIVE CIRCUIT</Badge><span className="status-dot">Ready</span></div>
              <div className="mini-circuit">
                <div><code>q₀ |0⟩</code><span className="wire" /><b>H</b><span className="wire" /><i>●</i><span className="wire" /><em>M</em></div>
                <div><code>q₁ |0⟩</code><span className="wire long" /><b className="cyan">X</b><span className="wire" /><em>M</em></div>
              </div>
              <div className="circuit-footer"><span>Bell state</span><Button onClick={onStart} icon={<Play size={15} />}>Run</Button></div>
            </Card>
            <Card className="bloch-card">
              <small>QUBIT STATE</small><div className="bloch"><span /><i /></div>
              <strong>|+⟩ Superposition</strong><small>50% |0⟩ · 50% |1⟩</small>
            </Card>
            <Card className="ai-float"><Bot size={20}/><div><strong>Qubrix AI</strong><small>I’ll explain every result.</small></div></Card>
          </div>
        </section>
        <section className="section-block">
          <div className="section-heading"><Badge tone="cyan">LEARN BY DOING</Badge><Heading level={2}>Your path from curious to quantum</Heading><p>No intimidating jargon. Just guided practice, visual experiments, and explanations that click.</p></div>
          <div className="feature-grid">{features.map(({ icon: Icon, title, text }, i) => <Card key={title} className="feature-card"><span className={`feature-icon tone-${i}`}><Icon size={22}/></span><Badge tone="neutral">0{i + 1}</Badge><Heading level={3}>{title}</Heading><p>{text}</p></Card>)}</div>
        </section>
        <section className="how-section">
          <div><Badge tone="primary">THE QUBRIX METHOD</Badge><Heading level={2}>Learn quantum computing by doing.</Heading><p>A connected learning loop that turns difficult theory into lasting intuition.</p></div>
          <div className="steps">
            {["Learn a concept", "Build the circuit", "Run a simulation", "Visualize results", "Ask Qubrix AI", "Test yourself"].map((step, i) => <div className="step" key={step}><span>{i + 1}</span><strong>{step}</strong>{i < 5 && <ChevronRight size={18}/>}</div>)}
          </div>
          <div className="frameworks"><span>Practice with leading frameworks</span>{["Qiskit", "PennyLane", "Cirq", "qBraid"].map(x => <strong key={x}>{x}</strong>)}</div>
        </section>
        <section className="final-cta"><div className="orb-art" /><Badge tone="cyan">START FREE</Badge><Heading level={2}>Ready to think quantum?</Heading><p>Build your personalized path and run your first circuit in minutes.</p><Button onClick={onStart} icon={<ArrowRight size={17}/>}>Create your learning path</Button></section>
      </main>
    </div>
  );
}

function Auth({ mode, setEntry }: { mode: "login" | "signup"; setEntry: (e: Entry) => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = () => { setLoading(true); window.setTimeout(() => setEntry(mode === "signup" ? "onboarding" : "app"), 700); };
  return (
    <div className="auth-shell">
      <div className="auth-art">
        <Logo dark />
        <div className="auth-illustration"><div className="atom-ring r1"/><div className="atom-ring r2"/><div className="atom-ring r3"/><span>Q</span></div>
        <div><Heading level={2}>Small steps.<br/>Big quantum leaps.</Heading><p>Learn complex ideas through visual experiments and clear guidance.</p></div>
      </div>
      <div className="auth-panel">
        <div className="auth-utility"><LanguageControl compact/><Button variant="ghost" icon={<ArrowLeft size={16}/>} onClick={() => setEntry("landing")}>Back to home</Button></div>
        <div className="auth-form">
          <Badge tone="primary">{mode === "signup" ? "JOIN QUBRIX" : "WELCOME BACK"}</Badge>
          <Heading level={1}>{mode === "signup" ? "Create your account" : "Continue your quantum journey."}</Heading>
          <p>{mode === "signup" ? "Your personalized learning path is a minute away." : "Pick up exactly where you left off."}</p>
          {mode === "signup" && <Input label="Full name" placeholder="Alex Morgan" />}
          <Input label="Email address" type="email" placeholder="alex@example.com" />
          <div className="password-field"><Input label="Password" type={show ? "text" : "password"} placeholder="At least 8 characters" /><IconButton label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</IconButton></div>
          {mode === "signup" && <><div className="strength"><span/><span/><span/><span/><small>Strong password</small></div><Input label="Confirm password" type="password" placeholder="Repeat password" /></>}
          <div className="auth-options"><label><input type="checkbox" defaultChecked/><span>{mode === "signup" ? "I agree to Terms & Privacy" : "Remember me"}</span></label>{mode === "login" && <Button variant="ghost">Forgot password?</Button>}</div>
          <Button className="full" loading={loading} onClick={submit}>{mode === "signup" ? "Create account" : "Log in"}</Button>
          <div className="divider"><span>OR</span></div>
          <Button variant="outline" className="full" onClick={submit}><strong className="google-g">G</strong> Continue with Google</Button>
          <div className="switch-auth">{mode === "signup" ? "Already have an account?" : "New to Qubrix?"}<Button variant="ghost" onClick={() => setEntry(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Log in" : "Create an account"}</Button></div>
        </div>
      </div>
    </div>
  );
}

function Onboarding({ done }: { done: () => void }) {
  const [step, setStep] = useState(1);
  const [choice, setChoice] = useState("");
  const [processing, setProcessing] = useState(false);
  const content = [
    { title: "What brings you to Qubrix?", sub: "We’ll use this to meet you at the right level.", options: ["I’m completely new to quantum computing", "I’m a student learning quantum computing", "I already know the basics", "I’m exploring quantum programming"] },
    { title: "What would you like to achieve?", sub: "Choose the goal that matters most right now.", options: ["Understand quantum fundamentals", "Learn quantum algorithms", "Build quantum circuits", "Learn Qiskit / quantum programming", "Prepare for academics or research"] },
    { title: "How comfortable are you with programming?", sub: "There’s no wrong answer — we’ll adapt your exercises.", options: ["Beginner", "Intermediate", "Advanced"] },
  ][step - 1];
  const next = () => {
    if (step < 3) { setStep(step + 1); setChoice(""); }
    else { setProcessing(true); window.setTimeout(done, 1400); }
  };
  if (processing) return <div className="processing"><div className="quantum-loader"><span/><span/><span/></div><Heading level={2}>Building your Qubrix learning path...</Heading><p>Matching lessons, labs, and challenges to your goals.</p><div className="processing-steps"><span><Check size={14}/> Quantum fundamentals</span><span><Check size={14}/> Qiskit practice</span><span>Personalizing pace...</span></div></div>;
  return (
    <div className="onboarding">
      <header><Logo/><div className="onboarding-tools"><LanguageControl compact/><Button variant="ghost" onClick={done}>Skip for now</Button></div></header>
      <div className="onboarding-card">
        <div className="stepper">{[1,2,3].map(n => <span key={n} className={n <= step ? "active" : ""}>{n < step ? <Check size={14}/> : n}</span>)}<i /></div>
        <Badge tone="primary">STEP {step} OF 3</Badge>
        <Heading level={1}>{content.title}</Heading><p>{content.sub}</p>
        <div className={`choice-grid ${step === 3 ? "three" : ""}`}>
          {content.options.map((option, i) => <Button key={option} variant="outline" className={`choice ${choice === option ? "selected" : ""}`} onClick={() => setChoice(option)}><span>{["01","02","03","04","05"][i]}</span>{option}{choice === option && <CheckCircle2 size={18}/>}</Button>)}
        </div>
        <div className="onboard-actions"><Button variant="ghost" disabled={step === 1} onClick={() => {setStep(step - 1); setChoice("");}} icon={<ArrowLeft size={16}/>}>Back</Button><Button disabled={!choice} onClick={next} icon={<ArrowRight size={16}/>}>{step === 3 ? "Generate my learning path" : "Continue"}</Button></div>
      </div>
    </div>
  );
}

function AppShell({
  view,
  setView,
  onLogout,
  children,
}: {
  view: View;
  setView: (v: View) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [languageMenu, setLanguageMenu] = useState(false);
  const { t, locale, setLocale } = useI18n();

  const translatedNav: Record<string, string> = {
    dashboard: t.dashboard,
    learn: t.learn,
    lab: t.lab,
    challenges: t.challenges,
    ai: t.ai,
    progress: t.progress,
    instructor: "Instructor",
  };

  return (
    <div className="top-nav-shell">
      <header className="app-navbar">
        <div className="navbar-main">
          <div style={{ cursor: "pointer" }} onClick={() => setView("dashboard")}>
            <Logo />
          </div>
          <nav className="navbar-links">
            {navItems.map(({ id, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                className={view === id || (view === "lesson" && id === "learn") || (view === "module" && id === "learn") || (view === "results" && id === "lab") || (view === "agent" && id === "ai") || (view === "quiz" && id === "challenges") ? "active" : ""}
                onClick={() => setView(id)}
                icon={<Icon size={18} />}
              >
                <span>{translatedNav[id] || id}</span>
                {id === "challenges" && <small>3</small>}
              </Button>
            ))}
          </nav>
          <div className="top-actions">
            <div className="streak-pill" onClick={() => setView("progress")} style={{ cursor: "pointer" }}>
              <Zap size={15} />
              <span><strong>12</strong><small>day streak</small></span>
            </div>
            <IconButton label="Notifications" onClick={() => setNotifications(!notifications)}>
              <Bell size={19} />
              <span className="alert-dot" />
            </IconButton>
            <Button
              variant="ghost"
              className={`profile-trigger ${profileMenu ? "active" : ""}`}
              onClick={() => {
                setProfileMenu(!profileMenu);
                setLanguageMenu(false);
              }}
            >
              <span className="avatar">AM</span>
              <ChevronDown size={15} />
            </Button>
          </div>
        </div>
        {profileMenu && (
          <Card className="profile-dropdown">
            <div className="dropdown-user" onClick={() => { setView("profile"); setProfileMenu(false); }} style={{ cursor: "pointer" }}>
              <span className="avatar large">AM</span>
              <div>
                <strong>Alex Morgan</strong>
                <small>Level 7 · Quantum Explorer</small>
              </div>
            </div>
            <div className="dropdown-menu-list">
              <Button variant="ghost" onClick={() => { setView("profile"); setProfileMenu(false); }} icon={<User size={17} />}>
                <span>Your profile</span>
                <ChevronRight size={15} />
              </Button>
              <Button variant="ghost" onClick={() => setLanguageMenu(!languageMenu)} icon={<Globe2 size={17} />}>
                <span>Language</span>
                <small>{localeNames[locale]}</small>
                <ChevronDown className={languageMenu ? "rotate" : ""} size={15} />
              </Button>
              {languageMenu && (
                <div className="dropdown-languages">
                  {Object.entries(localeNames).map(([value, label]) => (
                    <Button
                      variant="ghost"
                      className={locale === value ? "selected" : ""}
                      key={value}
                      onClick={() => setLocale(value as Locale)}
                    >
                      <span>{value.toUpperCase()}</span>
                      {label}
                      {locale === value && <Check size={14} />}
                    </Button>
                  ))}
                </div>
              )}
              <Button variant="ghost" onClick={() => { setView("settings"); setProfileMenu(false); }} icon={<Settings size={17} />}>
                <span>Settings</span>
                <ChevronRight size={15} />
              </Button>
              <Button variant="ghost" onClick={onLogout} icon={<ArrowLeft size={17} />}>
                <span>Log out</span>
                <ChevronRight size={15} />
              </Button>
            </div>
            <div className="dropdown-foot">
              <span><span className="status-dot" /> Qubrix AI is active</span>
              <small>Personalization on</small>
            </div>
          </Card>
        )}
        {notifications && <NotificationPanel close={() => setNotifications(false)} setView={setView} />}
      </header>
      <main className="workspace">{children}</main>
    </div>
  );
}

function NotificationPanel({ close, setView }: { close: () => void; setView: (v: View) => void }) {
  return (
    <Card className="notifications">
      <div className="card-top">
        <Heading level={3}>Notifications</Heading>
        <IconButton label="Close" onClick={close}><X size={17} /></IconButton>
      </div>
      {[
        ["check", "You completed Quantum Gates!", "2 min ago", "lesson" as View],
        ["book", "Next recommended: Entanglement", "1 hour ago", "lesson" as View],
        ["trophy", "New challenge: Bell State Builder", "Yesterday", "challenges" as View],
      ].map(([type, title, time, targetView]) => (
        <div
          className="notification"
          key={title as string}
          onClick={() => { setView(targetView as View); close(); }}
          style={{ cursor: "pointer" }}
        >
          <span className={type as string}>
            {type === "check" ? <Check size={16} /> : type === "book" ? <BookOpen size={16} /> : <Trophy size={16} />}
          </span>
          <div>
            <strong>{title as string}</strong>
            <small>{time as string}</small>
          </div>
        </div>
      ))}
      <Button variant="ghost" className="full" onClick={() => { setView("dashboard"); close(); }}>
        View all notifications
      </Button>
    </Card>
  );
}

function PageHeader({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <Badge tone="primary">{eyebrow}</Badge>}
        <Heading level={1}>{title}</Heading>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Dashboard({
  setView,
  onExplain,
  onAskChat,
}: {
  setView: (v: View) => void;
  onExplain: (topicKey: string) => void;
  onAskChat: (prompt: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="MONDAY · OCTOBER 14"
        title={t.greeting || "Welcome back, Alex"}
        sub={t.ready || "Keep building your quantum intuition. Your next breakthrough is one experiment away."}
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="outline"
              onClick={() => onExplain("superposition")}
              icon={<Sparkles size={16} />}
            >
              Explain Today's Concept
            </Button>
            <Button variant="outline" onClick={() => setView("progress")} icon={<Target size={17} />}>
              Weekly goal: 4 / 6
            </Button>
          </div>
        }
      />
      <div className="stat-grid">
        {[
          ["Overall progress", "61%", "14 topics completed", Gauge],
          ["Current level", "Level 7", "620 XP to level up", Layers3],
          ["Learning streak", `${dashboardStats.streak} days`, "Personal best: 18", Zap],
          ["Quiz average", `${dashboardStats.averageScore}%`, "+6% this month", BarChart3],
        ].map(([label, value, sub, Icon]) => (
          <Card className="stat-card" key={label as string} onClick={() => setView("progress")} style={{ cursor: "pointer" }}>
            <div>
              <small>{label as string}</small>
              <strong>{value as string}</strong>
              <span>{sub as string}</span>
            </div>
            <span className="stat-icon"><Icon size={20} /></span>
          </Card>
        ))}
      </div>
      <div className="adaptive-overview">
        <Card className="instructor-card">
          <div className="instructor-top">
            <span className="instructor-avatar">DR</span>
            <div>
              <Badge tone="success"><span className="status-dot" /> ASSIGNED INSTRUCTOR</Badge>
              <Heading level={3}>Dr. Rhea Kapoor</Heading>
              <p>Quantum Algorithms · Qiskit Educator</p>
            </div>
            <IconButton label="Instructor options" onClick={() => setView("instructor")}><MoreHorizontal size={18} /></IconButton>
          </div>
          <div className="instructor-message">
            <MessageCircleQuestion size={17} />
            <p>“Alex, your circuit intuition is improving. Let’s strengthen measurement before moving to Grover’s Algorithm.”</p>
          </div>
          <div className="instructor-actions">
            <Button variant="outline" onClick={() => onAskChat("Dr. Kapoor recommends strengthening measurement before Grover's Algorithm. Can you explain the connection?")} icon={<MessageCircleQuestion size={15} />}>Ask AI Tutor</Button>
            <Button variant="ghost" onClick={() => setView("instructor")} icon={<Clock3 size={15} />}>Instructor Hub</Button>
          </div>
        </Card>
        <Card className="agent-plan-card">
          <div className="agent-plan-head">
            <span className="agent-spark"><Sparkles size={20} /></span>
            <div>
              <Badge tone="primary">AGENTIC AI · TODAY’S PLAN</Badge>
              <Heading level={3}>A session built around your gaps</Heading>
            </div>
            <Badge tone="cyan">32 MIN</Badge>
          </div>
          <div className="mini-plan-steps">
            <span className="done"><Check size={13} /> Recall measurement</span>
            <i />
            <span><BookOpen size={13} /> Visual refresher</span>
            <i />
            <span><CircuitBoard size={13} /> Bell-state lab</span>
            <i />
            <span><Target size={13} /> Adaptive check</span>
          </div>
          <div className="agent-plan-actions">
            <p><Sparkles size={14} /> Based on 3 recent quiz answers and your instructor’s goal.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button onClick={() => setView("agent")}>Start AI-guided session <ArrowRight size={15} /></Button>
              <Button variant="outline" onClick={() => onExplain("grovers-algorithm")} icon={<Sparkles size={14} />}>Explain Plan with AI</Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="dashboard-grid">
        <Card className="continue-card">
          <div className="continue-art" onClick={() => setView("lesson")} style={{ cursor: "pointer" }}>
            <div className="state-orb"><span>ψ</span></div>
            <code>|ψ⟩ = α|0⟩ + β|1⟩</code>
          </div>
          <div className="continue-copy">
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Badge tone="cyan">CONTINUE COURSE MODULE</Badge>
              <Badge tone="success">PROTOTYPE READY</Badge>
            </div>
            <Heading level={2}>Quantum Fundamentals</Heading>
            <p>Level 1 · 5 Interactive Lessons · Capstone Certificate</p>
            <Progress value={68} label="Module progress" />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Button onClick={() => setView("lesson")} icon={<Play size={16} />}>Resume Course Module</Button>
              <Button variant="outline" onClick={() => onExplain("superposition")} icon={<Sparkles size={14} />}>
                Explain with AI
              </Button>
            </div>
          </div>
        </Card>
        <Card className="ai-card">
          <span className="ai-icon"><Bot size={24} /></span>
          <Badge tone="primary">QUBRIX AI</Badge>
          <Heading level={3}>Stuck on a concept?</Heading>
          <p>Ask questions in your own words. I’ll explain it at your level.</p>
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <Button variant="primary" onClick={() => onAskChat("Explain quantum superposition and how the Hadamard gate works")} icon={<MessageCircleQuestion size={16} />}>Ask AI Copilot</Button>
            <Button variant="outline" onClick={() => onExplain("superposition")} icon={<Sparkles size={14} />}>Deep Dive</Button>
          </div>
        </Card>
      </div>
      <div className="section-title">
        <div>
          <Heading level={2}>Your learning path</Heading>
          <p>One clear step at a time.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="outline" size="sm" onClick={() => onExplain("hadamard-gate")} icon={<Sparkles size={14} />}>
            Explain Path with AI
          </Button>
          <Button variant="ghost" onClick={() => setView("learn")}>View curriculum <ArrowRight size={16} /></Button>
        </div>
      </div>
      <Card className="path-card">
        <div className="path-line" />
        {["Quantum fundamentals", "Quantum gates", "Multi-qubit systems", "Quantum algorithms", "Advanced"].map((x, i) => (
          <div className={`path-step ${i < 1 ? "done" : i === 1 ? "current" : "locked"}`} key={x} onClick={() => setView("learn")} style={{ cursor: "pointer" }}>
            <span className="path-step-icon">{i < 1 ? <Check size={17} /> : i === 1 ? <Play size={15} /> : <Lock size={14} />}</span>
            <small>{i < 1 ? "COMPLETED" : i === 1 ? "CURRENT" : "LOCKED"}</small>
            <strong>{x}</strong>
            {i === 1 && <Badge tone="primary">Recommended</Badge>}
          </div>
        ))}
      </Card>
      <div className="two-col-section">
        <div>
          <div className="section-title"><Heading level={2}>Recommended for you</Heading></div>
          <div className="recommend-grid">
            {[
              ["Master the Hadamard Gate", "8 min", "H", "lesson" as View, "hadamard-gate"],
              ["Try your first Bell state", "Interactive", "ψ", "lab" as View, "bell-state"],
              ["Practice superposition", "5 questions", "+", "quiz" as View, "superposition"],
            ].map(([title, meta, symbol, targetView, expKey]) => (
              <Card className="recommend-card" key={title as string}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, cursor: "pointer" }} onClick={() => setView(targetView as View)}>
                  <span>{symbol as string}</span>
                  <div>
                    <strong>{title as string}</strong>
                    <small>{meta as string}</small>
                  </div>
                </div>
                <button
                  className="explain-ai-trigger-btn"
                  title="Explain this topic with AI"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplain(expKey as string);
                  }}
                >
                  <Sparkles size={12} /> Explain
                </button>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <div className="section-title"><Heading level={2}>Recent activity</Heading></div>
          <Card className="activity-card">
            {activities.map((activity) => (
              <div key={activity.title}>
                <span>
                  {activity.type === "lesson" ? <BookOpen size={17} /> : activity.type === "circuit" ? <CircuitBoard size={17} /> : <Target size={17} />}
                </span>
                <div>
                  <strong>{activity.title}</strong>
                  <small>{activity.meta}</small>
                </div>
                <time>{activity.time}</time>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Learn({
  setView,
  onOpenLesson,
}: {
  setView: (v: View) => void;
  onOpenLesson: (moduleId: string, lessonId: string) => void;
}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredModules = learningModules.filter((m) => {
    if (filter === "Beginner" && m.number > 2) return false;
    if (filter === "Intermediate" && (m.number < 2 || m.number > 3)) return false;
    if (filter === "Advanced" && m.number < 4) return false;
    if (search) {
      return (
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase()) ||
        m.lessons.some((l) => l.title.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        eyebrow="LEARNING LIBRARY"
        title="Learn quantum computing"
        sub="Build your understanding step by step — from first principles to real algorithms."
        action={
          <div className="header-progress">
            <span>Path progress</span>
            <strong>61%</strong>
            <Progress value={61} />
          </div>
        }
      />
      <div className="library-tools">
        <div className="inline-search">
          <Search size={17} />
          <input
            placeholder="Search courses, concepts, or gates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {["All", "Beginner", "Intermediate", "Advanced"].map((x) => (
            <Button key={x} variant={filter === x ? "primary" : "ghost"} onClick={() => setFilter(x)}>
              {x}
            </Button>
          ))}
        </div>
      </div>

      <Card className="prerequisite-center">
        <div className="prereq-title">
          <span><Layers3 size={20} /></span>
          <div>
            <Badge tone="cyan">PREREQUISITE CHECK</Badge>
            <Heading level={3}>You’re almost ready for Multi-Qubit Systems</Heading>
            <p>Qubrix continuously checks the concepts you need before each new module.</p>
          </div>
        </div>
        <div className="prereq-items">
          <div className="ready"><CheckCircle2 size={18} /><span><strong>Qubit states</strong><small>Mastered · 91%</small></span></div>
          <div className="ready"><CheckCircle2 size={18} /><span><strong>Hadamard gate</strong><small>Mastered · 86%</small></span></div>
          <div className="review"><Lightbulb size={18} /><span><strong>Measurement</strong><small>Review suggested · 62%</small></span></div>
          <div className="locked"><Lock size={18} /><span><strong>Controlled gates</strong><small>Complete 1 lesson</small></span></div>
        </div>
        <Button variant="outline" onClick={() => setView("agent")}>Build readiness plan <Sparkles size={15} /></Button>
      </Card>

      <Card className="featured-module" onClick={() => setView("lesson")}>
        <div className="module-visual"><span>ψ</span><div className="grid-dots" /></div>
        <div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Badge tone="cyan">INTERACTIVE COURSE · LEVEL 1</Badge>
            <Badge tone="success"><span className="status-dot" /> 100% FUNCTIONAL PROTOTYPE</Badge>
          </div>
          <Heading level={2}>Quantum Fundamentals: From Bits to Qubits</Heading>
          <p>Complete hands-on module with 5 interactive lessons: bit vs qubit slider, single-qubit gate testbench, wavefunction collapse chamber, Bell state entanglement, and capstone certification.</p>
          <div className="module-meta">
            <span><BookOpen size={15} /> 5 interactive lessons</span>
            <span><Clock3 size={15} /> ~45m</span>
            <span><Award size={15} /> 300 XP + Certificate</span>
            <span><Target size={15} /> Beginner</span>
          </div>
          <Progress value={68} label="Interactive Module Progress" />
          <Button onClick={() => setView("lesson")} icon={<Play size={16} />}>Start Interactive Course Module <ArrowRight size={16} /></Button>
        </div>
      </Card>

      <div className="roadmap-section">
        <div className="roadmap-heading">
          <div>
            <Badge tone="primary">YOUR QUANTUM ROADMAP</Badge>
            <Heading level={2}>From first qubit to quantum mastery</Heading>
            <p>Follow the path or select any lesson below to explore the complete curriculum.</p>
          </div>
          <div className="roadmap-legend">
            <span><i className="complete" />Completed</span>
            <span><i className="current" />Current</span>
            <span><i />Upcoming</span>
          </div>
        </div>
        <div className="learning-roadmap">
          <div className="roadmap-spine"><span className="spine-progress" /></div>
          {filteredModules.map((m, i) => {
            const isDone = m.number === 1;
            const isCurrent = m.number === 2;
            return (
              <div
                className={`roadmap-stop stop-${i} ${isDone ? "completed" : isCurrent ? "current" : "ready"}`}
                key={m.id}
              >
                <div className="roadmap-node">
                  <span>{isDone ? <Check size={21} /> : m.number}</span>
                  <small>LEVEL {m.number}</small>
                </div>
                <Card className="roadmap-content">
                  <div className="roadmap-card-top">
                    <Badge tone={isDone ? "success" : isCurrent ? "primary" : "neutral"}>
                      {isDone ? "FOUNDATION COMPLETE" : isCurrent ? "YOU ARE HERE" : "AVAILABLE"}
                    </Badge>
                    <div className="roadmap-duration"><Clock3 size={14} />{m.estimatedTime}</div>
                  </div>
                  <Heading level={3}>{m.title}</Heading>
                  <p>{m.description}</p>
                  <div className="roadmap-topics">
                    {m.lessons.map((lesson) => (
                      <span
                        key={lesson.id}
                        className={isDone ? "done" : ""}
                        onClick={() => onOpenLesson(m.id, lesson.id)}
                        style={{ cursor: "pointer" }}
                        title="Click to view lesson"
                      >
                        {isDone ? <Check size={11} /> : <i />}
                        {lesson.title}
                      </span>
                    ))}
                  </div>
                  <div className="roadmap-card-foot">
                    <div>
                      <Progress value={isDone ? 100 : isCurrent ? 50 : 0} />
                      <span><strong>{m.lessons.length}</strong> lessons</span>
                    </div>
                    <Button
                      variant={isCurrent ? "primary" : "ghost"}
                      onClick={() => onOpenLesson(m.id, m.lessons[0].id)}
                    >
                      {isDone ? "Review" : isCurrent ? "Continue" : "Start"}
                      <ChevronRight size={15} />
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
          <div className="roadmap-finish">
            <Trophy size={24} />
            <div>
              <strong>Quantum Explorer</strong>
              <small>Complete all five levels to earn your verified credential</small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LessonDetailReader({
  moduleId,
  lessonId,
  onBack,
  setView,
  onExplain,
  onAskChat,
}: {
  moduleId: string;
  lessonId: string;
  onBack: () => void;
  setView: (v: View) => void;
  onExplain?: (key: string) => void;
  onAskChat?: (prompt: string) => void;
}) {
  const mod = getModule(moduleId) || learningModules[0];
  const lesson = getLesson(lessonId) || mod.lessons[0];
  const lessonIdx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = mod.lessons[lessonIdx + 1];
  const prevLesson = mod.lessons[lessonIdx - 1];

  const getTopicKey = () => {
    const id = (lesson.id || "").toLowerCase();
    if (id.includes("hadamard") || id.includes("gate")) return "hadamard-gate";
    if (id.includes("bell") || id.includes("entangle")) return "bell-state";
    if (id.includes("bloch")) return "bloch-sphere";
    if (id.includes("grover")) return "grovers-algorithm";
    return "superposition";
  };

  return (
    <div className="lesson-reader-page">
      <div className="lesson-reader-header">
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft size={16} />}>Back to curriculum</Button>
        <div className="lesson-badges">
          <Badge tone="primary">Module {mod.number}: {mod.title}</Badge>
          <Badge tone="cyan">{lesson.duration}</Badge>
          <Badge tone="neutral">{lesson.difficulty}</Badge>
          {onExplain && (
            <button
              className="explain-ai-trigger-btn"
              onClick={() => onExplain(getTopicKey())}
            >
              <Sparkles size={12} /> Explain Lesson with AI
            </button>
          )}
        </div>
      </div>

      <div className="lesson-reader-content">
        <div className="reader-main">
          <Card className="lesson-card-full">
            <Heading level={1}>{lesson.title}</Heading>
            <p className="lesson-subtitle">{lesson.description}</p>

            <div className="lesson-sections">
              {lesson.sections.map((section, idx) => (
                <div key={idx} className="lesson-section-block">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <Heading level={3}>{section.heading}</Heading>
                    {onExplain && (
                      <button
                        className="explain-ai-trigger-btn"
                        onClick={() => onExplain(getTopicKey())}
                        title="Explain this section"
                      >
                        <Sparkles size={11} /> Explain with AI
                      </button>
                    )}
                  </div>
                  <p>{section.body}</p>
                </div>
              ))}
            </div>

            {lesson.circuit && (
              <div className="lesson-circuit-box">
                <Badge tone="cyan">CIRCUIT REPRESENTATION</Badge>
                <pre>{lesson.circuit.join("\n")}</pre>
              </div>
            )}

            <div className="lesson-takeaways-box">
              <Heading level={3}>Key Takeaways</Heading>
              <ul>
                {lesson.takeaways.map((takeaway, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lesson-nav-footer">
              {prevLesson ? (
                <Button variant="outline" onClick={() => onBack()} icon={<ArrowLeft size={16} />}>
                  Previous: {prevLesson.title}
                </Button>
              ) : <span />}
              {nextLesson ? (
                <Button onClick={() => onBack()}>
                  Next: {nextLesson.title} <ArrowRight size={16} />
                </Button>
              ) : (
                <Button onClick={() => setView("quiz")}>
                  Take Module Quiz <Trophy size={16} />
                </Button>
              )}
            </div>
          </Card>
        </div>

        <aside className="reader-aside">
          <Card className="reader-ai-card">
            <div className="ai-panel-head">
              <span><Bot size={19} /></span>
              <div>
                <strong>Qubrix AI</strong>
                <small>Ready to explain this lesson</small>
              </div>
            </div>
            <p>Ask anything about <strong>{lesson.title}</strong> or try practicing in the Quantum Lab.</p>
            {onExplain && (
              <Button
                variant="outline"
                className="full"
                onClick={() => onExplain(getTopicKey())}
                icon={<Sparkles size={16} />}
              >
                Deep AI Explanation
              </Button>
            )}
            {onAskChat && (
              <Button
                className="full"
                onClick={() => onAskChat(`Can you explain the main idea of '${lesson.title}' in plain English?`)}
                icon={<MessageCircleQuestion size={16} />}
              >
                Ask AI about this
              </Button>
            )}
            <Button variant="outline" className="full" onClick={() => setView("lab")} icon={<CircuitBoard size={16} />}>Experiment in Lab</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

type PlacedGate = { id: string; gate: string; qubit: number; column: number };

function CircuitCanvas({
  gates,
  qubits,
  selectedGate,
  activeQubit,
  setActiveQubit,
  onPlace,
  onRemove,
  onSelect,
  addQubit,
  removeQubit,
}: {
  gates: PlacedGate[];
  qubits: number;
  selectedGate: string;
  activeQubit: number;
  setActiveQubit: (q: number) => void;
  onPlace: (gate: string, qubit: number, column: number, id?: string) => void;
  onRemove: (id: string) => void;
  onSelect: (gate: string) => void;
  addQubit: () => void;
  removeQubit: () => void;
}) {
  const [dragOver, setDragOver] = useState("");
  const columns = Array.from({ length: 8 }, (_, index) => index);

  const drop = (event: ReactDragEvent<HTMLDivElement>, qubit: number, column: number) => {
    event.preventDefault();
    event.stopPropagation();
    const raw = event.dataTransfer.getData("application/qubrix-gate") || event.dataTransfer.getData("text/plain");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { gate: string; id?: string };
      if (data && data.gate) {
        onPlace(data.gate, qubit, column, data.id);
      } else {
        onPlace(raw, qubit, column);
      }
    } catch {
      onPlace(raw, qubit, column);
    }
    setDragOver("");
  };

  return (
    <div className="circuit-canvas dynamic-canvas">
      <div className="canvas-grid" />
      <div className="canvas-instructions">
        <GripVertical size={14} />
        <span>Drag gates to any qubit wire (q0, q1, q2) or click any slot to place {selectedGate ? `[${selectedGate}]` : "a gate"}</span>
      </div>
      {Array.from({ length: qubits }, (_, q) => (
        <div
          className={`qubit-row dynamic-row ${activeQubit === q ? "active-qubit-row" : ""}`}
          key={q}
          onClick={() => setActiveQubit(q)}
        >
          <code title="Click to set active qubit wire for quick placement">q{q} |0⟩</code>
          <span className="qwire" />
          <div className="drop-grid">
            {columns.map((column) => {
              const placed = gates.find((gate) => gate.qubit === q && gate.column === column);
              const key = `${q}-${column}`;
              return (
                <div
                  className={`gate-drop-zone ${dragOver === key ? "drag-over" : ""} ${placed ? "occupied" : ""}`}
                  key={column}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.dataTransfer.dropEffect = "copy";
                    if (dragOver !== key) setDragOver(key);
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (dragOver !== key) setDragOver(key);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      if (dragOver === key) setDragOver("");
                    }
                  }}
                  onDrop={(event) => drop(event, q, column)}
                  onClick={(event) => {
                    if (!placed && selectedGate) {
                      event.stopPropagation();
                      setActiveQubit(q);
                      onPlace(selectedGate, q, column);
                    }
                  }}
                  title={placed ? `${placed.gate} on q${q}, col ${column}` : `Click or drop to place ${selectedGate} on q${q}, col ${column}`}
                >
                  {placed ? (
                    <div
                      className={`circuit-gate placed-gate gate-${placed.gate.toLowerCase()}`}
                      draggable
                      title={`${placed.gate} gate on q${q} — drag to move, double-click or click × to delete`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQubit(q);
                        onSelect(placed.gate);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onRemove(placed.id);
                      }}
                      onDragStart={(event) => {
                        event.stopPropagation();
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(
                          "application/qubrix-gate",
                          JSON.stringify({ gate: placed.gate, id: placed.id, sourceQubit: q, sourceColumn: column })
                        );
                        event.dataTransfer.setData("text/plain", placed.gate);
                      }}
                    >
                      {placed.gate === "M" ? <Gauge size={15} /> : placed.gate}
                      <button
                        type="button"
                        className="placed-gate-remove"
                        title="Remove gate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(placed.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="drop-placeholder">+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="canvas-qubit-actions">
        <Button variant="ghost" onClick={addQubit} icon={<Plus size={16} />}>Add qubit wire</Button>
        <Button variant="ghost" disabled={qubits <= 1} onClick={removeQubit}>Remove qubit wire</Button>
      </div>
      <div
        className="delete-drop"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={(event) => {
          event.preventDefault();
          const raw = event.dataTransfer.getData("application/qubrix-gate");
          if (!raw) return;
          try {
            const data = JSON.parse(raw) as { id?: string };
            if (data.id) onRemove(data.id);
          } catch {
            // no-op
          }
        }}
      >
        <X size={15} /> Drop a placed gate here to remove it
      </div>
    </div>
  );
}

function Lab({
  setView,
  onExplain,
  onAskChat,
}: {
  setView: (v: View) => void;
  onExplain: (topicKey: string) => void;
  onAskChat: (prompt: string) => void;
}) {
  const [tab, setTab] = useState<"visual" | "code">("visual");
  const [gates, setGates] = useState<PlacedGate[]>([
    { id: "gate-h", gate: "H", qubit: 0, column: 1 },
    { id: "gate-cx", gate: "CNOT", qubit: 1, column: 3 },
    { id: "gate-m0", gate: "M", qubit: 0, column: 6 },
    { id: "gate-m1", gate: "M", qubit: 1, column: 6 },
  ]);
  const [qubits, setQubits] = useState(3);
  const [activeQubit, setActiveQubit] = useState(0);
  const [selected, setSelected] = useState("H");
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("bell");

  const placeGate = (gate: string, qubit: number, column: number, id?: string) => {
    setGates((current) => {
      const withoutMoving = id ? current.filter((item) => item.id !== id) : current;
      const withoutOccupied = withoutMoving.filter((item) => !(item.qubit === qubit && item.column === column));
      return [...withoutOccupied, { id: id || `gate-${gate.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`, gate, qubit, column }];
    });
    setSelected(gate);
    setActiveQubit(qubit);
  };

  const removeGate = (id: string) => setGates((current) => current.filter((gate) => gate.id !== id));
  const run = () => { setLoading(true); window.setTimeout(() => setView("results"), 1400); };

  const loadPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId === "bell") {
      setQubits(2);
      setGates([
        { id: "p-h", gate: "H", qubit: 0, column: 0 },
        { id: "p-cx", gate: "CNOT", qubit: 1, column: 1 },
        { id: "p-m0", gate: "M", qubit: 0, column: 3 },
        { id: "p-m1", gate: "M", qubit: 1, column: 3 },
      ]);
    } else if (presetId === "superposition") {
      setQubits(1);
      setGates([
        { id: "p-h", gate: "H", qubit: 0, column: 0 },
        { id: "p-m", gate: "M", qubit: 0, column: 2 },
      ]);
    } else if (presetId === "ghz") {
      setQubits(3);
      setGates([
        { id: "p-h", gate: "H", qubit: 0, column: 0 },
        { id: "p-cx1", gate: "CNOT", qubit: 1, column: 1 },
        { id: "p-cx2", gate: "CNOT", qubit: 2, column: 2 },
        { id: "p-m0", gate: "M", qubit: 0, column: 4 },
        { id: "p-m1", gate: "M", qubit: 1, column: 4 },
        { id: "p-m2", gate: "M", qubit: 2, column: 4 },
      ]);
    }
  };

  if (loading) return <SimulationLoading />;

  return (
    <>
      <PageHeader
        eyebrow="INTERACTIVE WORKSPACE"
        title="Quantum Lab"
        sub="Build, simulate, and understand quantum circuits."
        action={
          <div className="lab-actions">
            <Button
              variant="outline"
              onClick={() => onExplain(selectedPreset === "bell" ? "bell-state" : selectedPreset === "superposition" ? "superposition" : "circuit-analysis")}
              icon={<Sparkles size={16} />}
            >
              Explain Circuit with AI
            </Button>
            <Button variant="outline" icon={<Save size={16} />}>Save</Button>
            <Button onClick={run} icon={<Play size={17} />}>Run circuit</Button>
          </div>
        }
      />
      <div className="lab-toolbar">
        <div className="lab-tabs">
          <Button variant={tab === "visual" ? "primary" : "ghost"} onClick={() => setTab("visual")} icon={<CircuitBoard size={16} />}>
            Visual builder
          </Button>
          <Button variant={tab === "code" ? "primary" : "ghost"} onClick={() => setTab("code")} icon={<Code2 size={16} />}>
            Code editor
          </Button>
        </div>
        <div className="toolbar-actions">
          <IconButton label="Undo"><Undo2 size={17} /></IconButton>
          <IconButton label="Redo"><Redo2 size={17} /></IconButton>
          <Select value={selectedPreset} onChange={(e) => loadPreset(e.target.value)}>
            <option value="bell">Preset: Bell State (|Φ+⟩)</option>
            <option value="superposition">Preset: Superposition (H)</option>
            <option value="ghz">Preset: GHZ 3-Qubit</option>
          </Select>
        </div>
        <div className="selectors">
          <Select defaultValue="Qiskit"><option>Qiskit</option><option>PennyLane</option><option>Cirq</option><option>qBraid</option></Select>
          <Select defaultValue="Aer Simulator"><option>Aer Simulator</option><option>Statevector</option></Select>
        </div>
      </div>
      {tab === "visual" ? (
        <div className="lab-grid">
          <Card className="gate-library">
            <div className="panel-title">
              <Heading level={3}>Gate library</Heading>
              <CircleHelp size={16} />
            </div>
            {[
              ["BASIC", ["X", "Y", "Z", "H"]],
              ["PHASE", ["S", "T"]],
              ["ROTATION", ["RX", "RY", "RZ"]],
              ["CONTROLLED", ["CNOT", "CZ", "SWAP"]],
              ["MEASUREMENT", ["M"]],
            ].map(([cat, gs]) => (
              <div className="gate-group" key={cat as string}>
                <small>{cat as string}</small>
                <div>
                  {(gs as string[]).map((g) => (
                    <button
                      key={g}
                      className={selected === g ? "active-library-gate" : ""}
                      draggable
                      onClick={() => {
                        setSelected(g);
                        const targetQubit = activeQubit < qubits ? activeQubit : 0;
                        const occupied = new Set(gates.filter((item) => item.qubit === targetQubit).map((item) => item.column));
                        let nextCol = 0;
                        while (nextCol < 8 && occupied.has(nextCol)) nextCol++;
                        if (nextCol < 8) {
                          placeGate(g, targetQubit, nextCol);
                        }
                      }}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "copy";
                        event.dataTransfer.setData("application/qubrix-gate", JSON.stringify({ gate: g }));
                        event.dataTransfer.setData("text/plain", g);
                      }}
                      title={`Drag ${g} onto any qubit wire, or click to place on q${activeQubit}`}
                    >
                      <GripVertical size={12} />
                      <strong>{g}</strong>
                      <span>{g === "H" ? "Hadamard" : g === "M" ? "Measure" : g === "CNOT" ? "CNOT" : g === "SWAP" ? "SWAP" : g}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Card>
          <Card className="canvas-panel">
            <div className="panel-title">
              <div>
                <Heading level={3}>Quantum Circuit Canvas</Heading>
                <small>{qubits} qubits · {gates.length} operations · active on q{activeQubit}</small>
              </div>
              <div>
                <IconButton label="Zoom out">−</IconButton>
                <span>100%</span>
                <IconButton label="Zoom in">+</IconButton>
              </div>
            </div>
            <CircuitCanvas
              gates={gates}
              qubits={qubits}
              selectedGate={selected}
              activeQubit={activeQubit}
              setActiveQubit={setActiveQubit}
              onPlace={placeGate}
              onRemove={removeGate}
              onSelect={setSelected}
              addQubit={() => setQubits((count) => Math.min(6, count + 1))}
              removeQubit={() => {
                setQubits((count) => {
                  const nextQubits = Math.max(1, count - 1);
                  if (activeQubit >= nextQubits) setActiveQubit(nextQubits - 1);
                  return nextQubits;
                });
                setGates((current) => current.filter((gate) => gate.qubit < qubits - 1));
              }}
            />
            <div className="canvas-footer">
              <span><span className="status-dot" /> Circuit updates live · Target: q{activeQubit}</span>
              <span>Drag to move · Click empty slot to place [{selected}] · Double-click or click × to delete</span>
            </div>
          </Card>
          <Card className="properties">
            <div className="panel-title">
              <Heading level={3}>Properties</Heading>
              <MoreHorizontal size={17} />
            </div>
            <div className="selected-gate">
              <span>{selected}</span>
              <div>
                <Badge tone="primary">SELECTED GATE</Badge>
                <strong>{selected === "H" ? "Hadamard Gate" : `${selected} Gate`}</strong>
              </div>
            </div>
            <p>
              {selected === "H"
                ? "Creates an equal superposition from a computational basis state."
                : selected === "CNOT"
                ? "Flips target qubit when control qubit is in state |1⟩."
                : selected === "X"
                ? "Pauli-X bit-flip gate: swaps |0⟩ and |1⟩."
                : selected === "Z"
                ? "Pauli-Z phase-flip gate: adds a π phase to |1⟩."
                : "Transforms the selected qubit state."}
            </p>
            <div className="matrix">
              <small>MATRIX</small>
              <code>
                {selected === "H"
                  ? "1/√2 [ 1   1 ]\n     [ 1  −1 ]"
                  : selected === "X"
                  ? "[ 0  1 ]\n[ 1  0 ]"
                  : selected === "Z"
                  ? "[ 1   0 ]\n[ 0  −1 ]"
                  : "[ U11  U12 ]\n[ U21  U22 ]"}
              </code>
            </div>
            <Button variant="outline" className="full" onClick={() => setView("ai")} icon={<Sparkles size={16} />}>
              Explain this gate
            </Button>
            <Button variant="ghost" className="full" onClick={() => setView("ai")} icon={<Bot size={16} />}>
              Ask Qubrix AI
            </Button>
          </Card>
        </div>
      ) : (
        <CodeEditor setView={setView} />
      )}
      <div className="simulation-bar">
        <div>
          <span className="status-dot" />
          <strong>Ready to simulate</strong>
          <small>Qiskit · Aer Simulator · 1,024 shots</small>
        </div>
        <Button onClick={run} icon={<Play size={17} />}>Run circuit</Button>
      </div>
    </>
  );
}

function CodeEditor({ setView }: { setView: (v: View) => void }) {
  return (
    <div className="code-grid">
      <Card className="editor-card">
        <div className="editor-tabs">
          <span><Code2 size={15} /> bell_state.py <i /></span>
          <Plus size={16} />
        </div>
        <div className="code-editor">
          <div className="line-nos">1<br />2<br />3<br />4<br />5<br />6<br />7<br />8</div>
          <pre>
            <span className="kw">from</span> qiskit <span className="kw">import</span> QuantumCircuit{"\n\n"}
            <span className="cm"># Create a two-qubit circuit</span>{"\n"}
            qc = <span className="fn">QuantumCircuit</span>(<span className="num">2</span>, <span className="num">2</span>){"\n"}
            qc.<span className="fn">h</span>(<span className="num">0</span>){"\n"}
            qc.<span className="fn">cx</span>(<span className="num">0</span>, <span className="num">1</span>){"\n"}
            qc.<span className="fn">measure</span>([<span className="num">0</span>, <span className="num">1</span>], [<span className="num">0</span>, <span className="num">1</span>])
          </pre>
        </div>
        <div className="editor-footer">
          <span>Python 3.11</span>
          <span><CheckCircle2 size={14} /> No issues found</span>
        </div>
      </Card>
      <Card className="code-ai">
        <div className="ai-panel-head">
          <span><Bot size={18} /></span>
          <div><strong>Code guide</strong><small>Qubrix AI</small></div>
        </div>
        <Badge tone="success">CIRCUIT UNDERSTOOD</Badge>
        <Heading level={3}>Your circuit creates a Bell state.</Heading>
        <p>It puts the first qubit in superposition, then entangles the second qubit with it.</p>
        {[
          ["Line 4", "Creates two qubits and classical bits."],
          ["Line 5", "H creates equal superposition."],
          ["Line 6", "CX links both qubits together."],
        ].map(([line, text]) => (
          <div className="line-explain" key={line}>
            <code>{line}</code>
            <span>{text}</span>
          </div>
        ))}
        <Button variant="outline" className="full" onClick={() => setView("ai")}>Explain line by line</Button>
        <Button variant="ghost" className="full" onClick={() => setView("ai")}>Debug with AI</Button>
      </Card>
    </div>
  );
}

function SimulationLoading() {
  const [stage, setStage] = useState(2);
  useEffect(() => {
    const id = window.setInterval(() => setStage((s) => Math.min(4, s + 1)), 380);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="sim-loading">
      <div className="quantum-loader large"><span /><span /><span /></div>
      <Badge tone="primary">QUANTUM LAB</Badge>
      <Heading level={2}>Running your quantum circuit...</Heading>
      <p>Qiskit Aer is simulating 1,024 shots.</p>
      <Card>
        {["Preparing circuit", "Sending to Qiskit Aer", "Running simulation", "Preparing visualization"].map((x, i) => (
          <div className={i < stage ? "done" : i === stage ? "active" : ""} key={x}>
            <span>{i < stage ? <Check size={15} /> : i + 1}</span>
            <strong>{x}</strong>
            {i === stage && <small>In progress</small>}
          </div>
        ))}
      </Card>
    </div>
  );
}

function BlochSphere({ onExplain }: { onExplain?: (key: string) => void }) {
  return (
    <div className="bloch-layout">
      <Card className="bloch-stage">
        <div className="panel-title">
          <div>
            <Heading level={3}>Qubit state visualization</Heading>
            <small>Drag to rotate · Scroll to zoom</small>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {onExplain && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExplain("bloch-sphere")}
                icon={<Sparkles size={14} />}
              >
                Explain Bloch Sphere with AI
              </Button>
            )}
            <Button variant="outline" icon={<RotateCcw size={15} />}>Reset view</Button>
            <Button icon={<Play size={15} />}>Play gate animation</Button>
          </div>
        </div>
        <div className="sphere">
          <span className="axis x">X</span>
          <span className="axis y">Y</span>
          <span className="axis z">Z</span>
          <div className="sphere-ring sr1" />
          <div className="sphere-ring sr2" />
          <div className="sphere-ring sr3" />
          <div className="state-arrow" />
          <i>|+⟩</i>
        </div>
        <div className="sphere-caption">
          The vector points along +X: an equal superposition of <code>|0⟩</code> and <code>|1⟩</code>.
        </div>
      </Card>
      <Card className="state-panel">
        <Badge tone="cyan">CURRENT STATE</Badge>
        <code className="big-state">|+⟩</code>
        <div className="state-data">
          <span><small>θ THETA</small><strong>90°</strong></span>
          <span><small>φ PHI</small><strong>0°</strong></span>
        </div>
        <Progress value={50} label="Probability of |0⟩" />
        <Progress value={50} label="Probability of |1⟩" />
        <div className="gate-history">
          <small>GATE HISTORY</small>
          <div><code>|0⟩</code><ArrowRight size={15} /><b>H</b><ArrowRight size={15} /><code>|+⟩</code></div>
        </div>
        <Card className="mini-note">
          <Lightbulb size={17} />
          <p>The Hadamard gate moved the qubit from the north pole into an equal superposition.</p>
        </Card>
      </Card>
    </div>
  );
}

function Results({
  setView,
  onExplain,
  onAskChat,
}: {
  setView: (v: View) => void;
  onExplain: (topicKey: string) => void;
  onAskChat: (prompt: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  return (
    <>
      <PageHeader
        eyebrow="SIMULATION COMPLETE"
        title="Simulation results"
        sub="Your Bell state circuit ran successfully on Qiskit Aer backend."
        action={
          <div className="lab-actions">
            <Button variant="outline" onClick={() => setView("lab")}>Modify circuit</Button>
            <Button onClick={() => onExplain("simulation-breakdown")} icon={<Sparkles size={16} />}>
              Explain Results with AI
            </Button>
          </div>
        }
      />
      <div className="result-tabs">
        {["Overview", "Measurement", "Statevector", "Bloch Sphere", "Circuit"].map((x) => (
          <Button key={x} variant={tab === x ? "primary" : "ghost"} onClick={() => setTab(x)}>
            {x}
          </Button>
        ))}
      </div>
      {tab === "Bloch Sphere" ? (
        <BlochSphere onExplain={onExplain} />
      ) : (
        <div className="results-grid">
          <div>
            <Card className="result-summary">
              <div className="card-top">
                <div>
                  <Badge tone="success"><CheckCircle2 size={14} /> SUCCESS</Badge>
                  <Heading level={2}>Bell state created</Heading>
                </div>
                <div className="result-meta">
                  <span><small>SHOTS</small><strong>1,024</strong></span>
                  <span><small>BACKEND</small><strong>Qiskit Aer</strong></span>
                  <span><small>EXECUTION</small><strong>0.42s</strong></span>
                </div>
              </div>
              <div className="state-equation">
                <small>FINAL QUANTUM STATE</small>
                <code>|ψ⟩ = 0.707|00⟩ + 0.707|11⟩</code>
              </div>
            </Card>
            <Card className="measurement-card">
              <div className="card-top">
                <div>
                  <Heading level={3}>Measurement outcomes</Heading>
                  <p>How often each state appeared across all shots.</p>
                </div>
                <Badge tone="neutral">1,024 shots</Badge>
              </div>
              <div className="horizontal-bars">
                <div><code>|00⟩</code><span><i style={{ width: "49.8%" }} /></span><strong>49.8%</strong><small>510</small></div>
                <div><code>|11⟩</code><span><i style={{ width: "50.2%" }} /></span><strong>50.2%</strong><small>514</small></div>
                <div className="muted"><code>|01⟩</code><span><i style={{ width: "0%" }} /></span><strong>0%</strong><small>0</small></div>
                <div className="muted"><code>|10⟩</code><span><i style={{ width: "0%" }} /></span><strong>0%</strong><small>0</small></div>
              </div>
            </Card>
          </div>
          <Card className="meaning-card">
            <span className="ai-icon"><Bot size={23} /></span>
            <Badge tone="primary">WHAT DOES THIS MEAN?</Badge>
            <Heading level={3}>Your qubits are entangled.</Heading>
            <p>The circuit produced only <code>|00⟩</code> and <code>|11⟩</code>, each about half the time.</p>
            <div className="plain-explain">
              <Lightbulb size={17} />
              <p>When the first qubit is measured as 0, the second is always 0. When it’s 1, the second is always 1 — no matter which you measure first.</p>
            </div>
            <strong>Key takeaway</strong>
            <p>The outcomes are random individually, but perfectly correlated together. That is entanglement.</p>
            <div className="meaning-card-actions">
              <Button onClick={() => onExplain("bell-state")} icon={<Sparkles size={15} />}>Explain with AI</Button>
              <Button variant="outline" onClick={() => onAskChat("Why are the measurement outcomes only |00> and |11> in this Bell state?")} icon={<Bot size={15} />}>Ask Tutor</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function AgentSession({ setView }: { setView: (v: View) => void }) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(1);
  const [approved, setApproved] = useState(false);
  const advance = () => {
    setRunning(true);
    window.setTimeout(() => {
      setStep((current) => Math.min(4, current + 1));
      setRunning(false);
    }, 900);
  };
  const stages = [
    ["Diagnose", "Review recent evidence", BrainCircuit],
    ["Teach", "Repair measurement gap", BookOpen],
    ["Practice", "Run a Bell-state lab", CircuitBoard],
    ["Verify", "Adaptive mastery check", Target],
  ] as const;
  return (
    <div className="agent-session-page">
      <div className="agent-session-hero">
        <div>
          <Badge tone="cyan"><Sparkles size={14} /> AGENTIC LEARNING SESSION</Badge>
          <Heading level={1}>Your AI learning team is ready.</Heading>
          <p>Qubrix will diagnose, teach, create practice, and adapt your plan — with you in control at every step.</p>
        </div>
        <div className="session-team">
          <span className="team-ai"><Bot size={22} /></span>
          <span className="team-human">DR</span>
          <div>
            <strong>Qubrix AI + Dr. Rhea Kapoor</strong>
            <small>AI coach · Assigned instructor oversight</small>
          </div>
        </div>
      </div>
      <div className="agent-stage-rail">
        {stages.map(([title, sub, Icon], i) => (
          <div className={`${i < step ? "complete" : i === step ? "active" : ""}`} key={title}>
            <span>{i < step ? <Check size={16} /> : <Icon size={17} />}</span>
            <div>
              <strong>{title}</strong>
              <small>{sub}</small>
            </div>
            {i < stages.length - 1 && <i />}
          </div>
        ))}
      </div>
      <div className="agent-session-grid">
        <div className="agent-main-column">
          <Card className="agent-observation">
            <div className="agent-card-head">
              <div>
                <Badge tone="primary">LIVE LEARNER MODEL</Badge>
                <Heading level={2}>I found one prerequisite gap</Heading>
              </div>
              <Badge tone="warning">CONFIDENCE 87%</Badge>
            </div>
            <p>You understand how gates transform a state, but your last three answers suggest uncertainty about how measurement collapses superposition.</p>
            <div className="evidence-grid">
              <div><Target size={18} /><span><strong>Quiz evidence</strong><small>2 of 3 measurement questions missed</small></span></div>
              <div><CircuitBoard size={18} /><span><strong>Lab evidence</strong><small>Predicted a deterministic result after H</small></span></div>
              <div><MessageCircleQuestion size={18} /><span><strong>Tutor evidence</strong><small>Asked “Why does the state change?”</small></span></div>
            </div>
            <Button variant="ghost">Why did Qubrix decide this? <ChevronRight size={15} /></Button>
          </Card>
          <Card className="agent-proposal">
            <div className="agent-card-head">
              <div>
                <Badge tone="cyan">PROPOSED ACTION</Badge>
                <Heading level={2}>Add a 6-minute measurement repair loop</Heading>
              </div>
              <span className="agent-action-icon"><Sparkles size={21} /></span>
            </div>
            <div className="repair-flow">
              <div><span>01</span><div><strong>Visual explanation</strong><small>Collapse shown on a Bloch sphere</small></div></div>
              <ChevronRight size={17} />
              <div><span>02</span><div><strong>Micro experiment</strong><small>Run H + measurement 100 times</small></div></div>
              <ChevronRight size={17} />
              <div><span>03</span><div><strong>Adaptive check</strong><small>Difficulty changes with each answer</small></div></div>
            </div>
            <div className="agent-approval">
              <div>
                <CircleHelp size={18} />
                <p>This changes today’s session, not your full curriculum. You can undo it at any time.</p>
              </div>
              <div>
                <Button variant="ghost" onClick={() => setView("dashboard")}>Not now</Button>
                <Button onClick={() => { setApproved(true); advance(); }} loading={running}>
                  {approved ? "Approved" : "Approve & adapt session"}
                </Button>
              </div>
            </div>
          </Card>
          {approved && (
            <Card className="agent-active-task">
              <div className="agent-card-head">
                <div>
                  <Badge tone="success"><span className="status-dot" /> ADAPTATION APPLIED</Badge>
                  <Heading level={2}>Measurement repair loop</Heading>
                </div>
                <span>2:14 / 6:00</span>
              </div>
              <div className="adaptive-demo">
                <div className="collapse-visual"><span>|+⟩</span><i /><b>M</b><i /><div><em>|0⟩</em><em>|1⟩</em></div></div>
                <div>
                  <Heading level={3}>Before measurement, both outcomes are possible.</Heading>
                  <p>Measurement does not reveal a hidden answer. It produces one outcome according to the state’s probability amplitudes.</p>
                  <Button onClick={advance}>Run micro experiment <Play size={15} /></Button>
                </div>
              </div>
            </Card>
          )}
        </div>
        <aside className="agent-side-column">
          <Card className="session-control">
            <div className="agent-card-head">
              <Heading level={3}>Agent controls</Heading>
              <Badge tone="success">ACTIVE</Badge>
            </div>
            <div className="autonomy-level">
              <span><strong>Autonomy</strong><small>Ask before changing my plan</small></span>
              <Badge tone="primary">GUIDED</Badge>
            </div>
            <Button variant="outline" className="full" icon={<Play size={15} />}>Pause agent</Button>
            <Button variant="ghost" className="full" icon={<RotateCcw size={15} />}>Undo last adaptation</Button>
            <Button variant="ghost" className="full" onClick={() => setView("settings")} icon={<Settings size={15} />}>Change permissions</Button>
          </Card>
          <Card className="instructor-oversight">
            <div className="instructor-mini">
              <span>DR</span>
              <div>
                <strong>Dr. Rhea Kapoor</strong>
                <small>Instructor oversight</small>
              </div>
              <span className="online-dot" />
            </div>
            <p>Your instructor receives a concise weekly summary, not private AI conversations.</p>
            <div className="teacher-note">
              <strong>Instructor goal</strong>
              <p>Build reliable measurement intuition before entanglement.</p>
            </div>
            <Button variant="outline" className="full" onClick={() => setView("instructor")}>Instructor notes</Button>
          </Card>
          <Card className="agent-log">
            <Heading level={3}>Agent activity</Heading>
            {[
              ["Now", "Proposed prerequisite repair"],
              ["10:42", "Updated mastery confidence"],
              ["10:41", "Reviewed 3 quiz responses"],
              ["10:40", "Started guided session"],
            ].map(([time, event], i) => (
              <div key={event}>
                <span className={i === 0 ? "live" : ""} />
                <time>{time}</time>
                <p>{event}</p>
              </div>
            ))}
            <Button variant="ghost" className="full" onClick={() => setView("progress")}>View complete activity</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function AITutor({ setView }: { setView: (v: View) => void }) {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState(false);
  const [level, setLevel] = useState("Beginner");
  const [mode, setMode] = useState<"ask" | "agent">("ask");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const { locale, t } = useI18n();

  const handleAsk = (text?: string) => {
    const q = text || query;
    if (!q) return;
    setQuery(q);
    setAsked(true);

    const qLower = q.toLowerCase();
    if (qLower.includes("hadamard") || qLower.includes("superposition")) {
      setCustomAnswer(
        "The Hadamard (H) gate transforms a definite basis state into a balanced superposition. When applied to |0⟩, it yields (|0⟩ + |1⟩)/√2. This means both outcomes have an equal 50% probability upon measurement. The square root 1/√2 ensures the total probability magnitude (|α|² + |β|²) equals 1."
      );
    } else if (qLower.includes("bell") || qLower.includes("entangle")) {
      setCustomAnswer(
        "A Bell state is created by placing the first qubit into superposition using an H gate, then linking the second qubit with a CNOT gate (controlled-X). The result is the entangled state (|00⟩ + |11⟩)/√2. Measuring either qubit instantly determines the outcome of the other with 100% correlation."
      );
    } else if (qLower.includes("measurement") || qLower.includes("collapse")) {
      setCustomAnswer(
        "Quantum measurement is governed by the Born Rule. Before measurement, a qubit exists as a continuum of probability amplitudes. When measured in the computational basis, it irreversible collapses into either |0⟩ or |1⟩ with probabilities |α|² and |β|²."
      );
    } else {
      setCustomAnswer(
        `Great question about "${q}". In quantum computing, operations are unitary transformations represented by complex matrices that preserve total probability. You can test this live on the Quantum Lab canvas or simulate with Qiskit Aer.`
      );
    }
  };

  const startVoice = () => {
    setListening(true);
    window.setTimeout(() => {
      setListening(false);
      handleAsk("Why does the Hadamard gate create superposition?");
    }, 1800);
  };

  const speakAnswer = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(customAnswer || t.voiceAnswer);
    utterance.lang = { en: "en-US", es: "es-ES", fr: "fr-FR", hi: "hi-IN", ja: "ja-JP" }[locale] || "en-US";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="tutor-page">
      <PageHeader
        eyebrow="YOUR MULTILINGUAL LEARNING ASSISTANT"
        title={mode === "agent" ? "Give Qubrix a learning goal." : t.ask || "Ask Qubrix anything about quantum."}
        sub={mode === "agent" ? "The agent can plan, teach, create labs, assess you, and update your learning path with approval." : t.askSub || "Ask in plain language, explore math step-by-step, or speak directly."}
        action={
          <div className="tutor-header-actions">
            <div className="ai-mode-switch">
              <Button variant={mode === "ask" ? "primary" : "ghost"} onClick={() => setMode("ask")} icon={<MessageCircleQuestion size={15} />}>
                Ask mode
              </Button>
              <Button variant={mode === "agent" ? "primary" : "ghost"} onClick={() => setMode("agent")} icon={<Sparkles size={15} />}>
                Agent mode
              </Button>
            </div>
            <LanguageControl />
            <div className="level-switch">
              {["Beginner", "Intermediate", "Technical"].map((x) => (
                <Button key={x} variant={level === x ? "primary" : "ghost"} onClick={() => setLevel(x)}>
                  {x}
                </Button>
              ))}
            </div>
          </div>
        }
      />
      {mode === "agent" && (
        <Card className="agent-mode-banner">
          <span className="agent-spark"><Sparkles size={20} /></span>
          <div>
            <strong>Agent mode can take multi-step learning actions</strong>
            <p>Try: “Prepare me for Grover’s Algorithm in two weeks” or “Find my weak topics and teach them.”</p>
          </div>
          <Badge tone="success">APPROVALS ON</Badge>
          <Button onClick={() => setView("agent")}>Open agent workspace <ArrowRight size={15} /></Button>
        </Card>
      )}
      <div className="tutor-grid">
        <Card className="chat-card">
          <div className="chat-scroll">
            <div className="tutor-welcome">
              <div className={`voice-orb ${listening ? "listening" : ""}`}>
                <span className="orb-core"><Bot size={29} /></span>
                <i /><i /><i />
              </div>
              <Heading level={2}>{mode === "agent" ? "What should we accomplish together?" : "Hi Alex, what are we exploring?"}</Heading>
              <p>{mode === "agent" ? "Set a goal and I’ll build an explainable, instructor-aware plan." : `Ask a question, paste code, or speak naturally in ${localeNames[locale]}.`}</p>
              <Button className={`voice-cta ${listening ? "is-listening" : ""}`} onClick={startVoice} icon={listening ? <MicOff size={18} /> : <Mic size={18} />}>
                {listening ? t.listening || "Listening..." : "Ask Qubrix by voice"}
              </Button>
              <div className="live-wave" aria-hidden="true">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => <span key={n} />)}
              </div>
              <div className="suggestions">
                {(mode === "agent"
                  ? ["Build today’s learning session", "Prepare me for Grover’s Algorithm", "Find and repair my weak topics", "Create and grade a Bell-state lab"]
                  : ["Explain superposition like I’m a beginner", "Why does the Hadamard gate create superposition?", "Create a Bell state using Qiskit", "Why did I get this measurement?"]
                ).map((x) => (
                  <Button variant="outline" key={x} onClick={() => { if (mode === "agent") setView("agent"); else handleAsk(x); }}>
                    <Sparkles size={15} />{x}<ArrowRight size={15} />
                  </Button>
                ))}
              </div>
            </div>
            {asked && (
              <>
                <div className="user-bubble">{query || "Why does the Hadamard gate create superposition?"}</div>
                <div className="tutor-answer">
                  <div className="ai-panel-head">
                    <span><Bot size={17} /></span>
                    <strong>Qubrix AI</strong>
                    <Badge tone="cyan">{localeNames[locale]}</Badge>
                    <IconButton label="Read answer aloud" className={speaking ? "speaking" : ""} onClick={speakAnswer}>
                      <Volume2 size={17} />
                    </IconButton>
                  </div>
                  <Heading level={3}>Think of it as a perfect balance.</Heading>
                  <p>{customAnswer || t.voiceAnswer}</p>
                  <div className="visual-answer">
                    <span>|0⟩</span>
                    <ArrowRight size={18} />
                    <b>H</b>
                    <ArrowRight size={18} />
                    <span>|+⟩</span>
                    <small>100% zero</small>
                    <small>50% / 50%</small>
                  </div>
                  <Card className="key-idea">
                    <Lightbulb size={17} />
                    <p><strong>Key takeaway:</strong> H doesn’t choose an outcome. It creates equal amplitudes for both possible outcomes.</p>
                  </Card>
                  <div className="answer-actions">
                    <Button variant="outline" onClick={() => handleAsk(`Explain simpler: ${query}`)}>Explain simpler</Button>
                    <Button variant="outline" onClick={() => handleAsk(`Show example for: ${query}`)}>Show example</Button>
                    <Button variant="outline" onClick={() => setView("lab")}>Try in Quantum Lab</Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="chat-compose">
            <Plus size={18} />
            <input
              placeholder={mode === "agent" ? "Describe a learning goal..." : "Ask Qubrix anything..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
            />
            <IconButton label="Ask by voice" className={listening ? "mic-active" : ""} onClick={startVoice}>
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </IconButton>
            <Button onClick={() => { if (mode === "agent") setView("agent"); else handleAsk(); }} icon={<ArrowRight size={16} />}>
              {mode === "agent" ? "Plan" : "Send"}
            </Button>
          </div>
        </Card>
        <aside className="chat-aside">
          <Card className="language-intelligence">
            <span className="lingua-icon">あ</span>
            <Heading level={3}>Language intelligence</Heading>
            <p>Switch languages at any time. Qubrix translates lessons, captions, AI answers, and voice — without losing context.</p>
            <div className="language-tags">
              {Object.values(localeNames).map((name) => (
                <Badge tone="neutral" key={name}>{name}</Badge>
              ))}
            </div>
          </Card>
          <Card>
            <Heading level={3}>I can help you...</Heading>
            {[
              ["Understand a concept", BrainCircuit, "Explain the Born rule"],
              ["Explain your circuit", CircuitBoard, "Explain Bell state circuit"],
              ["Debug quantum code", Code2, "How do I fix my Qiskit syntax?"],
              ["Interpret a result", BarChart3, "Why did my simulation output 50/50?"],
            ].map(([x, Icon, promptText]) => (
              <Button variant="ghost" key={x as string} onClick={() => handleAsk(promptText as string)} icon={<Icon size={17} />}>
                {x as string}<ChevronRight size={15} />
              </Button>
            ))}
          </Card>
          <Card className="tip-card">
            <Sparkles size={19} />
            <strong>Better questions, better answers</strong>
            <p>Tell me what you already understand and where you got stuck.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Quiz({ setView }: { setView: (v: View) => void }) {
  const assessment = fullAssessments[0];
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [done, setDone] = useState(false);
  const [difficulty, setDifficulty] = useState<"Foundation" | "Standard" | "Stretch">("Standard");
  const [score, setScore] = useState(0);

  const currentQ = assessment.questions[qIndex] || assessment.questions[0];
  const totalQuestions = 5;

  const handleSelectOption = (opt: string) => {
    setSelected(opt);
    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
      setDifficulty("Stretch");
    } else {
      setDifficulty("Foundation");
    }
  };

  const handleNext = () => {
    if (qIndex + 1 < totalQuestions) {
      setQIndex(qIndex + 1);
      setSelected("");
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="quiz-results">
        <div className="confetti c1" /><div className="confetti c2" />
        <Badge tone="success">QUIZ COMPLETE</Badge>
        <Heading level={1}>Great work, Alex!</Heading>
        <p>You’ve built a strong understanding of quantum fundamentals.</p>
        <div className="score-ring">
          <strong>{score}<span>/{totalQuestions}</span></strong>
          <small>{Math.round((score / totalQuestions) * 100)}% accuracy</small>
        </div>
        <div className="quiz-summary">
          <Card>
            <CheckCircle2 size={20} />
            <div>
              <small>STRONG TOPIC</small>
              <strong>Superposition & Gates</strong>
            </div>
          </Card>
          <Card>
            <Target size={20} />
            <div>
              <small>REVIEW NEXT</small>
              <strong>Quantum measurement</strong>
            </div>
          </Card>
        </div>
        <Card className="recommendation">
          <Lightbulb size={20} />
          <div>
            <strong>Personalized recommendation</strong>
            <p>Review Quantum Measurement before moving to entanglement. It should take about 8 minutes.</p>
          </div>
        </Card>
        <div className="quiz-actions">
          <Button variant="outline" onClick={() => { setDone(false); setQIndex(0); setScore(0); setSelected(""); }}>
            Retake quiz
          </Button>
          <Button onClick={() => setView("learn")}>
            Continue curriculum <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  const isCorrect = selected === currentQ.correctAnswer;

  return (
    <div className="quiz-page">
      <div className="quiz-top">
        <Logo />
        <div className="quiz-utilities">
          <LanguageControl compact />
          <Button variant="ghost" onClick={() => setView("learn")}><X size={18} /> Exit quiz</Button>
        </div>
      </div>
      <div className="quiz-card adaptive-quiz">
        <div className="adaptive-quiz-head">
          <div>
            <Sparkles size={17} />
            <span>
              <strong>{assessment.title}</strong>
              <small>Qubrix dynamically adjusts difficulty and explanations based on each response.</small>
            </span>
          </div>
          <Badge tone={difficulty === "Foundation" ? "warning" : difficulty === "Stretch" ? "primary" : "cyan"}>
            {difficulty.toUpperCase()}
          </Badge>
        </div>
        <div className="quiz-progress">
          <span>Question {qIndex + 1} of {totalQuestions}</span>
          <strong>{Math.round(((qIndex + 1) / totalQuestions) * 100)}%</strong>
        </div>
        <Progress value={((qIndex + 1) / totalQuestions) * 100} />
        <Badge tone="cyan">TOPIC: {currentQ.topic?.toUpperCase() || "QUANTUM FUNDAMENTALS"}</Badge>
        <Heading level={2}>{currentQ.prompt}</Heading>
        <div className="quiz-options">
          {currentQ.options.map((opt, i) => (
            <Button
              key={opt}
              variant="outline"
              className={`${selected === opt ? "selected" : ""} ${selected && opt === currentQ.correctAnswer ? "correct" : ""}`}
              onClick={() => handleSelectOption(opt)}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {opt}
              {selected === opt && <CheckCircle2 size={19} />}
            </Button>
          ))}
        </div>
        {selected && (
          <Card className={isCorrect ? "feedback correct-feedback" : "feedback hint-feedback"}>
            <span>{isCorrect ? <CheckCircle2 size={21} /> : <Lightbulb size={21} />}</span>
            <div>
              <Heading level={3}>{isCorrect ? "Exactly correct!" : "Not quite — here’s the explanation."}</Heading>
              <p>{currentQ.explanation}</p>
              {currentQ.hint && !isCorrect && <small className="adaptation-note"><Sparkles size={13} /> Hint: {currentQ.hint}</small>}
            </div>
          </Card>
        )}
        <div className="quiz-nav">
          <Button variant="ghost" disabled={qIndex === 0} onClick={() => setQIndex(qIndex - 1)} icon={<ArrowLeft size={16} />}>
            Previous
          </Button>
          <Button disabled={!selected} onClick={handleNext}>
            {qIndex + 1 === totalQuestions ? "Finish Quiz" : "Next question"} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_BELL_CHALLENGE_CODE = `from qiskit import QuantumCircuit

# Initialize a 2-qubit, 2-classical-bit quantum circuit
qc = QuantumCircuit(2, 2)

# Step 1: Put qubit 0 in superposition with Hadamard gate
qc.h(0)

# Step 2: Entangle qubit 1 with qubit 0 using CNOT gate
qc.cx(0, 1)

# Step 3: Measure both qubits into classical bits
qc.measure([0, 1], [0, 1])
`;

function Challenges({ setView }: { setView: (v: View) => void }) {
  const [code, setCode] = useState(DEFAULT_BELL_CHALLENGE_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [tested, setTested] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic test evaluations based on the user's live code in the editor
  const hasCircuitInit = /QuantumCircuit\(\s*2\s*,\s*2\s*\)/i.test(code) || /QuantumCircuit\(\s*2\s*\)/i.test(code);
  const hasHadamard = /qc\.h\(\s*0\s*\)/i.test(code) || /\.h\(\s*0\s*\)/i.test(code);
  const hasCNOT = /qc\.cx\(\s*0\s*,\s*1\s*\)/i.test(code) || /\.cx\(\s*0\s*,\s*1\s*\)/i.test(code);
  const hasMeasurement = /qc\.measure/i.test(code) || /\.measure\s*\(/i.test(code);

  const testResults = [
    {
      name: "Circuit structure",
      desc: "2 qubits, 2 bits instantiated",
      passed: hasCircuitInit,
      hint: "Ensure you call qc = QuantumCircuit(2, 2)",
    },
    {
      name: "Statevector superposition",
      desc: "Hadamard applied to qubit 0 (1/√2 |0⟩ + 1/√2 |1⟩)",
      passed: hasHadamard,
      hint: "Add qc.h(0) to create equal superposition",
    },
    {
      name: "Entanglement operation",
      desc: "CNOT gate with control=0, target=1",
      passed: hasCNOT,
      hint: "Add qc.cx(0, 1) to entangle q0 and q1",
    },
    {
      name: "Measurement distribution",
      desc: "Measure qubits 0 & 1 -> ≈50% |00⟩, 50% |11⟩",
      passed: hasMeasurement,
      hint: "Add qc.measure([0, 1], [0, 1]) to collect statistics",
    },
  ];

  const allPassed = testResults.every((t) => t.passed);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTested(true);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = Math.max(12, code.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  if (submitted) {
    return (
      <div className="challenge-success">
        <span className="success-medal"><Trophy size={42} /></span>
        <Badge tone="success">CHALLENGE COMPLETED</Badge>
        <Heading level={1}>You created a Bell state!</Heading>
        <p>Your custom Python/Qiskit circuit passed every automated verification check.</p>
        <div className="reward-row">
          <Card><strong>+250</strong><small>XP EARNED</small></Card>
          <Card><strong>100%</strong><small>CORRECTNESS</small></Card>
          <Card><strong>0.24s</strong><small>EXECUTION</small></Card>
        </div>
        <Card className="grading">
          <Heading level={3}>Automated verification results</Heading>
          {testResults.map((t) => (
            <div key={t.name}>
              <CheckCircle2 size={18} />
              <strong>{t.name}</strong>
              <span>Passed</span>
            </div>
          ))}
        </Card>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "18px" }}>
          <Button variant="outline" onClick={() => setView("lab")}>View in Quantum Lab</Button>
          <Button onClick={() => { setSubmitted(false); setTested(false); setCode(DEFAULT_BELL_CHALLENGE_CODE); }}>
            Next challenge <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="INTERACTIVE CODING CHALLENGE"
        title="Create a Bell state"
        sub="Beginner · 250 XP · Live Python/Qiskit Editor"
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="outline" onClick={() => setView("ai")} icon={<Lightbulb size={16} />}>
              Need a hint?
            </Button>
            <Button variant="outline" onClick={() => setCode(DEFAULT_BELL_CHALLENGE_CODE)} icon={<RotateCcw size={15} />}>
              Reset Code
            </Button>
          </div>
        }
      />
      <div className="challenge-grid">
        <Card className="instructions">
          <Badge tone="cyan">OBJECTIVE</Badge>
          <Heading level={3}>Create correlated quantum outcomes</Heading>
          <p>Write Python/Qiskit code to build a two-qubit circuit that produces only <code>|00⟩</code> and <code>|11⟩</code> when measured.</p>
          <div className="requirements">
            <small>REQUIREMENTS</small>
            {[
              "Instantiate QuantumCircuit with 2 qubits & 2 bits",
              "Create superposition on q0 with H: qc.h(0)",
              "Entangle q1 with q0 using CNOT: qc.cx(0, 1)",
              "Measure both qubits: qc.measure([0, 1], [0, 1])",
            ].map((x) => (
              <div key={x}><span /><p>{x}</p></div>
            ))}
          </div>
          <Card className="tip-card">
            <Lightbulb size={17} />
            <p>You can freely edit the code on the right! Try modifying gates, changing qubits, or running tests at any time.</p>
          </Card>
        </Card>

        <Card className="challenge-workspace">
          <div className="editor-tabs">
            <span><Code2 size={15} /> solution.py (Editable)</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                className="code-copy-btn"
                onClick={handleCopy}
                title="Copy code"
                style={{ background: "transparent", border: "0", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}
              >
                {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <Badge tone="neutral">Qiskit 1.0</Badge>
            </div>
          </div>
          <div className="challenge-editor-container">
            <div className="challenge-line-numbers">
              {lineNumbers.map((num) => (
                <span key={num}>{num}</span>
              ))}
            </div>
            <textarea
              className="challenge-code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (tested) setTested(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="# Type your Qiskit code here..."
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          <div className="challenge-actions">
            <Button
              variant="outline"
              onClick={handleRunTests}
              loading={isRunning}
              icon={<Play size={16} />}
            >
              Run verification tests
            </Button>
            <Button
              disabled={!tested || !allPassed}
              onClick={() => setSubmitted(true)}
              icon={<Trophy size={16} />}
            >
              Submit solution (+250 XP)
            </Button>
          </div>
        </Card>

        <Card className="test-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <Heading level={3}>Verification Test Suite</Heading>
            {tested && (
              <Badge tone={allPassed ? "success" : "danger"}>
                {allPassed ? "4 / 4 PASSED" : `${testResults.filter(t => t.passed).length} / 4 PASSED`}
              </Badge>
            )}
          </div>
          {testResults.map((t) => {
            const status = tested ? (t.passed ? "passed" : "failed") : "";
            return (
              <div className={`test-suite-item ${status}`} key={t.name}>
                <span className="test-status-icon">
                  {tested ? (
                    t.passed ? <Check size={15} color="#10b981" /> : <X size={15} color="#ef4444" />
                  ) : (
                    <MoreHorizontal size={15} color="#94a3b8" />
                  )}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{t.name}</strong>
                  <small>{t.desc}</small>
                  {tested && !t.passed && (
                    <div className="test-item-hint">💡 {t.hint}</div>
                  )}
                </div>
              </div>
            );
          })}
          {tested && allPassed && (
            <div className="tests-passed-banner">
              <CheckCircle2 size={16} /> All tests passed! Ready to submit for 250 XP.
            </div>
          )}
          {tested && !allPassed && (
            <div className="tests-failed-banner">
              <X size={16} /> Some tests failed. Review the hints above and click Run verification tests.
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function ProgressPage({ setView }: { setView: (v: View) => void }) {
  return (
    <>
      <PageHeader
        eyebrow="LEARNING ANALYTICS"
        title="Your progress"
        sub="See how far you’ve come — and what to focus on next."
        action={
          <Select value="This month">
            <option>This month</option>
            <option>Last 3 months</option>
          </Select>
        }
      />
      <div className="stat-grid progress-stats">
        {[
          ["Overall progress", "70%", "14 of 20 topics", Gauge],
          ["Quiz average", "82%", "+6% this month", Target],
          ["Challenges", "9 / 12", "3 remaining", Trophy],
          ["Current level", "Intermediate", "1,840 total XP", Award],
        ].map(([a, b, c, Icon]) => (
          <Card className="stat-card" key={a as string}>
            <div>
              <small>{a as string}</small>
              <strong>{b as string}</strong>
              <span>{c as string}</span>
            </div>
            <span className="stat-icon"><Icon size={20} /></span>
          </Card>
        ))}
      </div>
      <div className="progress-grid">
        <Card className="activity-chart">
          <div className="card-top">
            <div>
              <Heading level={3}>Weekly learning activity</Heading>
              <p>5h 24m learned this week</p>
            </div>
            <Badge tone="success">+18% vs last week</Badge>
          </div>
          <div className="chart">
            {[38, 65, 42, 88, 72, 50, 25].map((h, i) => (
              <div key={i}>
                <span style={{ height: `${h}%` }} className={i === 3 ? "peak" : ""} />
                <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
              </div>
            ))}
          </div>
        </Card>
        <Card className="skill-card">
          <Heading level={3}>Skill confidence</Heading>
          {[
            ["Quantum fundamentals", 90],
            ["Quantum gates", 75],
            ["Entanglement", 60],
            ["Algorithms", 35],
          ].map(([x, n]) => (
            <div key={x as string}>
              <Progress value={n as number} label={x as string} />
            </div>
          ))}
        </Card>
      </div>
      <div className="section-title">
        <Heading level={2}>Achievements</Heading>
        <Button variant="ghost">View all</Button>
      </div>
      <div className="achievement-grid">
        {[
          ["First Circuit", CircuitBoard, "Built your first quantum circuit"],
          ["Superposition Explorer", Sparkles, "Mastered superposition"],
          ["Bell State Builder", BrainCircuit, "Created quantum entanglement"],
          ["Quiz Master", Trophy, "Scored 80%+ on 5 quizzes"],
        ].map(([x, Icon, s]) => (
          <Card key={x as string}>
            <span><Icon size={23} /></span>
            <strong>{x as string}</strong>
            <small>{s as string}</small>
          </Card>
        ))}
      </div>
      <Card className="recommendation progress-reco">
        <span><Sparkles size={21} /></span>
        <div>
          <Badge tone="primary">PERSONALIZED FOR YOU</Badge>
          <Heading level={3}>Strengthen entanglement before Grover’s Algorithm</Heading>
          <p>Based on your recent quiz results, a quick review will make the next module much easier.</p>
        </div>
        <Button onClick={() => setView("lesson")}>Review entanglement</Button>
      </Card>
    </>
  );
}

function InstructorView({ setView }: { setView: (v: View) => void }) {
  const [selectedLearner, setSelectedLearner] = useState<string | null>(null);
  const activeLearner = instructorLearners.find((l) => l.id === selectedLearner);

  return (
    <div className="instructor-page">
      <PageHeader
        eyebrow="INSTRUCTOR PORTAL"
        title="Cohort Analytics & Oversight"
        sub="Track learner progress, identify struggle points, and review concept mastery."
        action={<Button variant="outline" icon={<Sparkles size={16} />}>Export Cohort Report</Button>}
      />

      <div className="stat-grid">
        {[
          ["Active learners", "12", "100% enrolled", User],
          ["Avg Completion", "64%", "+12% this month", Gauge],
          ["Assessment pass rate", "88%", "Across 4 checkpoints", Target],
          ["Intervention alerts", "3", "Need measurement support", MessageCircleQuestion],
        ].map(([label, value, sub, Icon]) => (
          <Card className="stat-card" key={label as string}>
            <div>
              <small>{label as string}</small>
              <strong>{value as string}</strong>
              <span>{sub as string}</span>
            </div>
            <span className="stat-icon"><Icon size={20} /></span>
          </Card>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card className="instructor-roster-card">
          <div className="card-top">
            <Heading level={2}>Learner Roster</Heading>
            <Badge tone="primary">{instructorLearners.length} Students</Badge>
          </div>
          <div className="learner-roster-list">
            {instructorLearners.map((learner) => {
              const completedCount = Object.values(learner.moduleProgress).reduce((a, b) => a + b, 0);
              return (
                <div
                  key={learner.id}
                  className={`learner-roster-row ${selectedLearner === learner.id ? "selected" : ""}`}
                  onClick={() => setSelectedLearner(learner.id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="learner-avatar">{learner.initials}</span>
                  <div className="learner-info">
                    <strong>{learner.name}</strong>
                    <small>Currently: {learner.currentLesson}</small>
                  </div>
                  <div className="learner-meta">
                    <small>Active: {learner.lastActive.split("T")[0]}</small>
                    <Badge tone={completedCount > 15 ? "success" : completedCount > 8 ? "cyan" : "warning"}>
                      {completedCount} lessons
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="instructor-details-column">
          {activeLearner ? (
            <Card className="learner-detail-card">
              <div className="card-top">
                <span className="learner-avatar large">{activeLearner.initials}</span>
                <div>
                  <Heading level={3}>{activeLearner.name}</Heading>
                  <small>Enrolled: {activeLearner.enrolledDate}</small>
                </div>
              </div>
              <Heading level={3}>Module Progress</Heading>
              {Object.entries(activeLearner.moduleProgress).map(([modId, count]) => (
                <div key={modId} style={{ margin: "8px 0" }}>
                  <Progress value={(count / 6) * 100} label={`Module: ${modId} (${count}/6)`} />
                </div>
              ))}
              <div style={{ marginTop: "16px" }}>
                <Heading level={3}>Recent Submissions</Heading>
                {activeLearner.assessmentAttempts.map((attempt) => (
                  <div key={attempt.id} style={{ display: "flex", justifyContent: "space-between", margin: "6px 0", fontSize: "13px" }}>
                    <span>{attempt.assessmentId}</span>
                    <Badge tone={attempt.passed ? "success" : "danger"}>{attempt.score}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="topic-hotspots-card">
              <Heading level={2}>Topic Difficulty Hotspots</Heading>
              <p>Aggregated misconception rates across all cohort quizzes:</p>
              {[
                ["Born Rule & State Collapse", 64, "High struggle"],
                ["Relative Phase vs Global Phase", 52, "Moderate struggle"],
                ["Hadamard Superposition", 88, "High mastery"],
                ["Pauli-X Bit Flip", 96, "High mastery"],
              ].map(([topic, rate, status]) => (
                <div key={topic as string} style={{ margin: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong>{topic as string}</strong>
                    <small>{status as string} ({rate as number}%)</small>
                  </div>
                  <Progress value={rate as number} />
                </div>
              ))}
            </Card>
          )}

          <Card className="office-hours-card" style={{ marginTop: "16px" }}>
            <Heading level={3}>Instructor Office Hours</Heading>
            <p>Every Tuesday & Thursday at 4:00 PM EST with Dr. Rhea Kapoor.</p>
            <Button className="full" onClick={() => setView("ai")} icon={<MessageCircleQuestion size={16} />}>
              Open AI Office Hours
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Profile({ setView }: { setView: (v: View) => void }) {
  const heatmap = [
    1, 2, 1, 3, 2, 0, 2, 2, 3, 1, 2, 3, 1, 0, 1, 1, 3, 2, 1, 3, 2, 3, 2, 2, 1, 0, 2, 3,
    2, 3, 1, 3, 2, 1, 2, 1, 2, 3, 3, 1, 2, 0, 3, 1, 2, 2, 3, 1, 2, 2, 3, 2, 1, 3, 2, 1,
    1, 2, 3, 2, 1, 3, 2, 3, 3, 1, 2, 2, 1, 3, 2, 1, 2, 3, 2, 3, 1, 1, 3, 2, 1, 3, 2, 2,
  ];
  const circuits = [
    { title: "Quantum CNN — Image Classification", framework: "Qiskit", qubits: "8 qubits", fidelity: "96.4%", tone: "cyan" },
    { title: "VQE Molecular Energy Solver", framework: "PennyLane", qubits: "12 qubits", fidelity: "93.8%", tone: "primary" },
    { title: "Grover Search — Adaptive Oracle", framework: "Cirq", qubits: "6 qubits", fidelity: "98.1%", tone: "success" },
  ] as const;
  const courses = [
    ["Quantum ML: Basics, Entanglement & Variational Circuits", 82],
    ["Qiskit Developer Foundations", 64],
    ["Quantum Error Correction & Fault Tolerance", 38],
    ["Applied Quantum Algorithms", 91],
  ] as const;

  return (
    <div className="profile-command-center">
      <Card className="profile-cover">
        <div className="profile-cover-art"><span /><span /><span /></div>
        <div className="profile-identity">
          <div className="profile-avatar-xl"><span>AM</span><i><Check size={13} /></i></div>
          <div className="profile-name">
            <div><Heading level={1}>Alex Morgan</Heading><Badge tone="primary">LEVEL 7</Badge><Badge tone="success">VERIFIED LEARNER</Badge></div>
            <p>Quantum Computing Apprentice · AI & Algorithm Developer</p>
            <div className="profile-meta">
              <span><Target size={14} /> Quantum Algorithm Design</span>
              <span><Clock3 size={14} /> Joined September 2025</span>
              <span><Zap size={14} /> 12 day streak</span>
            </div>
          </div>
          <div className="profile-completion">
            <div><span>Profile strength</span><strong>92%</strong></div>
            <Progress value={92} />
            <small>Add one certification to reach Expert profile</small>
          </div>
          <Button variant="outline" onClick={() => setView("settings")}>Edit profile</Button>
        </div>
        <div className="profile-status-row">
          <Badge tone="cyan"><span className="status-dot" /> AVAILABLE FOR COLLABORATION</Badge>
          <span>Preferred frameworks: <strong>Qiskit · PennyLane</strong></span>
          <span>Learning mode: <strong>Advanced</strong></span>
        </div>
      </Card>

      <div className="profile-kpis">
        {[
          ["Total learning XP", "14,850", "+1,240 this month", Sparkles, "purple"],
          ["Learning sessions", "28", "18.6 hours focused", Clock3, "cyan"],
          ["Quantum operations", "1,420", "98 successful simulations", CircuitBoard, "green"],
          ["Global standing", "#142", "Top 4% of learners", Trophy, "amber"],
        ].map(([label, value, detail, Icon, tone]) => (
          <Card className={`profile-kpi ${tone}`} key={label as string}>
            <div className="kpi-head"><small>{label as string}</small><span><Icon size={18} /></span></div>
            <strong>{value as string}</strong>
            <p>{detail as string}</p>
            <div className="kpi-spark">{[3, 5, 4, 8, 6, 10, 9, 12].map((h, i) => <i key={i} style={{ height: `${h * 2}px` }} />)}</div>
          </Card>
        ))}
      </div>

      <div className="profile-insight-grid">
        <Card className="current-objective">
          <div className="profile-section-head">
            <div><Badge tone="primary">CURRENT OBJECTIVE</Badge><Heading level={2}>Quantum Challenge Dynamics</Heading></div>
            <Button variant="ghost" onClick={() => setView("learn")}>View learning path <ArrowRight size={15} /></Button>
          </div>
          <div className="objective-body">
            <div className="mastery-ring"><div><strong>48</strong><span>/ 60</span><small>MASTERY</small></div></div>
            <div className="objective-skills">
              {[
                ["Grover search & amplitude amplification", 88, "cyan"],
                ["Quantum Fourier transform", 74, "purple"],
                ["Hybrid quantum-classical systems", 62, "blue"],
                ["Noise models & error mitigation", 41, "amber"],
              ].map(([label, value, tone]) => (
                <div key={label as string}>
                  <div><span>{label as string}</span><strong>{value as number}%</strong></div>
                  <div className={`skill-track ${tone}`}><i style={{ width: `${value}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="objective-foot">
            <span><CheckCircle2 size={15} /> 8 competencies validated</span>
            <span><Clock3 size={15} /> 12 hours invested</span>
            <Button onClick={() => setView("lesson")}>Continue objective</Button>
          </div>
        </Card>
        <Card className="mastery-honors">
          <div className="profile-section-head"><Heading level={2}>Mastery honors</Heading><Badge tone="primary">4 EARNED</Badge></div>
          <div className="honor-grid">
            {[
              [Sparkles, "Superposition", "Explorer", "cyan"],
              [CircuitBoard, "Circuit", "Architect", "green"],
              [BrainCircuit, "Quantum", "Thinker", "purple"],
              [Trophy, "Challenge", "Champion", "amber"],
            ].map(([Icon, a, b, tone]) => (
              <div className={`honor ${tone}`} key={a as string}>
                <span><Icon size={21} /></span>
                <strong>{a as string}<br />{b as string}</strong>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="full" onClick={() => setView("progress")}>See all 18 badges <ArrowRight size={15} /></Button>
        </Card>
      </div>

      <Card className="contribution-card">
        <div className="profile-section-head">
          <div>
            <Badge tone="cyan">LEARNING ACTIVITY</Badge>
            <Heading level={2}>Quantum skill growth</Heading>
            <p>Lessons, circuits, simulations, and challenges completed during the last 16 weeks.</p>
          </div>
          <div className="activity-legend"><span><i /> Lessons</span><span><i /> Labs</span><span><i /> Challenges</span></div>
        </div>
        <div className="heatmap-wrap">
          <div className="heat-labels"><span>Mon</span><span>Wed</span><span>Fri</span></div>
          <div className="quantum-heatmap">
            {heatmap.map((level, i) => <i key={i} className={`heat-${level}`} title={`${level + 1} learning activities`} />)}
          </div>
        </div>
        <div className="contribution-foot">
          <span>Current streak <strong>12 days</strong></span>
          <span>Longest streak <strong>18 days</strong></span>
          <span>Total active days <strong>67</strong></span>
          <span className="heat-scale">Less <i /><i /><i /><i /> More</span>
        </div>
      </Card>

      <div className="profile-section-head featured-head">
        <div><Badge tone="primary">PORTFOLIO</Badge><Heading level={2}>Featured quantum circuits & labs</Heading></div>
        <Button variant="ghost" onClick={() => setView("lab")}>Explore all 18 experiments <ArrowRight size={15} /></Button>
      </div>
      <div className="featured-circuits">
        {circuits.map((c, i) => (
          <Card className="circuit-project" key={c.title}>
            <div className={`project-visual project-${i}`}>
              <div className="project-wire"><span /><b>{i === 0 ? "H" : i === 1 ? "RY" : "X"}</b><span /><b>{i === 2 ? "G" : "CX"}</b><span /></div>
              <Badge tone={c.tone as "cyan" | "primary" | "success"}>{c.framework}</Badge>
            </div>
            <div className="project-info">
              <div><Heading level={3}>{c.title}</Heading><Badge tone="success">VERIFIED</Badge></div>
              <p>{i === 0 ? "Hybrid quantum convolutional network trained on a compact image dataset." : i === 1 ? "Variational eigensolver for molecular ground-state energy estimation." : "Configurable oracle with amplitude amplification and visual diagnostics."}</p>
              <div className="project-stats">
                <span><CircuitBoard size={14} /> {c.qubits}</span>
                <span><Gauge size={14} /> {c.fidelity} fidelity</span>
                <span><Play size={14} /> {18 + i * 7} runs</span>
              </div>
              <div className="project-actions">
                <Button variant="outline" onClick={() => setView("lab")}>Open lab</Button>
                <Button variant="ghost" onClick={() => setView("results")}>View analysis <ArrowRight size={14} /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="profile-lower-grid">
        <Card className="specializations">
          <div className="profile-section-head">
            <div><Badge tone="cyan">ACTIVE LEARNING</Badge><Heading level={2}>Enrolled quantum specializations</Heading></div>
            <Badge tone="success">4 IN PROGRESS</Badge>
          </div>
          {courses.map(([title, value], i) => (
            <div className="course-progress-row" key={title}>
              <span className={`course-icon c${i}`}>{i === 0 ? <BrainCircuit size={18} /> : i === 1 ? <Code2 size={18} /> : i === 2 ? <Layers3 size={18} /> : <Target size={18} />}</span>
              <div>
                <strong>{title}</strong>
                <Progress value={value} />
                <small>{value}% complete · {12 - i * 2} lessons remaining</small>
              </div>
              <Badge tone={value > 80 ? "success" : "neutral"}>{value > 80 ? "ADVANCED" : "IN PROGRESS"}</Badge>
            </div>
          ))}
          <Button variant="ghost" className="full" onClick={() => setView("learn")}>Explore the full learning catalog <ArrowRight size={15} /></Button>
        </Card>
        <Card className="qualifications">
          <div className="profile-section-head">
            <div><Badge tone="primary">CREDENTIALS</Badge><Heading level={2}>Verified qualifications</Heading></div>
            <span className="verified-seal"><Check size={18} /></span>
          </div>
          {[
            ["IBM Qiskit Advocate", "IBM Quantum", "Issued Sep 2025", "cyan"],
            ["Qubit Foundations", "Qubrix Academy", "Issued Aug 2025", "purple"],
            ["Azure Quantum Basics", "Microsoft Learn", "Issued Jul 2025", "green"],
            ["Quantum Algorithms Badge", "qBraid", "Issued Jun 2025", "amber"],
          ].map(([title, issuer, date, tone]) => (
            <div className="qualification-row" key={title}>
              <span className={`credential-icon ${tone}`}><Award size={19} /></span>
              <div><strong>{title}</strong><small>{issuer} · {date}</small></div>
              <CheckCircle2 size={17} />
            </div>
          ))}
          <Button variant="outline" className="full">Manage credentials</Button>
        </Card>
      </div>
      <div className="profile-footer-stats">
        <span>Last active <strong>Today, 10:42 AM</strong></span>
        <span>Profile views <strong>284</strong></span>
        <span>Lab collaborations <strong>7</strong></span>
        <span>Public experiments <strong>12</strong></span>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [motion, setMotion] = useState(false);
  const [notify, setNotify] = useState(true);
  const [contrast, setContrast] = useState(false);

  return (
    <>
      <PageHeader title="Settings" sub="Customize your Qubrix learning experience." />
      <div className="settings-layout">
        <aside>
          {["Account", "Learning preferences", "Notifications", "Accessibility", "Privacy"].map((x, i) => (
            <Button variant="ghost" className={i === 1 ? "active" : ""} key={x}>{x}</Button>
          ))}
        </aside>
        <div>
          <Card className="settings-card">
            <Heading level={2}>Learning preferences</Heading>
            <p>Control how explanations, examples, and code are tailored to you.</p>
            <div className="setting-row">
              <div>
                <strong>Explanation level</strong>
                <small>How technical should lessons and AI answers be?</small>
              </div>
              <div className="level-switch">
                <Button variant="primary">Beginner</Button>
                <Button variant="ghost">Intermediate</Button>
                <Button variant="ghost">Advanced</Button>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <strong>Preferred framework</strong>
                <small>Used by default in labs and coding examples.</small>
              </div>
              <Select defaultValue="Qiskit">
                <option>Qiskit</option>
                <option>PennyLane</option>
                <option>Cirq</option>
                <option>qBraid</option>
              </Select>
            </div>
            <div className="setting-row">
              <div>
                <strong>Weekly learning goal</strong>
                <small>We’ll help you stay on track.</small>
              </div>
              <Select defaultValue="6 lessons">
                <option>4 lessons</option>
                <option>6 lessons</option>
                <option>8 lessons</option>
              </Select>
            </div>
            <Button>Save preferences</Button>
          </Card>
          <Card className="settings-card">
            <Heading level={3}>Accessibility & notifications</Heading>
            <Toggle checked={notify} onChange={() => setNotify(!notify)} label="Learning reminders" />
            <Toggle checked={motion} onChange={() => setMotion(!motion)} label="Reduce motion" />
            <Toggle checked={contrast} onChange={() => setContrast(!contrast)} label="High contrast mode" />
          </Card>
        </div>
      </div>
    </>
  );
}

function MainApp({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("fundamentals");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("what-is-quantum-computing");
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [explainTopicKey, setExplainTopicKey] = useState("superposition");
  const [externalChatPrompt, setExternalChatPrompt] = useState<string | undefined>(undefined);

  const handleOpenLesson = (moduleId: string, lessonId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lessonId);
    setView("module");
  };

  const handleExplainWithAI = (topicKey: string) => {
    setExplainTopicKey(topicKey);
    setExplainModalOpen(true);
  };

  const handleAskChatbot = (prompt: string) => {
    setExternalChatPrompt(prompt);
  };

  return (
    <>
      <AppShell view={view} setView={setView} onLogout={onLogout}>
        {view === "dashboard" && (
          <Dashboard
            setView={setView}
            onExplain={handleExplainWithAI}
            onAskChat={handleAskChatbot}
          />
        )}
        {view === "learn" && <Learn setView={setView} onOpenLesson={handleOpenLesson} />}
        {view === "lesson" && (
          <CourseModule
            onBack={() => setView("learn")}
            onCompleteAll={() => setView("progress")}
          />
        )}
        {view === "module" && (
          <LessonDetailReader
            moduleId={selectedModuleId}
            lessonId={selectedLessonId}
            onBack={() => setView("learn")}
            setView={setView}
            onExplain={handleExplainWithAI}
            onAskChat={handleAskChatbot}
          />
        )}
        {view === "lab" && (
          <Lab
            setView={setView}
            onExplain={handleExplainWithAI}
            onAskChat={handleAskChatbot}
          />
        )}
        {view === "results" && (
          <Results
            setView={setView}
            onExplain={handleExplainWithAI}
            onAskChat={handleAskChatbot}
          />
        )}
        {view === "agent" && <AgentSession setView={setView} />}
        {view === "ai" && <AITutor setView={setView} />}
        {view === "quiz" && <Quiz setView={setView} />}
        {view === "challenges" && <Challenges setView={setView} />}
        {view === "progress" && <ProgressPage setView={setView} />}
        {view === "instructor" && <InstructorView setView={setView} />}
        {view === "profile" && <Profile setView={setView} />}
        {view === "settings" && <SettingsPage />}
      </AppShell>

      {/* Interactive Explain With AI Modal / Drawer */}
      <ExplainWithAIModal
        isOpen={explainModalOpen}
        topicKey={explainTopicKey}
        onClose={() => setExplainModalOpen(false)}
        onAskChatbot={handleAskChatbot}
        onOpenLab={() => setView("lab")}
      />

      {/* Floating Interactive Quantum AI Chatbot Assistant */}
      <FloatingAIChatbot
        currentView={view}
        onNavigateView={(v) => setView(v as View)}
        externalPrompt={externalChatPrompt}
        onClearExternalPrompt={() => setExternalChatPrompt(undefined)}
      />
    </>
  );
}

function QubrixExperience() {
  const [entry, setEntry] = useState<Entry>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qubrix_entered");
      if (saved === "true") return "app";
    }
    return "landing";
  });

  const handleEnterApp = () => {
    try {
      localStorage.setItem("qubrix_entered", "true");
    } catch {}
    setEntry("app");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("qubrix_entered");
    } catch {}
    setEntry("landing");
  };

  if (entry === "landing") {
    return <Landing onStart={() => setEntry("signup")} onLogin={() => setEntry("login")} />;
  }
  if (entry === "login" || entry === "signup") {
    return (
      <Auth
        mode={entry}
        setEntry={(next) => {
          if (next === "app") handleEnterApp();
          else setEntry(next);
        }}
      />
    );
  }
  if (entry === "onboarding") {
    return <Onboarding done={handleEnterApp} />;
  }
  return <MainApp onLogout={handleLogout} />;
}

export default function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const value = useMemo(() => ({ locale, setLocale, t: copy[locale] }), [locale]);
  return (
    <I18nContext.Provider value={value}>
      <QubrixExperience />
    </I18nContext.Provider>
  );
}
