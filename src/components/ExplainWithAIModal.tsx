import { useState } from "react";
import {
  X,
  Sparkles,
  BrainCircuit,
  BookOpen,
  Code2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Play,
  Volume2,
  Bot,
  Lightbulb,
} from "lucide-react";
import { Button, Card, Heading, Badge } from "../ui";
import { aiExplanationsDatabase, type AIExplanation } from "../data/aiExplanationsMock";

interface ExplainWithAIModalProps {
  topicKey?: string;
  customData?: Partial<AIExplanation>;
  isOpen: boolean;
  onClose: () => void;
  onAskChatbot?: (prompt: string) => void;
  onOpenLab?: () => void;
}

export function ExplainWithAIModal({
  topicKey = "superposition",
  customData,
  isOpen,
  onClose,
  onAskChatbot,
  onOpenLab,
}: ExplainWithAIModalProps) {
  const [activeTab, setActiveTab] = useState<"intuition" | "math" | "code" | "pitfalls">("intuition");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  if (!isOpen) return null;

  const explanation: AIExplanation = {
    ...(aiExplanationsDatabase[topicKey] || aiExplanationsDatabase["superposition"]),
    ...customData,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(explanation.qiskitCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `${explanation.title}. ${explanation.summary}. Analogy: ${explanation.analogy.text}`
      );
      utterance.rate = 1.0;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <div className="explain-ai-backdrop" onClick={onClose}>
      <div className="explain-ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="explain-ai-header">
          <div className="explain-ai-title-wrap">
            <span className="explain-ai-sparkle">
              <Sparkles size={20} />
            </span>
            <div>
              <div className="explain-ai-meta">
                <Badge tone="cyan">{explanation.category}</Badge>
                <Badge tone="primary">{explanation.level}</Badge>
                <span className="explain-ai-ai-label">
                  <Bot size={13} /> Powered by Qubrix AI
                </span>
              </div>
              <Heading level={2} className="explain-ai-title">
                {explanation.title}
              </Heading>
            </div>
          </div>
          <div className="explain-ai-actions">
            <Button
              variant="outline"
              size="sm"
              className={speaking ? "speaking-btn" : ""}
              onClick={handleSpeak}
              icon={<Volume2 size={16} />}
            >
              {speaking ? "Stop" : "Listen"}
            </Button>
            <button className="icon-btn close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="explain-ai-nav-tabs">
          <button
            className={`explain-tab-btn ${activeTab === "intuition" ? "active" : ""}`}
            onClick={() => setActiveTab("intuition")}
          >
            <BookOpen size={16} /> Intuition & Analogy
          </button>
          <button
            className={`explain-tab-btn ${activeTab === "math" ? "active" : ""}`}
            onClick={() => setActiveTab("math")}
          >
            <BrainCircuit size={16} /> Math & Statevector
          </button>
          <button
            className={`explain-tab-btn ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            <Code2 size={16} /> Circuit & Qiskit
          </button>
          <button
            className={`explain-tab-btn ${activeTab === "pitfalls" ? "active" : ""}`}
            onClick={() => setActiveTab("pitfalls")}
          >
            <AlertTriangle size={16} /> Pitfalls & FAQs
          </button>
        </div>

        <div className="explain-ai-body">
          {activeTab === "intuition" && (
            <div className="explain-tab-content">
              <div className="explain-summary-box">
                <p className="explain-summary-text">{explanation.summary}</p>
              </div>

              <div className="explain-analogy-card">
                <div className="analogy-head">
                  <span className="analogy-icon">
                    <Lightbulb size={20} />
                  </span>
                  <div>
                    <strong>Mental Model Analogy: {explanation.analogy.title}</strong>
                    <small>Intuitive real-world physics comparison</small>
                  </div>
                </div>
                <p className="analogy-body">{explanation.analogy.text}</p>
              </div>

              {explanation.circuitDiagram && (
                <div className="explain-circuit-preview">
                  <strong>Circuit Flow</strong>
                  <div className="circuit-code-box">
                    {explanation.circuitDiagram.map((line, idx) => (
                      <div key={idx} className="circuit-line">
                        <code>{line}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "math" && (
            <div className="explain-tab-content">
              <div className="math-highlight-card">
                <span className="math-label">Quantum State & Transformation</span>
                <pre className="math-formula-box">{explanation.mathematics.formula}</pre>
              </div>

              <div className="math-breakdown">
                <strong>Mathematical Breakdown</strong>
                <p>{explanation.mathematics.explanation}</p>
              </div>

              <div className="born-rule-box">
                <strong>Why phase matters (Interference):</strong>
                <p>
                  Quantum probabilities depend on the square of sum amplitudes <code>|α + β|²</code>, enabling constructive
                  and destructive interference.
                </p>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="explain-tab-content">
              <div className="code-header-bar">
                <span>Executable Qiskit Python Code</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
              </div>
              <div className="code-block-container">
                <pre className="python-code-box">
                  <code>{explanation.qiskitCode}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "pitfalls" && (
            <div className="explain-tab-content">
              <div className="pitfalls-section">
                <strong>⚠️ Common Quantum Misconceptions:</strong>
                <ul className="pitfalls-list">
                  {explanation.pitfalls.map((pitfall, i) => (
                    <li key={i}>{pitfall}</li>
                  ))}
                </ul>
              </div>

              <div className="suggested-questions-section">
                <strong>💡 Ask Qubrix AI more about this:</strong>
                <div className="suggested-questions-grid">
                  {explanation.suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      className="question-chip"
                      onClick={() => {
                        onClose();
                        onAskChatbot?.(q);
                      }}
                    >
                      <Bot size={14} />
                      <span>{q}</span>
                      <ArrowRight size={13} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="explain-ai-footer">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onAskChatbot?.(`Can you explain more details about ${explanation.topic}?`);
            }}
            icon={<Bot size={16} />}
          >
            Ask AI Chatbot Follow-up
          </Button>
          {onOpenLab && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onOpenLab();
              }}
              icon={<Play size={16} />}
            >
              Open in Quantum Lab
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
