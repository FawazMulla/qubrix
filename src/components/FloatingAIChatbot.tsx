import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  ChevronDown,
  Minimize2,
  Maximize2,
  BrainCircuit,
  Code2,
  BookOpen,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button, Card, Heading, Badge } from "../ui";
import { aiExplanationsDatabase } from "../data/aiExplanationsMock";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  codeSnippet?: string;
  mathFormula?: string;
  chips?: string[];
  actionLabel?: string;
  actionView?: string;
}

interface FloatingAIChatbotProps {
  currentView: string;
  onNavigateView: (view: string) => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

function formatInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={idx}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const initialMessages: Message[] = [
  {
    id: "m-init-1",
    sender: "ai",
    text: "👋 Welcome to **Qubrix Quantum AI**! I'm your interactive AI tutor. Ask me about quantum gates, superposition, entanglement, Bloch spheres, or click **Explain Current Screen** for real-time guidance.",
    time: "Just now",
    chips: [
      "Explain Superposition",
      "How to create a Bell State?",
      "What is the Bloch Sphere?",
      "Why did my simulation output 50/50?",
      "Explain Current Screen",
    ],
  },
];

export function FloatingAIChatbot({
  currentView,
  onNavigateView,
  externalPrompt,
  onClearExternalPrompt,
}: FloatingAIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<"intuitive" | "math" | "code">("intuitive");
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle external prompts triggered from "Explain with AI" buttons
  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      setIsMinimized(false);
      handleSendPrompt(externalPrompt);
      onClearExternalPrompt?.();
    }
  }, [externalPrompt]);

  const generateAIResponse = (query: string): Message => {
    const q = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Topic: Explain Current Screen
    if (q.includes("current screen") || q.includes("explain screen") || q.includes("explain page")) {
      let explanation = "";
      let chips = ["Explain Superposition", "Create a Bell State", "Open Quantum Lab"];
      let actionView = undefined;
      let actionLabel = undefined;

      if (currentView === "dashboard") {
        explanation =
          "📊 **Dashboard Overview**:\nYou are on your Quantum Command Center. Here you can track your 12-day learning streak, curriculum completion (61%), weekly XP activity, and launch your next recommended lesson: *Quantum Gates*.";
        actionLabel = "Start Next Lesson";
        actionView = "learn";
      } else if (currentView === "learn" || currentView === "lesson" || currentView === "module") {
        explanation =
          "📚 **Learn / Curriculum Hub**:\nYou are exploring the 5-level quantum curriculum (Fundamentals, Gates, Entanglement, Algorithms, and Advanced). Each lesson includes plain-English analogies, math breakdowns, and visual interactive experiments.";
        actionLabel = "Try in Quantum Lab";
        actionView = "lab";
      } else if (currentView === "lab" || currentView === "designer") {
        explanation =
          "⚡ **Quantum Lab Visual Builder**:\nDrag and drop quantum gates (H, X, Y, Z, Phase, CNOT, Measure) onto qubit wires to construct quantum circuits. Click *Simulate* to execute 1,024 shots with instant probability histogram outputs.";
        actionLabel = "Explain Bell State";
        chips = ["How to make Bell State", "Explain Hadamard Gate", "What is CNOT?"];
      } else if (currentView === "results" || currentView === "visualizer") {
        explanation =
          "🔬 **Simulation Results & Visualizer**:\nInspect the measurement counts across 1,024 shots and inspect the 3D Bloch sphere. The Born rule dictates that state amplitude squared determines outcome probability.";
        chips = ["Why did my simulation output 50/50?", "Explain Bloch Sphere", "What is the Born Rule?"];
      } else if (currentView === "challenges" || currentView === "quiz") {
        explanation =
          "🏆 **Challenges & Adaptive Quiz**:\nPut your knowledge to the test with real-world circuit construction puzzles, code debugging, and concept checkpoints with real-time feedback.";
        actionLabel = "Need a Hint?";
        chips = ["Hint for Bell State Builder", "Explain Quantum Gates", "Back to Learn"];
      } else {
        explanation = `You are currently viewing the **${currentView.toUpperCase()}** view. Ask me any question or request a step-by-step quantum concept breakdown!`;
      }

      return {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: explanation,
        time,
        chips,
        actionLabel,
        actionView,
      };
    }

    // Topic: Superposition
    if (q.includes("superposition") || q.includes("hadamard") || q.includes("h-gate") || q.includes("h gate")) {
      const db = aiExplanationsDatabase["superposition"];
      return {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: `✨ **Superposition Explained**:\n${
          mode === "intuitive"
            ? db.analogy.text
            : mode === "math"
            ? `The state is represented as |ψ⟩ = α|0⟩ + β|1⟩ with normalization |α|² + |β|² = 1. Applying Hadamard H transforms |0⟩ into equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2.`
            : `Use Qiskit to create an equal superposition state on 1 qubit:`
        }`,
        time,
        mathFormula: mode === "math" ? "H|0⟩ = 1/√2(|0⟩ + |1⟩) = |+⟩" : undefined,
        codeSnippet: mode === "code" ? db.qiskitCode : undefined,
        chips: ["How does measurement collapse it?", "How to make Bell State", "Try in Quantum Lab"],
        actionLabel: "Open Quantum Lab",
        actionView: "lab",
      };
    }

    // Topic: Bell State / Entanglement
    if (q.includes("bell state") || q.includes("entanglement") || q.includes("cnot") || q.includes("teleport")) {
      const db = aiExplanationsDatabase["bell-state"];
      return {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: `🔗 **Quantum Entanglement & Bell States**:\n${
          mode === "intuitive"
            ? db.analogy.text
            : mode === "math"
            ? `A Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is maximally entangled. The composite state cannot be factored into product states |ψ₁⟩ ⊗ |ψ₂⟩.`
            : `Here is the standard 2-qubit Bell state circuit in Qiskit:`
        }`,
        time,
        mathFormula: mode === "math" ? "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2" : undefined,
        codeSnippet: mode === "code" ? db.qiskitCode : undefined,
        chips: ["What is No-Communication Theorem?", "Can we teleport data?", "Try Bell State in Lab"],
        actionLabel: "Build Bell State in Lab",
        actionView: "lab",
      };
    }

    // Topic: Bloch Sphere
    if (q.includes("bloch") || q.includes("sphere") || q.includes("phase") || q.includes("rotation")) {
      const db = aiExplanationsDatabase["bloch-sphere"];
      return {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: `🌐 **Bloch Sphere Geometric Map**:\n${
          mode === "intuitive"
            ? db.analogy.text
            : mode === "math"
            ? `Any pure single-qubit state can be written as |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩, where (θ, φ) map directly to spherical coordinates.`
            : `Inspect statevectors on the Bloch Sphere using Qiskit visualization:`
        }`,
        time,
        mathFormula: mode === "math" ? "|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩" : undefined,
        codeSnippet: mode === "code" ? db.qiskitCode : undefined,
        chips: ["What do X, Y, Z gates do on the sphere?", "What is relative phase?", "Open Visualizer"],
        actionLabel: "View 3D Bloch Sphere",
        actionView: "results",
      };
    }

    // Topic: Grover's Search Algorithm
    if (q.includes("grover") || q.includes("search") || q.includes("oracle") || q.includes("amplitude amplification")) {
      const db = aiExplanationsDatabase["grovers-algorithm"];
      return {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: `🔍 **Grover's Search Algorithm**:\n${
          mode === "intuitive"
            ? db.analogy.text
            : mode === "math"
            ? `The Grover operator G = (2|s⟩⟨s| - I) · O_f amplifies the target state's amplitude via inversion about the mean in O(√N) queries.`
            : `Grover diffusion operator implementation in Qiskit:`
        }`,
        time,
        mathFormula: mode === "math" ? "G = (2|s⟩⟨s| - I) · O_f" : undefined,
        codeSnippet: mode === "code" ? db.qiskitCode : undefined,
        chips: ["How many iterations are needed?", "What is phase kickback?", "Explain VQE"],
      };
    }

    // Topic: Simulation & Born Rule
    if (q.includes("simulation") || q.includes("50/50") || q.includes("born") || q.includes("shots") || q.includes("histogram")) {
      const db = aiExplanationsDatabase["simulation-breakdown"];
      return {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: `📊 **Simulation & Born Rule Breakdown**:\n${
          mode === "intuitive"
            ? db.analogy.text
            : mode === "math"
            ? `According to the Born Rule, P(x) = |⟨x|ψ⟩|². In a 1,024-shot run, statistical variance causes slight deviations (e.g. 512 ± 16 counts), which is standard quantum shot noise.`
            : `Run a 1024-shot simulation on Qiskit Aer backend:`
        }`,
        time,
        mathFormula: mode === "math" ? "P(x) = |⟨x|ψ⟩|²" : undefined,
        codeSnippet: mode === "code" ? db.qiskitCode : undefined,
        chips: ["How many shots for 99% accuracy?", "Open Simulation Results", "Explain Entanglement"],
        actionLabel: "Inspect Simulation Results",
        actionView: "results",
      };
    }

    // Default intelligent fallback
    return {
      id: `m-ai-${Date.now()}`,
      sender: "ai",
      text: `💡 **Qubrix AI Insight on "${query}"**:\nQuantum computing harnesses quantum mechanical phenomena such as superposition, interference, and entanglement to perform computations. Would you like to explore this mathematically, through intuitive physical analogies, or with executable Qiskit code?`,
      time,
      chips: [
        "Explain with physical analogy",
        "Show mathematical proof",
        "Show Qiskit Python code",
        "Try in Quantum Lab",
      ],
    };
  };

  const handleSendPrompt = (textToSend?: string) => {
    const query = textToSend ?? input;
    if (!query.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text: query,
      time: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(query);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 550);
  };

  const handleVoiceToggle = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    // Simulate voice speech recognition
    setTimeout(() => {
      setListening(false);
      handleSendPrompt("Explain quantum superposition and how the Hadamard gate works");
    }, 2800);
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(msgId);
    }
  };

  const handleCopyCode = (code: string, msgId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(msgId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          className="ai-floating-launcher"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="Open Qubrix AI Assistant"
        >
          <span className="ai-orb-glow">
            <Bot size={22} />
          </span>
          <span className="ai-launcher-pill">
            <strong>Ask Qubrix AI</strong>
            <small>Quantum Copilot</small>
          </span>
          <span className="ai-pulse-ring" />
        </button>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div className={`ai-chatbot-dock ${isMinimized ? "minimized" : ""}`}>
          <div className="ai-chatbot-head">
            <div className="ai-head-info">
              <span className="ai-head-avatar">
                <Bot size={18} />
              </span>
              <div>
                <div className="ai-head-title-row">
                  <strong>Qubrix AI Assistant</strong>
                  <span className="ai-status-dot" />
                </div>
                <small>Context: {currentView.toUpperCase()}</small>
              </div>
            </div>

            <div className="ai-head-controls">
              <button
                className="ai-control-btn"
                onClick={handleResetChat}
                title="Reset conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="ai-control-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                className="ai-control-btn close"
                onClick={() => {
                  setIsOpen(false);
                  window.speechSynthesis?.cancel();
                  setSpeakingId(null);
                }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* AI Reasoning Mode Switcher */}
              <div className="ai-mode-bar">
                <span>Explanation Style:</span>
                <div className="ai-mode-pills">
                  <button
                    className={`mode-pill ${mode === "intuitive" ? "active" : ""}`}
                    onClick={() => setMode("intuitive")}
                  >
                    <BookOpen size={13} /> Intuitive
                  </button>
                  <button
                    className={`mode-pill ${mode === "math" ? "active" : ""}`}
                    onClick={() => setMode("math")}
                  >
                    <BrainCircuit size={13} /> Math
                  </button>
                  <button
                    className={`mode-pill ${mode === "code" ? "active" : ""}`}
                    onClick={() => setMode("code")}
                  >
                    <Code2 size={13} /> Qiskit Code
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="ai-messages-scroll">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ai-chat-bubble ${msg.sender === "user" ? "user-bubble" : "ai-bubble"}`}
                  >
                    {msg.sender === "ai" && (
                      <div className="ai-bubble-head">
                        <span className="ai-tiny-badge">
                          <Sparkles size={12} /> Qubrix AI
                        </span>
                        <button
                          className={`icon-speak-btn ${speakingId === msg.id ? "speaking" : ""}`}
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          title="Read aloud"
                        >
                          <Volume2 size={13} />
                        </button>
                        <span className="bubble-time">{msg.time}</span>
                      </div>
                    )}

                    <div className="bubble-text">
                      {msg.text.split("\n").map((line, i) => (
                        <p key={i}>{formatInlineMarkdown(line)}</p>
                      ))}
                    </div>

                    {msg.mathFormula && (
                      <div className="bubble-math-card">
                        <code>{msg.mathFormula}</code>
                      </div>
                    )}

                    {msg.codeSnippet && (
                      <div className="bubble-code-card">
                        <div className="code-card-header">
                          <span>Qiskit Python</span>
                          <button
                            className="code-copy-btn"
                            onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                          >
                            {copiedCodeId === msg.id ? (
                              <>
                                <Check size={12} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre>
                          <code>{msg.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {msg.actionLabel && msg.actionView && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="bubble-action-btn"
                        onClick={() => onNavigateView(msg.actionView!)}
                        icon={<ExternalLink size={13} />}
                      >
                        {msg.actionLabel}
                      </Button>
                    )}

                    {msg.chips && msg.chips.length > 0 && (
                      <div className="bubble-chips-row">
                        {msg.chips.map((chip, idx) => (
                          <button
                            key={idx}
                            className="suggestion-chip"
                            onClick={() => handleSendPrompt(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="ai-typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <small>Qubrix AI is thinking...</small>
                  </div>
                )}

                {listening && (
                  <div className="ai-listening-indicator">
                    <span className="mic-pulse" />
                    <span>Listening to your question...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Voice Trigger */}
              <form
                className="ai-chat-input-bar"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
              >
                <button
                  type="button"
                  className={`ai-mic-btn ${listening ? "is-listening" : ""}`}
                  onClick={handleVoiceToggle}
                  title={listening ? "Stop listening" : "Ask by voice"}
                >
                  {listening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
                <input
                  type="text"
                  placeholder="Ask any quantum question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={listening}
                />
                <button
                  type="submit"
                  className="ai-send-btn"
                  disabled={!input.trim() || listening}
                  title="Send"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
