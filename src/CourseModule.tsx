import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  CircuitBoard,
  Clock3,
  HelpCircle,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { Badge, Button, Card, Heading, IconButton, Progress } from "./ui";

interface LessonData {
  id: number;
  title: string;
  shortTitle: string;
  duration: string;
  xp: number;
  description: string;
}

const lessons: LessonData[] = [
  {
    id: 1,
    title: "Lesson 1: The Quantum Leap — Bits vs. Qubits",
    shortTitle: "Bits vs Qubits",
    duration: "8 min",
    xp: 50,
    description: "Understand the mathematical and conceptual differences between classical binary bits and quantum states.",
  },
  {
    id: 2,
    title: "Lesson 2: Quantum Gates & Superposition",
    shortTitle: "Quantum Gates",
    duration: "10 min",
    xp: 60,
    description: "Discover unitary operations, reversible computing, and how the Hadamard gate puts qubits into superposition.",
  },
  {
    id: 3,
    title: "Lesson 3: Quantum Measurement & State Collapse",
    shortTitle: "Measurement & Collapse",
    duration: "9 min",
    xp: 60,
    description: "Learn Born's rule, statistical sampling, and why measurement fundamentally collapses quantum superpositions.",
  },
  {
    id: 4,
    title: "Lesson 4: Multi-Qubit Entanglement & The Bell State",
    shortTitle: "Entanglement & Bell State",
    duration: "12 min",
    xp: 70,
    description: "Explore composite quantum systems, the CNOT gate, and the non-local correlation that Einstein called 'spooky action'.",
  },
  {
    id: 5,
    title: "Lesson 5: Capstone Assessment & Official Certification",
    shortTitle: "Capstone & Certification",
    duration: "6 min",
    xp: 60,
    description: "Validate your mastery through an adaptive knowledge check and unlock your verified Qubrix Credential.",
  },
];

export function CourseModule({ onBack, onCompleteAll }: { onBack: () => void; onCompleteAll?: () => void }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1]); // Lesson 1 initially marked or progressible
  const [xpEarned, setXpEarned] = useState(140);
  const [showMath, setShowMath] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lesson 1 State: Bit vs Qubit Simulator
  const [classicalBit, setClassicalBit] = useState<0 | 1>(0);
  const [qubitTheta, setQubitTheta] = useState<number>(90); // 90 deg = equal superposition
  const [l1QuizAnswer, setL1QuizAnswer] = useState<string | null>(null);

  // Lesson 2 State: Single Qubit Gate Workbench
  const [appliedGates, setAppliedGates] = useState<string[]>(["H"]);
  const [l2QuizAnswer, setL2QuizAnswer] = useState<string | null>(null);

  // Lesson 3 State: Measurement Chamber
  const [chamberState, setChamberState] = useState<"plus" | "biased" | "one">("plus");
  const [shotCount, setShotCount] = useState<10 | 100 | 1024>(100);
  const [simResults, setSimResults] = useState<{ zero: number; one: number; isSimulating: boolean }>({
    zero: 51,
    one: 49,
    isSimulating: false,
  });
  const [l3QuizAnswer, setL3QuizAnswer] = useState<string | null>(null);

  // Lesson 4 State: Bell State Synthesizer
  const [bellStep, setBellStep] = useState<0 | 1 | 2>(2);
  const [bellMeasurement, setBellMeasurement] = useState<{ q0: 0 | 1; q1: 0 | 1 } | null>(null);
  const [l4QuizAnswer, setL4QuizAnswer] = useState<string | null>(null);

  // Lesson 5 State: Capstone Quiz & Certificate
  const [capstoneAnswers, setCapstoneAnswers] = useState<Record<number, string>>({});
  const [certificateIssued, setCertificateIssued] = useState(false);

  // In-Lesson AI Tutor State
  const [aiExpanded, setAiExpanded] = useState(true);
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Welcome to Quantum Fundamentals! I'm your interactive tutor. Feel free to ask any question or test one of the interactive simulations.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeLesson = lessons[currentLessonIndex];
  const progressPercent = Math.round((completedLessons.length / lessons.length) * 100);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    window.dispatchEvent(new CustomEvent("qubrix-action", { detail: msg }));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const markCurrentCompleted = () => {
    const lessonId = activeLesson.id;
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
      setXpEarned((prev) => prev + activeLesson.xp);
      triggerToast(`Completed ${activeLesson.shortTitle}! +${activeLesson.xp} XP`);
    }
  };

  const handleNextLesson = () => {
    markCurrentCompleted();
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // AI responses generator
  const askAI = (question: string) => {
    const qLower = question.toLowerCase();
    let reply = "Quantum systems evolve through linear unitary transformations, preserving the total probability equal to 1.";

    if (qLower.includes("amplitude") || qLower.includes("superposition")) {
      reply =
        "Probability amplitudes (α and β) are complex numbers where |α|² represents the exact likelihood of measuring |0⟩, and |β|² represents measuring |1⟩. Together, |α|² + |β|² = 1.";
    } else if (qLower.includes("hadamard") || qLower.includes("h gate") || qLower.includes("gate")) {
      reply =
        "The Hadamard gate takes the computational basis states |0⟩ and |1⟩ and maps them to equal superpositions |+⟩ and |-⟩. Crucially, applying H twice returns the state back to where it started: H · H = I.";
    } else if (qLower.includes("measurement") || qLower.includes("collapse")) {
      reply =
        "In Copenhagen quantum mechanics, measurement forces the wavefunction into an eigenstate of the observable. The probabilities determine the odds, but once observed, the state collapses irreversibly!";
    } else if (qLower.includes("entangle") || qLower.includes("bell") || qLower.includes("cnot")) {
      reply =
        "Entangled states like |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 cannot be factored into independent qubit states. Measuring one qubit instantaneously determines the state of the other!";
    } else if (qLower.includes("hint")) {
      reply =
        "Look closely at the unitary matrix definitions! Reversible gates preserve the norm, and Hadamard is its own inverse.";
    }

    setAiMessages((prev) => [...prev, { sender: "user", text: question }, { sender: "ai", text: reply }]);
    setAiInput("");
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Lesson 1 derived math
  const thetaRad = (qubitTheta * Math.PI) / 180;
  const prob0 = Math.round(Math.pow(Math.cos(thetaRad / 2), 2) * 100);
  const prob1 = 100 - prob0;
  const alphaVal = Math.cos(thetaRad / 2).toFixed(3);
  const betaVal = Math.sin(thetaRad / 2).toFixed(3);

  // Lesson 2 gate logic
  const handleApplyGate = (gate: "X" | "Z" | "H") => {
    setAppliedGates((prev) => (prev.length >= 6 ? [gate] : [...prev, gate]));
    triggerToast(`Applied ${gate} gate`);
  };

  const computeGateFinalState = useMemo(() => {
    // Basic simulation for 1 qubit starting at |0>
    // State: [a, b]
    let a = 1.0;
    let b = 0.0;
    for (const g of appliedGates) {
      if (g === "X") {
        const temp = a;
        a = b;
        b = temp;
      } else if (g === "Z") {
        b = -b;
      } else if (g === "H") {
        const newA = (a + b) / Math.SQRT2;
        const newB = (a - b) / Math.SQRT2;
        a = newA;
        b = newB;
      }
    }
    const p0 = Math.round(a * a * 100);
    const p1 = Math.round(b * b * 100);
    return { a: a.toFixed(3), b: b.toFixed(3), p0, p1 };
  }, [appliedGates]);

  // Lesson 3 Measurement Simulation
  const runChamberSimulation = () => {
    setSimResults((prev) => ({ ...prev, isSimulating: true }));
    let targetProb0 = 0.5;
    if (chamberState === "biased") targetProb0 = 0.75;
    if (chamberState === "one") targetProb0 = 0.0;

    setTimeout(() => {
      let count0 = 0;
      for (let i = 0; i < shotCount; i++) {
        if (Math.random() < targetProb0) count0++;
      }
      setSimResults({
        zero: count0,
        one: shotCount - count0,
        isSimulating: false,
      });
      triggerToast(`Simulation finished: ${count0} zeros, ${shotCount - count0} ones`);
    }, 450);
  };

  // Lesson 4 Bell measurement
  const triggerBellMeasurement = () => {
    const outcome = Math.random() < 0.5 ? 0 : 1;
    setBellMeasurement({ q0: outcome, q1: outcome });
    triggerToast(`Entangled collapse: q0 = |${outcome}⟩, q1 = |${outcome}⟩`);
  };

  return (
    <div className="course-module-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="module-toast-banner">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Navigation */}
      <header className="module-topbar">
        <div className="module-topbar-left">
          <Button variant="ghost" onClick={onBack} icon={<ArrowLeft size={16} />}>
            Back to Catalog
          </Button>
          <div className="module-breadcrumbs">
            <span>Learn</span>
            <span>/</span>
            <strong>Quantum Fundamentals (Module 101)</strong>
            <span>/</span>
            <span className="current-crumb">{activeLesson.shortTitle}</span>
          </div>
        </div>
        <div className="module-topbar-right">
          <div className="module-stat-pill">
            <Zap size={14} className="text-amber-500" />
            <span>
              <strong>{xpEarned}</strong> XP
            </span>
          </div>
          <div className="module-progress-chip">
            <span>Progress: {progressPercent}%</span>
            <div className="mini-track">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <Badge tone="cyan">LEVEL 1 · PROTOTYPE</Badge>
        </div>
      </header>

      {/* Main 3-Column Layout: Syllabus Sidebar | Active Lesson Canvas | Interactive AI Tutor */}
      <div className="module-body-layout">
        {/* Left Sidebar: Syllabus & Lesson Navigation */}
        <aside className="module-syllabus-sidebar">
          <Card className="syllabus-header-card">
            <div className="syllabus-head">
              <Badge tone="primary">MOCK COURSE</Badge>
              <Heading level={3}>Quantum Fundamentals</Heading>
              <p>5 Interactive Lessons · ~45m Total</p>
            </div>
            <Progress value={progressPercent} label={`${completedLessons.length} of 5 completed`} />
            <div className="instructor-badge-mini">
              <span className="inst-avatar">DR</span>
              <div>
                <strong>Dr. Rhea Kapoor</strong>
                <small>Assigned Instructor</small>
              </div>
            </div>
          </Card>

          <div className="syllabus-lesson-list">
            {lessons.map((lesson, idx) => {
              const isCurrent = idx === currentLessonIndex;
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  className={`syllabus-item ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  onClick={() => {
                    setCurrentLessonIndex(idx);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <div className="item-icon-box">
                    {isCompleted ? <Check size={14} /> : <span>0{lesson.id}</span>}
                  </div>
                  <div className="item-text">
                    <strong>{lesson.shortTitle}</strong>
                    <div className="item-meta">
                      <span>
                        <Clock3 size={12} /> {lesson.duration}
                      </span>
                      <span>+{lesson.xp} XP</span>
                    </div>
                  </div>
                  {isCurrent && <span className="active-dot" />}
                </button>
              );
            })}
          </div>

          <div className="syllabus-bottom-box">
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => {
                setCompletedLessons([1]);
                setXpEarned(100);
                triggerToast("Module progress reset for testing");
              }}
              icon={<RotateCcw size={14} />}
            >
              Reset Prototype State
            </Button>
          </div>
        </aside>

        {/* Center: Main Lesson Content & Live Simulators */}
        <main className="module-lesson-main">
          {/* Lesson Header */}
          <div className="lesson-hero-header">
            <div className="lesson-badge-row">
              <Badge tone="primary">LESSON {activeLesson.id} OF 5</Badge>
              <span className="lesson-duration">
                <Clock3 size={14} /> {activeLesson.duration}
              </span>
              <span className="lesson-xp">
                <Trophy size={14} /> +{activeLesson.xp} XP Reward
              </span>
            </div>
            <Heading level={1}>{activeLesson.title}</Heading>
            <p className="lesson-lead">{activeLesson.description}</p>
          </div>

          <hr className="lesson-divider" />

          {/* ======================================================== */}
          {/* LESSON 1: BITS VS QUBITS */}
          {/* ======================================================== */}
          {activeLesson.id === 1 && (
            <div className="lesson-content-section">
              <section className="lesson-section">
                <Heading level={2}>1. Classical Bits vs. Quantum Qubits</Heading>
                <p>
                  In traditional computing, information is represented by switches that are deterministically either{" "}
                  <code>0</code> (low voltage) or <code>1</code> (high voltage).
                </p>
                <p>
                  A <strong>quantum bit (qubit)</strong> is a two-state quantum-mechanical system. Due to the principle
                  of <strong>superposition</strong>, a qubit can exist in a linear combination of both basis states
                  simultaneously until measured:
                </p>

                <div className="math-display-box">
                  <code>|ψ⟩ = α|0⟩ + β|1⟩</code>
                  <small>Where α and β are probability amplitudes, and |α|² + |β|² = 1.0 (100%)</small>
                </div>
              </section>

              {/* Interactive Widget 1 */}
              <Card className="interactive-widget-card">
                <div className="widget-header">
                  <div>
                    <Badge tone="cyan">INTERACTIVE SIMULATION</Badge>
                    <Heading level={3}>Qubit Superposition & Bloch Angle Controller</Heading>
                  </div>
                  <span className="live-status-pill">● Real-time State</span>
                </div>

                <div className="widget-two-columns">
                  {/* Classical Bit Column */}
                  <div className="sim-column classical-box">
                    <small className="col-label">CLASSICAL BIT</small>
                    <div className="bit-toggle-display">
                      <div className={`bit-lamp ${classicalBit === 1 ? "on" : "off"}`}>{classicalBit}</div>
                      <div className="bit-buttons">
                        <Button
                          variant={classicalBit === 0 ? "primary" : "outline"}
                          onClick={() => setClassicalBit(0)}
                        >
                          Set Bit: 0
                        </Button>
                        <Button
                          variant={classicalBit === 1 ? "primary" : "outline"}
                          onClick={() => setClassicalBit(1)}
                        >
                          Set Bit: 1
                        </Button>
                      </div>
                      <p className="bit-desc">State is 100% discrete. No intermediate states exist.</p>
                    </div>
                  </div>

                  {/* Quantum Qubit Column */}
                  <div className="sim-column quantum-box">
                    <small className="col-label">QUANTUM QUBIT (|ψ⟩)</small>
                    <div className="qubit-angle-controls">
                      <div className="slider-label-row">
                        <span>State Angle θ: {qubitTheta}°</span>
                        <div className="preset-buttons">
                          <button onClick={() => setQubitTheta(0)}>|0⟩</button>
                          <button onClick={() => setQubitTheta(90)}>|+⟩ 50/50</button>
                          <button onClick={() => setQubitTheta(180)}>|1⟩</button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={qubitTheta}
                        onChange={(e) => setQubitTheta(Number(e.target.value))}
                        className="angle-slider"
                      />

                      {/* State Vector Display */}
                      <div className="state-amplitudes-row">
                        <div className="amp-card">
                          <small>Amplitude α (|0⟩)</small>
                          <strong>{alphaVal}</strong>
                          <span className="prob-pct">Probability: {prob0}%</span>
                          <div className="prob-bar">
                            <span style={{ width: `${prob0}%` }} className="bar-zero" />
                          </div>
                        </div>
                        <div className="amp-card">
                          <small>Amplitude β (|1⟩)</small>
                          <strong>{betaVal}</strong>
                          <span className="prob-pct">Probability: {prob1}%</span>
                          <div className="prob-bar">
                            <span style={{ width: `${prob1}%` }} className="bar-one" />
                          </div>
                        </div>
                      </div>

                      <div className="dirac-output">
                        Current State:{" "}
                        <code>
                          |ψ⟩ = {alphaVal}|0⟩ + {betaVal}|1⟩
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Lesson 1 Knowledge Check */}
              <Card className="lesson-quiz-card">
                <div className="quiz-badge-row">
                  <Badge tone="warning">KNOWLEDGE CHECK</Badge>
                  <small>Question 1 of 1</small>
                </div>
                <Heading level={3}>
                  If a qubit has amplitudes α = 1/√2 (≈0.707) and β = 1/√2 (≈0.707), what is the probability of
                  measuring |0⟩?
                </Heading>
                <div className="quiz-option-grid">
                  {[
                    { label: "A", text: "25%", correct: false },
                    {
                      label: "B",
                      text: "50% (Because |α|² = (1/√2)² = 1/2 = 50%)",
                      correct: true,
                    },
                    { label: "C", text: "70.7%", correct: false },
                    { label: "D", text: "100%", correct: false },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className={`quiz-opt-btn ${l1QuizAnswer === opt.label ? (opt.correct ? "correct" : "incorrect") : ""}`}
                      onClick={() => {
                        setL1QuizAnswer(opt.label);
                        if (opt.correct) triggerToast("Correct! Born's Rule: Probability is amplitude squared.");
                      }}
                    >
                      <span className="opt-letter">{opt.label}</span>
                      <span>{opt.text}</span>
                      {l1QuizAnswer === opt.label && (opt.correct ? <Check size={18} /> : <X size={18} />)}
                    </button>
                  ))}
                </div>
                {l1QuizAnswer && (
                  <div className={`quiz-feedback-box ${l1QuizAnswer === "B" ? "success" : "info"}`}>
                    <Lightbulb size={18} />
                    <p>
                      {l1QuizAnswer === "B"
                        ? "Exactly! In quantum mechanics (Born's rule), measurement probabilities equal the square of the absolute value of the amplitude: |1/√2|² = 0.50 (50%)."
                        : "Not quite. Remember that probabilities are the square of the amplitudes: P(0) = |α|²."}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* LESSON 2: QUANTUM GATES & SUPERPOSITION */}
          {/* ======================================================== */}
          {activeLesson.id === 2 && (
            <div className="lesson-content-section">
              <section className="lesson-section">
                <Heading level={2}>2. Quantum Logic Gates</Heading>
                <p>
                  Classical logic uses irreversible gates like AND and OR. In quantum computing, all transformations
                  must be <strong>unitary</strong> (reversible and norm-preserving).
                </p>
                <div className="gates-summary-grid">
                  <div className="gate-card">
                    <span className="gate-sym x-tone">X</span>
                    <strong>Pauli-X (NOT)</strong>
                    <p>Bit-flip gate: maps |0⟩ ➔ |1⟩ and |1⟩ ➔ |0⟩.</p>
                  </div>
                  <div className="gate-card">
                    <span className="gate-sym z-tone">Z</span>
                    <strong>Pauli-Z (Phase)</strong>
                    <p>Phase-flip gate: leaves |0⟩ unchanged, maps |1⟩ ➔ -|1⟩.</p>
                  </div>
                  <div className="gate-card">
                    <span className="gate-sym h-tone">H</span>
                    <strong>Hadamard (H)</strong>
                    <p>Creates equal superposition: maps |0⟩ ➔ (|0⟩ + |1⟩)/√2.</p>
                  </div>
                </div>
              </section>

              {/* Interactive Widget 2 */}
              <Card className="interactive-widget-card">
                <div className="widget-header">
                  <div>
                    <Badge tone="cyan">LIVE GATE TESTBENCH</Badge>
                    <Heading level={3}>Single-Qubit Gate Simulator</Heading>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAppliedGates(["H"]);
                      triggerToast("Workbench reset to [H]");
                    }}
                    icon={<RotateCcw size={14} />}
                  >
                    Reset |0⟩
                  </Button>
                </div>

                {/* Circuit Wire & Gate Palette */}
                <div className="circuit-wire-chamber">
                  <div className="circuit-wire-visual">
                    <span className="q-label">q₀ |0⟩ ───</span>
                    <div className="gates-timeline">
                      {appliedGates.map((g, idx) => (
                        <div key={idx} className={`wire-gate-box gate-theme-${g.toLowerCase()}`}>
                          <strong>{g}</strong>
                          <span className="gate-idx">#{idx + 1}</span>
                        </div>
                      ))}
                      <span className="wire-continuation">─────── [ Measurement M ]</span>
                    </div>
                  </div>

                  {/* Gate Trigger Palette */}
                  <div className="gate-palette-row">
                    <span>Click to apply gate:</span>
                    <div className="gate-action-buttons">
                      <Button variant="outline" onClick={() => handleApplyGate("X")}>
                        + Apply X (NOT)
                      </Button>
                      <Button variant="outline" onClick={() => handleApplyGate("Z")}>
                        + Apply Z (Phase)
                      </Button>
                      <Button variant="outline" onClick={() => handleApplyGate("H")}>
                        + Apply H (Hadamard)
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Live State Inspector */}
                <div className="live-state-display">
                  <div className="state-left">
                    <Badge tone="primary">OUTPUT STATEVECTOR</Badge>
                    <div className="dirac-large">
                      <code>
                        |ψ⟩ = {computeGateFinalState.a}|0⟩ + {computeGateFinalState.b}|1⟩
                      </code>
                    </div>
                    <small>
                      Probabilities: {computeGateFinalState.p0}% for |0⟩ · {computeGateFinalState.p1}% for |1⟩
                    </small>
                  </div>
                  <div className="state-bars">
                    <div className="state-bar-row">
                      <span>|0⟩</span>
                      <div className="bar-track">
                        <span style={{ width: `${computeGateFinalState.p0}%` }} className="fill-p0" />
                      </div>
                      <strong>{computeGateFinalState.p0}%</strong>
                    </div>
                    <div className="state-bar-row">
                      <span>|1⟩</span>
                      <div className="bar-track">
                        <span style={{ width: `${computeGateFinalState.p1}%` }} className="fill-p1" />
                      </div>
                      <strong>{computeGateFinalState.p1}%</strong>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Lesson 2 Knowledge Check */}
              <Card className="lesson-quiz-card">
                <div className="quiz-badge-row">
                  <Badge tone="warning">KNOWLEDGE CHECK</Badge>
                  <small>Question 1 of 1</small>
                </div>
                <Heading level={3}>
                  What happens when you apply two Hadamard gates in succession (H · H) to state |0⟩?
                </Heading>
                <div className="quiz-option-grid">
                  {[
                    { label: "A", text: "The state remains in superposition |+⟩", correct: false },
                    {
                      label: "B",
                      text: "It returns exactly to |0⟩ (H is self-inverse: H = H⁻¹)",
                      correct: true,
                    },
                    { label: "C", text: "It flips deterministically to |1⟩", correct: false },
                    { label: "D", text: "It causes an undefined quantum error", correct: false },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className={`quiz-opt-btn ${l2QuizAnswer === opt.label ? (opt.correct ? "correct" : "incorrect") : ""}`}
                      onClick={() => {
                        setL2QuizAnswer(opt.label);
                        if (opt.correct) triggerToast("Correct! The Hadamard gate is its own inverse.");
                      }}
                    >
                      <span className="opt-letter">{opt.label}</span>
                      <span>{opt.text}</span>
                      {l2QuizAnswer === opt.label && (opt.correct ? <Check size={18} /> : <X size={18} />)}
                    </button>
                  ))}
                </div>
                {l2QuizAnswer && (
                  <div className={`quiz-feedback-box ${l2QuizAnswer === "B" ? "success" : "info"}`}>
                    <Lightbulb size={18} />
                    <p>
                      {l2QuizAnswer === "B"
                        ? "Spot on! The Hadamard matrix has H² = I. Applying H once creates superposition; applying it again undergoes quantum interference to return to |0⟩."
                        : "Try pressing '+ Apply H' twice in the simulator above to see what happens to the output state!"}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* LESSON 3: QUANTUM MEASUREMENT & STATE COLLAPSE */}
          {/* ======================================================== */}
          {activeLesson.id === 3 && (
            <div className="lesson-content-section">
              <section className="lesson-section">
                <Heading level={2}>3. Quantum Measurement & Born's Rule</Heading>
                <p>
                  Unlike classical sensors that merely read a pre-existing quantity without changing it,{" "}
                  <strong>quantum measurement fundamentally disrupts the system</strong>.
                </p>
                <p>
                  When a qubit in superposition $|ψ\rangle = α|0\rangle + β|1\rangle$ enters a measurement apparatus, it
                  randomly collapses into either $|0\rangle$ or $|1\rangle$. Immediately after measurement, the
                  wavefunction is now in that collapsed state!
                </p>
              </section>

              {/* Interactive Widget 3: Monte Carlo Measurement Chamber */}
              <Card className="interactive-widget-card">
                <div className="widget-header">
                  <div>
                    <Badge tone="cyan">MEASUREMENT EXPERIMENT</Badge>
                    <Heading level={3}>Wavefunction Collapse Chamber</Heading>
                  </div>
                  <div className="shot-selector">
                    <span className="text-xs">Shots:</span>
                    {([10, 100, 1024] as const).map((s) => (
                      <button
                        key={s}
                        className={`shot-pill ${shotCount === s ? "active" : ""}`}
                        onClick={() => setShotCount(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chamber-controls-row">
                  <div className="prep-state-selector">
                    <span>Prepare Input State:</span>
                    <div className="prep-buttons">
                      <Button
                        variant={chamberState === "plus" ? "primary" : "outline"}
                        onClick={() => setChamberState("plus")}
                      >
                        |+⟩ (50% |0⟩ / 50% |1⟩)
                      </Button>
                      <Button
                        variant={chamberState === "biased" ? "primary" : "outline"}
                        onClick={() => setChamberState("biased")}
                      >
                        Biased (75% |0⟩ / 25% |1⟩)
                      </Button>
                      <Button
                        variant={chamberState === "one" ? "primary" : "outline"}
                        onClick={() => setChamberState("one")}
                      >
                        |1⟩ (Pure Excited State)
                      </Button>
                    </div>
                  </div>

                  <Button
                    loading={simResults.isSimulating}
                    onClick={runChamberSimulation}
                    icon={<Play size={16} />}
                  >
                    Fire {shotCount} Measurements
                  </Button>
                </div>

                {/* Simulation Output Histogram */}
                <div className="chamber-results-display">
                  <div className="histogram-visual">
                    <div className="hist-col">
                      <span className="hist-count">{simResults.zero} counts</span>
                      <div className="hist-bar-outer">
                        <div
                          className="hist-bar-inner bar-0"
                          style={{
                            height: `${Math.max(8, (simResults.zero / shotCount) * 100)}%`,
                          }}
                        />
                      </div>
                      <strong>|0⟩ Outcome</strong>
                      <small>{Math.round((simResults.zero / shotCount) * 100)}%</small>
                    </div>

                    <div className="hist-col">
                      <span className="hist-count">{simResults.one} counts</span>
                      <div className="hist-bar-outer">
                        <div
                          className="hist-bar-inner bar-1"
                          style={{
                            height: `${Math.max(8, (simResults.one / shotCount) * 100)}%`,
                          }}
                        />
                      </div>
                      <strong>|1⟩ Outcome</strong>
                      <small>{Math.round((simResults.one / shotCount) * 100)}%</small>
                    </div>
                  </div>

                  <div className="experiment-takeaway">
                    <Sparkles size={20} className="text-cyan-600" />
                    <div>
                      <strong>Statistical Reality of Quantum Mechanics</strong>
                      <p>
                        Notice that while individual measurements are inherently probabilistic, the cumulative
                        distribution converges towards the theoretical probabilities as shot count increases.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Lesson 3 Knowledge Check */}
              <Card className="lesson-quiz-card">
                <div className="quiz-badge-row">
                  <Badge tone="warning">KNOWLEDGE CHECK</Badge>
                  <small>Question 1 of 1</small>
                </div>
                <Heading level={3}>
                  If a qubit in equal superposition |+⟩ is measured and the detector reads "0", what state is it in
                  immediately afterwards?
                </Heading>
                <div className="quiz-option-grid">
                  {[
                    { label: "A", text: "It returns immediately back to |+⟩", correct: false },
                    {
                      label: "B",
                      text: "It has collapsed into pure |0⟩ with 100% certainty",
                      correct: true,
                    },
                    { label: "C", text: "It is destroyed and disappears", correct: false },
                    { label: "D", text: "It alternates between 0 and 1 every millisecond", correct: false },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className={`quiz-opt-btn ${l3QuizAnswer === opt.label ? (opt.correct ? "correct" : "incorrect") : ""}`}
                      onClick={() => {
                        setL3QuizAnswer(opt.label);
                        if (opt.correct) triggerToast("Correct! Measurement projects the state into an eigenstate.");
                      }}
                    >
                      <span className="opt-letter">{opt.label}</span>
                      <span>{opt.text}</span>
                      {l3QuizAnswer === opt.label && (opt.correct ? <Check size={18} /> : <X size={18} />)}
                    </button>
                  ))}
                </div>
                {l3QuizAnswer && (
                  <div className={`quiz-feedback-box ${l3QuizAnswer === "B" ? "success" : "info"}`}>
                    <Lightbulb size={18} />
                    <p>
                      {l3QuizAnswer === "B"
                        ? "Correct! Measurement causes wavefunction collapse (projection postulate). Subsequent immediate measurements will continue to read '0' with 100% certainty."
                        : "Remember: measurement is irreversible and leaves the qubit in the exact state that was measured."}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* LESSON 4: MULTI-QUBIT ENTANGLEMENT & BELL STATES */}
          {/* ======================================================== */}
          {activeLesson.id === 4 && (
            <div className="lesson-content-section">
              <section className="lesson-section">
                <Heading level={2}>4. Multi-Qubit Systems & Entanglement</Heading>
                <p>
                  When two qubits interact through a controlled gate like <strong>CNOT (Controlled-NOT)</strong>, they
                  can form an <strong>entangled state</strong>: a composite quantum state that cannot be described as the
                  product of individual qubit states.
                </p>
                <div className="math-display-box">
                  <code>|Φ⁺⟩ = (|00⟩ + |11⟩) / √2</code>
                  <small>The Canonical Bell State: Perfectly correlated outcomes</small>
                </div>
              </section>

              {/* Interactive Widget 4: Bell State Synthesizer */}
              <Card className="interactive-widget-card">
                <div className="widget-header">
                  <div>
                    <Badge tone="cyan">BELL PAIR GENERATOR</Badge>
                    <Heading level={3}>2-Qubit Entanglement Builder</Heading>
                  </div>
                  <div className="step-stepper-pills">
                    {[
                      { step: 0, label: "1. Init |00⟩" },
                      { step: 1, label: "2. Apply H(q0)" },
                      { step: 2, label: "3. CNOT(q0➔q1)" },
                    ].map((s) => (
                      <button
                        key={s.step}
                        className={`step-btn ${bellStep === s.step ? "active" : ""}`}
                        onClick={() => setBellStep(s.step as any)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Circuit Representation */}
                <div className="bell-circuit-diagram">
                  <div className="wire-row">
                    <code>q₀ |0⟩</code>
                    <span className="w-seg" />
                    <span className={`w-gate ${bellStep >= 1 ? "active-gate" : "disabled"}`}>H</span>
                    <span className="w-seg" />
                    <span className={`w-ctrl ${bellStep >= 2 ? "active-ctrl" : "disabled"}`}>●</span>
                    <span className="w-seg long" />
                    <span className="w-gate measure">M</span>
                  </div>
                  <div className="wire-row">
                    <code>q₁ |0⟩</code>
                    <span className="w-seg extra-long" />
                    <span className={`w-target ${bellStep >= 2 ? "active-target" : "disabled"}`}>⊕</span>
                    <span className="w-seg long" />
                    <span className="w-gate measure">M</span>
                  </div>
                </div>

                {/* State Formula at current step */}
                <div className="step-explanation-card">
                  <strong>Current Quantum State:</strong>
                  {bellStep === 0 && <code>|ψ₀⟩ = |00⟩ (Both qubits in ground state)</code>}
                  {bellStep === 1 && (
                    <code>
                      |ψ₁⟩ = (|0⟩ + |1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2 (Qubit 0 in superposition, Qubit 1 unaffected)
                    </code>
                  )}
                  {bellStep === 2 && (
                    <code>
                      |ψ₂⟩ = (|00⟩ + |11⟩)/√2 (Maximal Entanglement! The states |01⟩ and |10⟩ have 0% amplitude)
                    </code>
                  )}
                </div>

                {/* Interactive Measurement Correlation Test */}
                <div className="bell-measurement-panel">
                  <div className="bell-meas-head">
                    <div>
                      <strong>Verify Non-Local Correlation</strong>
                      <p>Measure qubit 0 to see how qubit 1 instantaneously responds.</p>
                    </div>
                    <Button onClick={triggerBellMeasurement} icon={<Play size={15} />}>
                      Measure Entangled Pair
                    </Button>
                  </div>

                  {bellMeasurement && (
                    <div className="bell-outcomes-banner">
                      <div className="outcome-qubit">
                        <small>Qubit 0 Measured:</small>
                        <strong className="outcome-val">|{bellMeasurement.q0}⟩</strong>
                      </div>
                      <div className="instant-link-arrow">
                        <span>Instantaneous Correlation</span>
                        <ArrowRight size={20} />
                      </div>
                      <div className="outcome-qubit">
                        <small>Qubit 1 Measured:</small>
                        <strong className="outcome-val">|{bellMeasurement.q1}⟩</strong>
                      </div>
                      <div className="correlation-verdict">
                        <CheckCircle2 size={20} className="text-green-600" />
                        <span>100% Correlated! Never produces |01⟩ or |10⟩.</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Lesson 4 Knowledge Check */}
              <Card className="lesson-quiz-card">
                <div className="quiz-badge-row">
                  <Badge tone="warning">KNOWLEDGE CHECK</Badge>
                  <small>Question 1 of 1</small>
                </div>
                <Heading level={3}>
                  In an ideal Bell state (|00⟩ + |11⟩)/√2, what is the probability of measuring the outcome "01"?
                </Heading>
                <div className="quiz-option-grid">
                  {[
                    { label: "A", text: "25%", correct: false },
                    { label: "B", text: "50%", correct: false },
                    {
                      label: "C",
                      text: "0% (The amplitude for |01⟩ is strictly zero)",
                      correct: true,
                    },
                    { label: "D", text: "Dependent on measurement angle", correct: false },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className={`quiz-opt-btn ${l4QuizAnswer === opt.label ? (opt.correct ? "correct" : "incorrect") : ""}`}
                      onClick={() => {
                        setL4QuizAnswer(opt.label);
                        if (opt.correct) triggerToast("Correct! Entanglement eliminates cross-terms.");
                      }}
                    >
                      <span className="opt-letter">{opt.label}</span>
                      <span>{opt.text}</span>
                      {l4QuizAnswer === opt.label && (opt.correct ? <Check size={18} /> : <X size={18} />)}
                    </button>
                  ))}
                </div>
                {l4QuizAnswer && (
                  <div className={`quiz-feedback-box ${l4QuizAnswer === "C" ? "success" : "info"}`}>
                    <Lightbulb size={18} />
                    <p>
                      {l4QuizAnswer === "C"
                        ? "Exactly right! Because the statevector contains only |00⟩ and |11⟩, measuring one qubit immediately predetermines the other."
                        : "Look at the state formula (|00⟩ + |11⟩)/√2. The coefficient for |01⟩ is 0."}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* LESSON 5: CAPSTONE ASSESSMENT & VERIFIED CERTIFICATION */}
          {/* ======================================================== */}
          {activeLesson.id === 5 && (
            <div className="lesson-content-section">
              <section className="lesson-section">
                <Heading level={2}>5. Capstone Knowledge Check & Graduation</Heading>
                <p>
                  Congratulations on reaching the final module milestone! Complete this 3-question adaptive assessment
                  to validate your foundation and unlock your official Qubrix Certificate of Completion.
                </p>
              </section>

              {/* 3-Question Graded Test */}
              <div className="capstone-questions-stack">
                {/* Q1 */}
                <Card className="capstone-q-card">
                  <Badge tone="cyan">QUESTION 1</Badge>
                  <Heading level={3}>
                    Which property guarantees that total probability in a closed quantum system remains equal to 1.0?
                  </Heading>
                  <div className="quiz-option-grid">
                    {[
                      { id: "1a", text: "Unitary Evolution (U†U = I)" },
                      { id: "1b", text: "Heisenberg Uncertainty Principle" },
                      { id: "1c", text: "Classical Boolean Algebra" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        className={`quiz-opt-btn ${capstoneAnswers[1] === item.id ? "selected" : ""}`}
                        onClick={() => setCapstoneAnswers((prev) => ({ ...prev, 1: item.id }))}
                      >
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Q2 */}
                <Card className="capstone-q-card">
                  <Badge tone="cyan">QUESTION 2</Badge>
                  <Heading level={3}>
                    What is the effect of applying the Pauli-X gate to state |+⟩ = (|0⟩ + |1⟩)/√2?
                  </Heading>
                  <div className="quiz-option-grid">
                    {[
                      { id: "2a", text: "It remains |+⟩ (|+⟩ is an eigenstate of X with eigenvalue +1)" },
                      { id: "2b", text: "It flips to |-⟩" },
                      { id: "2c", text: "It collapses to |0⟩" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        className={`quiz-opt-btn ${capstoneAnswers[2] === item.id ? "selected" : ""}`}
                        onClick={() => setCapstoneAnswers((prev) => ({ ...prev, 2: item.id }))}
                      >
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Q3 */}
                <Card className="capstone-q-card">
                  <Badge tone="cyan">QUESTION 3</Badge>
                  <Heading level={3}>
                    In the Bell state (|00⟩ + |11⟩)/√2, how much faster than light does quantum information transmit?
                  </Heading>
                  <div className="quiz-option-grid">
                    {[
                      {
                        id: "3a",
                        text: "It does not transmit classical signals (No-Communication Theorem)",
                      },
                      { id: "3b", text: "Exactly twice the speed of light" },
                      { id: "3c", text: "Infinite speed with data transmission" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        className={`quiz-opt-btn ${capstoneAnswers[3] === item.id ? "selected" : ""}`}
                        onClick={() => setCapstoneAnswers((prev) => ({ ...prev, 3: item.id }))}
                      >
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Submit Assessment Button */}
                {!certificateIssued ? (
                  <div className="submit-capstone-box">
                    <Button
                      disabled={!capstoneAnswers[1] || !capstoneAnswers[2] || !capstoneAnswers[3]}
                      onClick={() => {
                        setCertificateIssued(true);
                        setCompletedLessons([1, 2, 3, 4, 5]);
                        setXpEarned((prev) => prev + 100);
                        triggerToast("Graduated! Certificate unlocked (+100 XP bonus)");
                      }}
                      icon={<Trophy size={18} />}
                    >
                      Submit Assessment & Claim Certificate
                    </Button>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* VERIFIED CERTIFICATE OF COMPLETION */
                  /* ======================================================== */
                  <div className="certificate-wrapper">
                    <Card className="qubrix-verified-certificate">
                      <div className="cert-border-gold">
                        <div className="cert-inner">
                          <div className="cert-top-branding">
                            <span className="cert-academy-title">QUBRIX QUANTUM COMPUTING ACADEMY</span>
                            <Badge tone="success">OFFICIALLY VERIFIED CREDENTIAL</Badge>
                          </div>

                          <Heading level={1} className="cert-heading">
                            Certificate of Mastery
                          </Heading>
                          <p className="cert-subtitle">This document officially certifies that</p>

                          <div className="cert-recipient-name">Alex Morgan</div>

                          <p className="cert-body-text">
                            has demonstrated practical competence in quantum bits, unitary gate operations,
                            wavefunction measurement, and multi-qubit entanglement through completed simulation labs in:
                          </p>

                          <div className="cert-course-title">
                            Quantum Fundamentals & Circuit Architecture (Level 1)
                          </div>

                          <div className="cert-footer-grid">
                            <div className="cert-signature-block">
                              <span className="sig-handwritten">Dr. Rhea Kapoor</span>
                              <div className="sig-line" />
                              <small>Dr. Rhea Kapoor · Curriculum Lead</small>
                            </div>
                            <div className="cert-seal">
                              <div className="gold-seal-inner">
                                <Award size={36} />
                                <span>VERIFIED</span>
                              </div>
                            </div>
                            <div className="cert-signature-block">
                              <span className="sig-handwritten">Qubrix Autonomous Tutor</span>
                              <div className="sig-line" />
                              <small>Autonomous Verification Agent</small>
                            </div>
                          </div>

                          <div className="cert-meta-footer">
                            <span>Credential ID: QUBRIX-QF-2026-9812</span>
                            <span>Issue Date: March 2026</span>
                            <span>Status: Verified on Qiskit & Aer Simulator</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="cert-actions-row">
                      <Button
                        variant="primary"
                        onClick={() => triggerToast("Certificate downloaded to device")}
                        icon={<Award size={16} />}
                      >
                        Download Certificate (PDF)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => triggerToast("Credential added to Alex Morgan's public profile")}
                      >
                        Add to Profile Portfolio
                      </Button>
                      <Button variant="ghost" onClick={onBack}>
                        Return to Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Lesson Footer Navigation */}
          <footer className="module-lesson-footer">
            <Button
              variant="outline"
              disabled={currentLessonIndex === 0}
              onClick={handlePrevLesson}
              icon={<ArrowLeft size={16} />}
            >
              Previous Lesson
            </Button>
            <div className="footer-middle-info">
              <span>
                Lesson {activeLesson.id} of {lessons.length}
              </span>
            </div>
            {currentLessonIndex < lessons.length - 1 ? (
              <Button onClick={handleNextLesson} icon={<ArrowRight size={16} />}>
                Complete & Next Lesson
              </Button>
            ) : (
              <Button onClick={onBack} variant="outline" icon={<CheckCircle2 size={16} />}>
                Finish Module
              </Button>
            )}
          </footer>
        </main>

        {/* Right Sidebar: Contextual In-Lesson AI Tutor Assistant */}
        <aside className="module-ai-assistant">
          <Card className="ai-tutor-container">
            <div className="ai-assistant-head">
              <div className="ai-brand">
                <span className="bot-icon">
                  <Bot size={18} />
                </span>
                <div>
                  <strong>Qubrix AI Assistant</strong>
                  <small>Context: {activeLesson.shortTitle}</small>
                </div>
              </div>
              <Badge tone="cyan">ACTIVE</Badge>
            </div>

            {/* Chat History */}
            <div className="ai-chat-scroller">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`ai-bubble-row ${msg.sender}`}>
                  <div className="bubble-content">
                    {msg.sender === "ai" && (
                      <div className="bubble-head">
                        <Sparkles size={12} />
                        <span>AI Tutor</span>
                        <IconButton
                          label="Read aloud"
                          className="speak-btn"
                          onClick={() => speakText(msg.text)}
                        >
                          <Volume2 size={13} />
                        </IconButton>
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Guided Prompt Suggestions */}
            <div className="ai-quick-prompts">
              <small>Suggested Questions for this Lesson:</small>
              <div className="prompt-buttons">
                {activeLesson.id === 1 && (
                  <>
                    <button onClick={() => askAI("Explain amplitudes with a simple analogy")}>
                      Analogies for amplitude?
                    </button>
                    <button onClick={() => askAI("Why do probabilities square to 1?")}>
                      Why square to 1?
                    </button>
                  </>
                )}
                {activeLesson.id === 2 && (
                  <>
                    <button onClick={() => askAI("Why is Hadamard its own inverse?")}>
                      Why is H self-inverse?
                    </button>
                    <button onClick={() => askAI("What is the difference between X and Z gates?")}>
                      X gate vs Z gate?
                    </button>
                  </>
                )}
                {activeLesson.id === 3 && (
                  <>
                    <button onClick={() => askAI("What is Born's rule in simple words?")}>
                      What is Born's Rule?
                    </button>
                    <button onClick={() => askAI("Why does measurement collapse the state?")}>
                      Why does state collapse?
                    </button>
                  </>
                )}
                {activeLesson.id === 4 && (
                  <>
                    <button onClick={() => askAI("What is a Bell State?")}>What is a Bell state?</button>
                    <button onClick={() => askAI("Does entanglement violate the speed of light?")}>
                      Faster than light?
                    </button>
                  </>
                )}
                {activeLesson.id === 5 && (
                  <>
                    <button onClick={() => askAI("Give me a hint for Question 1")}>Hint for Q1?</button>
                    <button onClick={() => askAI("Review the key takeaways of Level 1")}>
                      Review key takeaways
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Input Form */}
            <form
              className="ai-chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                if (aiInput.trim()) askAI(aiInput.trim());
              }}
            >
              <input
                type="text"
                placeholder="Ask about this lesson..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <IconButton label="Send question" type="submit">
                <ArrowRight size={16} />
              </IconButton>
            </form>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default CourseModule;
