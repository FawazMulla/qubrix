import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bot, ChevronDown, ExternalLink, Info, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Card, PageHeader } from "../components/ui";
import { getLesson, getModule } from "../mockData";
import {
  getSuggestedQuestions,
  getTutorResponse,
  type ExplanationLevel,
  type TutorContext,
  type TutorResponse,
} from "../services/mockTutor";

interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  text: string;
  response?: TutorResponse;
  createdAt: string;
}

const defaultContext: TutorContext = { source: "general", returnPath: "/learn" };

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

function contextTitle(context: TutorContext) {
  if (context.source === "lesson") return context.lessonTitle ?? "Current lesson";
  if (context.source === "circuit")
    return context.selectedGate ? `${context.selectedGate.type} gate · current circuit` : "Current circuit";
  if (context.source === "simulation") return "Current simulation result";
  if (context.source === "visualization")
    return `${context.visualization ? context.visualization[0].toUpperCase() + context.visualization.slice(1) : "Current"} visualization`;
  if (context.source === "assessment") return context.assessmentTitle ?? "Assessment review";
  return "Quantum learning";
}

function ContextCard({
  context,
  collapsed,
  onToggle,
}: {
  context: TutorContext;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const result = context.simulationResult;
  return (
    <Card className={`tutor-context-card ${collapsed ? "is-collapsed" : ""}`}>
      <button
        type="button"
        className="tutor-context-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
      >
        <span>
          <Info size={15} /> <strong>Current context</strong>
        </span>
        <ChevronDown size={16} className={collapsed ? "is-rotated" : ""} />
      </button>
      {!collapsed && (
        <div className="tutor-context-body">
          <div className="tutor-context-heading">
            <Badge tone="purple">{context.source}</Badge>
            <strong>{contextTitle(context)}</strong>
          </div>
          {context.moduleTitle && (
            <div>
              <span>Module</span>
              <strong>{context.moduleTitle}</strong>
            </div>
          )}
          {context.lessonTitle && (
            <div>
              <span>Lesson</span>
              <strong>{context.lessonTitle}</strong>
              {context.topic && <small>{context.topic}</small>}
            </div>
          )}
          {context.selectedGate && (
            <div>
              <span>Selected gate</span>
              <strong>
                {context.selectedGate.type} · q{context.selectedGate.qubit}
                {context.selectedGate.targetQubit !== undefined
                  ? ` → q${context.selectedGate.targetQubit}`
                  : ""}
              </strong>
            </div>
          )}
          {context.circuitSnapshot && (
            <div>
              <span>Current circuit</span>
              <strong>
                {context.circuitSnapshot.qubits} qubits · {context.circuitSnapshot.gates.length} operations
              </strong>
              <small>
                {context.circuitSnapshot.gates
                  .map((gate) =>
                    gate.type === "CNOT"
                      ? `CNOT q${gate.qubit}→q${gate.targetQubit}`
                      : `${gate.type} q${gate.qubit}`
                  )
                  .join(" · ") || "Empty circuit"}
              </small>
            </div>
          )}
          {result && (
            <div className="tutor-result-context">
              <span>Simulation</span>
              <strong>
                {result.framework} · {result.shots.toLocaleString()} shots
              </strong>
              <small>
                {Object.entries(result.probabilities)
                  .slice(0, 4)
                  .map(([state, probability]) => `|${state}⟩ ${(probability * 100).toFixed(1)}%`)
                  .join(" · ")}
              </small>
            </div>
          )}
          {context.visualization && (
            <div>
              <span>Visualization</span>
              <strong>
                {context.visualization === "bloch"
                  ? "Bloch sphere"
                  : context.visualization === "statevector"
                  ? "Statevector"
                  : context.visualization === "histogram"
                  ? "Measurement histogram"
                  : "Executed circuit"}
              </strong>
            </div>
          )}
          {context.source === "assessment" && (
            <div>
              <span>Assessment question</span>
              <strong>{context.question ?? "Submitted question"}</strong>
              {context.learnerAnswer !== undefined && (
                <small>
                  Your answer:{" "}
                  {Array.isArray(context.learnerAnswer)
                    ? context.learnerAnswer.join(", ")
                    : context.learnerAnswer}
                </small>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function TutorMessage({ message }: { message: ChatMessage }) {
  return (
    <article
      className={`tutor-message tutor-message-${message.role}`}
      aria-label={message.role === "tutor" ? "AI Tutor message" : "Your message"}
    >
      <div className="tutor-message-avatar">{message.role === "tutor" ? <Bot size={15} /> : "You"}</div>
      <div className="tutor-message-content">
        <div className="tutor-message-meta">
          <strong>{message.role === "tutor" ? "Qubrix AI Tutor" : "You"}</strong>
          <time>{formatTime(message.createdAt)}</time>
        </div>
        <p>{message.text}</p>
        {message.response?.sections.map((section, index) => (
          <div className="tutor-response-section" key={`${message.id}-section-${index}`}>
            {section.heading && <h4>{section.heading}</h4>}
            {section.paragraphs.map((paragraph, pIndex) => (
              <p key={`${message.id}-p-${pIndex}`}>{paragraph}</p>
            ))}
            {section.code && (
              <pre>
                <code>{section.code}</code>
              </pre>
            )}
            {section.tryThis && (
              <div className="tutor-try">
                <Sparkles size={14} />
                <span>{section.tryThis}</span>
              </div>
            )}
          </div>
        ))}
        {message.response?.contextUsed.length ? (
          <div className="tutor-context-used">
            <Info size={12} /> {message.response.contextUsed.join(" · ")}
          </div>
        ) : null}
        {message.response?.suggestedFollowUps?.length ? (
          <div className="tutor-followups" aria-label="Suggested follow-up questions">
            {message.response.suggestedFollowUps.slice(0, 3).map((question) => (
              <button
                type="button"
                key={question}
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("qubrix-tutor-followup", { detail: question }))
                }
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}
        {message.response?.relatedLessonId && (
          <div className="tutor-related">
            <div>
              <span className="card-kicker">Related lesson</span>
              <strong>{message.response.relatedLessonTitle}</strong>
            </div>
            <Link className="btn btn-secondary btn-sm" to={lessonPath(message.response.relatedLessonId)}>
              <ExternalLink size={13} /> Open Lesson
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

function lessonPath(lessonId: string) {
  const lesson = getLesson(lessonId);
  return lesson ? `/learn/module/${lesson.moduleId}/lesson/${lesson.id}` : "/learn";
}

function createWelcome(context: TutorContext): ChatMessage {
  const lesson = context.lessonId ? getLesson(context.lessonId) : undefined;
  const module = context.moduleId ? getModule(context.moduleId) : undefined;
  const response = {
    id: "tutor-welcome",
    type: "summary" as const,
    content:
      context.source === "lesson"
        ? `I’m ready to help with ${lesson?.title ?? context.lessonTitle ?? "this lesson"}.`
        : context.source === "circuit"
        ? "I’m ready to explain the current circuit and any selected gate."
        : context.source === "simulation" || context.source === "visualization"
        ? "I’m ready to explain the selected mock simulation and visualization."
        : context.source === "assessment"
        ? "I’m ready to explain the submitted assessment question and help you learn from the feedback."
        : "I’m ready to help you learn quantum computing.",
    sections: [
      {
        heading: module ? `Currently learning · ${module.title}` : "Start with a question",
        paragraphs: [
          "Ask any question in your own words. I’ll explain clearly with interactive examples and use your current workspace context.",
        ],
      },
    ],
    suggestedFollowUps: getSuggestedQuestions(context),
    contextUsed: [
      "Qubrix Interactive Tutor",
      context.lessonTitle ? `Lesson: ${context.lessonTitle}` : `Source: ${context.source}`,
    ],
  } as TutorResponse;
  return {
    id: "message-welcome",
    role: "tutor",
    text: response.content,
    response,
    createdAt: new Date().toISOString(),
  };
}

export function Tutor() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateContext = (location.state as { tutorContext?: TutorContext } | null)?.tutorContext;
  const context = stateContext ?? defaultContext;
  const level: ExplanationLevel = "Beginner";
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcome(context)]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<(message?: string) => void>(() => undefined);

  useEffect(() => {
    const onFollowup = (event: Event) => {
      const question = (event as CustomEvent<string>).detail;
      if (question) sendRef.current(question);
    };
    window.addEventListener("qubrix-tutor-followup", onFollowup);
    return () => window.removeEventListener("qubrix-tutor-followup", onFollowup);
  }, []);

  useEffect(() => {
    setMessages([createWelcome(context)]);
    setInput("");
    setTyping(false);
  }, [
    context.source,
    context.lessonId,
    context.selectedGate?.id,
    context.simulationResult?.id,
    context.visualization,
    context.assessmentId,
    context.questionId,
  ]);

  const suggested = useMemo(() => getSuggestedQuestions(context), [context]);
  const send = (message = input) => {
    const value = message.trim();
    if (!value || typing) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: value,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const response = getTutorResponse(value, context, level);
      setMessages((current) => [
        ...current,
        {
          id: response.id,
          role: "tutor",
          text: response.content,
          response,
          createdAt: new Date().toISOString(),
        },
      ]);
      setTyping(false);
    }, 420);
  };

  sendRef.current = send;

  const clear = () => {
    setMessages([createWelcome(context)]);
    setInput("");
    inputRef.current?.focus();
  };

  const backPath = context.returnPath ?? "/learn";
  const backLabel =
    context.source === "lesson"
      ? "Back to Lesson"
      : context.source === "circuit"
      ? "Back to Circuit"
      : context.source === "simulation"
      ? "Back to Simulator"
      : context.source === "visualization"
      ? "Back to Visualizer"
      : context.source === "assessment"
      ? "Back to Assessment"
      : "Back to Learn";

  return (
    <div className="tutor-page">
      <PageHeader
        eyebrow="Contextual learning assistant"
        title="Qubrix AI Tutor"
        description="Your interactive learning assistant for quantum computing concepts, circuits, and problem solving."
        action={
          <Button variant="secondary" onClick={() => navigate(backPath)}>
            <ArrowLeft size={15} /> {backLabel}
          </Button>
        }
      />

      <div className="tutor-layout">
        <section className="tutor-chat-panel" aria-label="AI Tutor conversation">
          <div className="tutor-chat-toolbar">
            <div>
              <span className="card-kicker">Conversation</span>
              <strong>{contextTitle(context)}</strong>
            </div>
            <div className="tutor-toolbar-actions">
              <Button variant="ghost" size="sm" onClick={clear}>
                <Trash2 size={14} /> Clear Chat
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  clear();
                  navigate("/tutor", { state: { tutorContext: context } });
                }}
              >
                <Plus size={14} /> New Conversation
              </Button>
            </div>
          </div>

          <div className="tutor-suggestions" aria-label="Suggested questions">
            <span>Suggested</span>
            <div>
              {suggested.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => send(question)}
                  disabled={typing}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="tutor-messages" aria-live="polite">
            {messages.map((message) => (
              <TutorMessage key={message.id} message={message} />
            ))}
            {typing && (
              <div className="tutor-message tutor-message-tutor" role="status">
                <div className="tutor-message-avatar">
                  <Bot size={15} />
                </div>
                <div className="tutor-message-content">
                  <div className="tutor-message-meta">
                    <strong>Qubrix AI Tutor</strong>
                  </div>
                  <div className="tutor-typing">
                    <span /> <span /> <span /> <strong>AI Tutor is thinking…</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            className="tutor-composer"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <label className="sr-only" htmlFor="tutor-input">
              Ask Qubrix AI Tutor
            </label>
            <input
              ref={inputRef}
              id="tutor-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the lesson, gate, circuit, or result…"
              autoComplete="off"
            />
            <Button type="submit" disabled={!input.trim() || typing} aria-label="Send message">
              <Send size={15} /> Send
            </Button>
          </form>
        </section>

        <aside className="tutor-sidebar">
          <ContextCard
            context={context}
            collapsed={contextCollapsed}
            onToggle={() => setContextCollapsed((value) => !value)}
          />
          <Card className="tutor-scope-card">
            <div className="tutor-scope-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <strong>Stay in context</strong>
              <p>
                Ask about quantum concepts, your current circuit, the selected simulation, or the
                visualization on screen.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
