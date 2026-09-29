import type { CircuitGate, CircuitState } from "../data/circuitData";
import type { Lesson } from "../types";
import type { SimulationResult } from "./mockSimulation";

export type TutorSource = "lesson" | "circuit" | "simulation" | "visualization" | "assessment" | "general";
export type ExplanationLevel = "Beginner" | "Intermediate" | "Technical";
export type TutorResponseType = "explanation" | "example" | "hint" | "summary" | "circuit" | "simulation" | "navigation" | "fallback";

export interface TutorContext {
  source: TutorSource;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  topic?: string;
  lessonContent?: Lesson;
  selectedGate?: CircuitGate;
  circuitSnapshot?: CircuitState;
  simulationResult?: SimulationResult;
  visualization?: "histogram" | "statevector" | "bloch" | "circuit";
  userProgress?: { overallProgress: number; completedLessonIds: string[] };
  assessmentId?: string;
  assessmentTitle?: string;
  questionId?: string;
  question?: string;
  learnerAnswer?: string | string[];
  correctAnswer?: string | string[];
  explanation?: string;
  returnPath?: string;
}

export interface TutorSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  code?: string;
  tryThis?: string;
}

export interface TutorResponse {
  id: string;
  type: TutorResponseType;
  content: string;
  sections: TutorSection[];
  relatedLessonId?: string;
  relatedLessonTitle?: string;
  suggestedFollowUps: string[];
  contextUsed: string[];
}

export const explanationLevels: Array<{ value: ExplanationLevel; label: string; description: string }> = [
  { value: "Beginner", label: "Beginner", description: "Plain-language intuition" },
  { value: "Intermediate", label: "Intermediate", description: "States, amplitudes, and circuit behavior" },
  { value: "Technical", label: "Technical", description: "More precise mathematical detail" },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9|<>]/g, " ");

function topicMatch(message: string, ...terms: string[]) {
  const normalized = normalize(message);
  return terms.some((term) => normalized.includes(normalize(term)));
}

function gateName(type?: CircuitGate["type"]) {
  return type === "CNOT" ? "CNOT" : type === "MEASURE" ? "measurement" : type ?? "";
}

function circuitHas(circuit: CircuitState | undefined, type: CircuitGate["type"]) {
  return Boolean(circuit?.gates.some((gate) => gate.type === type));
}

function circuitSummary(circuit?: CircuitState) {
  if (!circuit) return "No circuit snapshot is attached.";
  const ordered = [...circuit.gates].sort((a, b) => a.column - b.column || a.qubit - b.qubit);
  return ordered.length
    ? ordered.map((gate) => gate.type === "CNOT" ? `CNOT(q${gate.qubit}→q${gate.targetQubit})` : `${gate.type}(q${gate.qubit})`).join(" · ")
    : "an empty circuit";
}

function relatedForContext(context: TutorContext) {
  const lesson = context.lessonId ?? context.selectedGate?.type === "H" ? "h-gate" : undefined;
  return lesson ?? (context.selectedGate ? ({
    X: "x-gate", Y: "y-gate", Z: "z-gate", H: "h-gate", S: "s-gate", T: "t-gate", CNOT: "cnot-gate", MEASURE: "measurement-operation",
  } as Record<CircuitGate["type"], string>)[context.selectedGate.type] : undefined);
}

function lessonTitleFor(id?: string, context?: TutorContext) {
  if (!id) return undefined;
  if (context?.lessonId === id) return context.lessonTitle;
  const titles: Record<string, string> = {
    "h-gate": "Hadamard gate", "x-gate": "X gate", "y-gate": "Y gate", "z-gate": "Z gate",
    "s-gate": "S gate", "t-gate": "T gate", "cnot-gate": "CNOT gate", "measurement-operation": "Measurement operation",
    superposition: "Superposition", entanglement: "Entanglement", "qubit-states": "Qubit states",
    "probability-amplitudes": "Probability amplitudes", "what-is-quantum-computing": "What is quantum computing?",
  };
  return titles[id];
}

function response(
  type: TutorResponseType,
  content: string,
  sections: TutorSection[],
  context: TutorContext,
  relatedLessonId?: string,
  suggestedFollowUps: string[] = ["Can you give me an example?", "Why does this matter?", "How does this appear in a circuit?"],
): TutorResponse {
  return {
    id: `tutor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
    sections,
    relatedLessonId,
    relatedLessonTitle: lessonTitleFor(relatedLessonId, context),
    suggestedFollowUps,
    contextUsed: [
      context.source !== "general" ? `Opened from ${context.source}` : "General tutor context",
      context.lessonTitle ? `Lesson: ${context.lessonTitle}` : "",
      context.selectedGate ? `Gate: ${gateName(context.selectedGate.type)} on q${context.selectedGate.qubit}` : "",
      context.simulationResult ? `Simulation: ${context.simulationResult.framework}, ${context.simulationResult.shots.toLocaleString()} shots` : "",
      context.visualization ? `Visualization: ${context.visualization}` : "",
    ].filter(Boolean),
  };
}

export function getSuggestedQuestions(context: TutorContext): string[] {
  if (context.source === "assessment") return ["Explain why my answer was wrong", "Explain the correct concept simply", "How does this relate to the lesson?", "Quiz me on this concept"];
  if (context.source === "lesson" && context.lessonTitle) {
    return [
      "Explain this concept simply",
      "Why does this matter?",
      "Can you give me an example?",
      "What should I remember from this lesson?",
      "How does this relate to a quantum circuit?",
    ];
  }
  if (context.source === "circuit") {
    return context.selectedGate
      ? [`Explain the ${gateName(context.selectedGate.type)} gate`, "Explain this circuit", "Why is this gate useful?", "How could I learn more about this gate?"]
      : ["Explain this circuit", "What should I notice in this circuit?", "Why does this circuit behave this way?", "How can I experiment with it?"];
  }
  if (context.source === "simulation" || context.source === "visualization") {
    return ["Explain this result simply", "What does this histogram mean?", "What does the statevector tell me?", "Why are these states appearing?", "How does this connect to the circuit?"];
  }
  return ["Explain qubits simply", "What is superposition?", "What does a CNOT do?", "What should I learn next?"];
}

function answerAssessment(context: TutorContext, level: ExplanationLevel) {
  const question = context.question ?? "the submitted assessment question";
  const explanation = context.explanation ?? "Review the related lesson and compare your reasoning with the submitted answer.";
  const answerText = Array.isArray(context.learnerAnswer) ? context.learnerAnswer.join(", ") : context.learnerAnswer ?? "No answer recorded";
  return response("explanation", `${levelPrefix(level)}the assessment has already been submitted, so I can explain the concept without changing the grade.`, [
    { heading: "Question", paragraphs: [question] },
    { heading: "Your submitted answer", paragraphs: [answerText] },
    { heading: "Concept explanation", paragraphs: [explanation] },
  ], context, context.lessonId, ["Explain this concept more simply", "Show me a related circuit", "What should I remember for the next attempt?"]);
}

function levelPrefix(level: ExplanationLevel) {
  if (level === "Beginner") return "At a beginner level, ";
  if (level === "Intermediate") return "At an intermediate level, ";
  return "Technically, ";
}

function answerGate(context: TutorContext, level: ExplanationLevel, gate: CircuitGate["type"]) {
  const names: Record<CircuitGate["type"], { simple: string; intermediate: string; technical: string; lesson: string }> = {
    X: { simple: "X flips |0⟩ to |1⟩ and |1⟩ to |0⟩.", intermediate: "X is the Pauli-X operator, a basis-state flip and its own inverse.", technical: "X = [[0,1],[1,0]], so X(α|0⟩+β|1⟩)=α|1⟩+β|0⟩.", lesson: "x-gate" },
    Y: { simple: "Y flips the basis state and adds a phase.", intermediate: "Y maps |0⟩ to i|1⟩ and |1⟩ to −i|0⟩.", technical: "Y = [[0,-i],[i,0]], combining a bit flip with a ±i phase.", lesson: "y-gate" },
    Z: { simple: "Z leaves |0⟩ alone but adds a minus sign to |1⟩.", intermediate: "Z changes relative phase without changing computational-basis probabilities immediately.", technical: "Z = diag(1,-1), so it changes the phase of the |1⟩ amplitude.", lesson: "z-gate" },
    H: { simple: "H turns a basis state into an equal superposition.", intermediate: "H|0⟩=(|0⟩+|1⟩)/√2 and H|1⟩=(|0⟩−|1⟩)/√2.", technical: "H=(1/√2)[[1,1],[1,-1]] and H²=I.", lesson: "h-gate" },
    S: { simple: "S changes the phase of |1⟩ without changing its basis probability.", intermediate: "S adds a π/2 phase to the |1⟩ component and satisfies S²=Z.", technical: "S=diag(1,i), a Clifford phase gate with S²=Z.", lesson: "s-gate" },
    T: { simple: "T applies a smaller phase rotation to |1⟩.", intermediate: "T adds a π/4 phase to the |1⟩ component.", technical: "T=diag(1,e^{iπ/4}), a standard non-Clifford phase gate.", lesson: "t-gate" },
    CNOT: { simple: "CNOT uses one qubit as a control and flips the target only when the control is |1⟩.", intermediate: "CNOT is a controlled-X operation. H followed by CNOT can create a Bell state.", technical: "CNOT maps |a,b⟩ to |a,b⊕a⟩ in the computational basis.", lesson: "cnot-gate" },
    MEASURE: { simple: "Measurement turns a quantum state into a classical outcome such as 0 or 1.", intermediate: "Computational-basis measurement samples outcomes according to squared amplitude magnitudes.", technical: "For |ψ⟩=Σαx|x⟩, computational measurement returns x with probability |αx|².", lesson: "measurement-operation" },
  };
  const item = names[gate];
  return response("explanation", `${levelPrefix(level)}${item[level === "Beginner" ? "simple" : level === "Intermediate" ? "intermediate" : "technical"]}`, [
    { heading: "In your circuit", paragraphs: [context.circuitSnapshot ? `This ${item.lesson === "cnot-gate" ? "CNOT" : gate} appears in ${context.circuitSnapshot.qubits}-qubit circuit: ${circuitSummary(context.circuitSnapshot)}.` : `The selected operation is ${gate}.`] },
    { heading: "Try this", bullets: [gate === "H" ? "Compare |0⟩ with H|0⟩ and then inspect the 50% / 50% teaching distribution." : gate === "CNOT" ? "Try H on q0 followed by CNOT(q0,q1) and inspect the resulting |00⟩ / |11⟩ distribution." : `Place ${gate} before a measurement and compare the result with the same circuit without the gate.`] },
  ], context, item.lesson, [`Why is ${gate} useful?`, "Show me a simple example", "How does this affect measurement?"]);
}

function answerSimulation(context: TutorContext, level: ExplanationLevel) {
  const result = context.simulationResult;
  if (!result) return response("fallback", "I don't have a simulation result attached yet. Run a mock simulation and open the tutor from the result.", [], context);
  const top = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const distribution = top.map(([state, probability]) => `|${state}⟩ ≈ ${(probability * 100).toFixed(1)}%`).join(" · ");
  const bellLike = top.some(([state]) => state === "00") && top.some(([state]) => state === "11") && top.length <= 2;
  return response("simulation", `${levelPrefix(level)}this mock run sampled the circuit ${result.shots.toLocaleString()} times using ${result.framework}. The displayed distribution is ${distribution}.`, [
    { heading: "What the result means", bullets: [
      `Qubits: ${result.qubitCount}; circuit depth: ${result.depth}; gates: ${result.gateCount}.`,
      `Measurement counts are deterministic teaching data for this MVP, not hardware observations.`,
      bellLike ? "The strong |00⟩ / |11⟩ pair is the expected teaching pattern for the Bell-state circuit." : "The largest probability indicates which computational-basis outcome the mock circuit produces most often.",
    ] },
    { heading: "Try this", paragraphs: ["Change the circuit or shot count, run it again, and compare how the displayed distribution changes."] },
  ], context, context.lessonId ?? (bellLike ? "entanglement" : undefined), ["Why does this distribution appear?", "Explain the statevector", "How does the circuit create this result?"]);
}

function answerVisualization(context: TutorContext, level: ExplanationLevel) {
  const result = context.simulationResult;
  const visualization = context.visualization ?? "histogram";
  if (!result) return response("fallback", "Open the tutor from a completed simulation result so I can explain the current visualization.", [], context);
  const selected = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])[0];
  if (visualization === "histogram") {
    return response("simulation", `${levelPrefix(level)}the histogram shows how often each computational-basis state appears in the mock measurement distribution. Here the leading state is |${selected[0]}⟩ at ${(selected[1] * 100).toFixed(1)}%.`, [
      { heading: "How to read it", bullets: ["Each bar is a basis state.", "Bar height represents count or probability, depending on the selected view.", "Hover or select a state to inspect its exact count and probability."] },
    ], context, bellLesson(result), ["Why are there multiple bars?", "Explain the statevector", "Why is this result approximately 50/50?"]);
  }
  if (visualization === "statevector") {
    return response("simulation", `${levelPrefix(level)}the statevector lists the complex amplitude assigned to each computational-basis state. Probability comes from the squared magnitude of each amplitude.`, [
      { heading: "In this result", bullets: result.statevector.slice(0, 6).map((state) => `|${state.basis}⟩: amplitude ${state.real.toFixed(3)} + ${state.imaginary.toFixed(3)}i, probability ${(state.probability * 100).toFixed(1)}%.`) },
    ], context, bellLesson(result), ["What is an amplitude?", "Why can amplitudes be complex?", "Explain the histogram"]);
  }
  if (visualization === "bloch") {
    return response("explanation", `${levelPrefix(level)}the Bloch sphere is a compact way to visualize a single qubit state. The north pole represents |0⟩ and the south pole represents |1⟩; points between them represent other pure states.`, [
      { heading: "For this result", paragraphs: [result.qubitCount === 1 ? "The displayed vector is derived from the single-qubit amplitudes in the existing SimulationResult." : "This result has multiple qubits, so the viewer keeps the Bloch display representative and uses the full statevector for the complete multi-qubit state."] },
    ], context, "qubit-states", ["Explain |0⟩ and |1⟩", "How does superposition appear on the sphere?", "Explain the statevector"]);
  }
  return response("circuit", `${levelPrefix(level)}this circuit diagram is reconstructed from the executed circuit snapshot, so it shows the circuit that produced the selected result rather than the current designer state.`, [
    { heading: "Executed circuit", paragraphs: [circuitSummary(result.circuitSnapshot)] },
  ], context, undefined, ["Explain the H gate", "Explain CNOT", "How does this circuit produce the result?"]);
}

function bellLesson(result?: SimulationResult) {
  const hasBell = result?.circuitSnapshot ? circuitHas(result.circuitSnapshot, "H") && circuitHas(result.circuitSnapshot, "CNOT") : false;
  return hasBell ? "entanglement" : undefined;
}

export function getTutorResponse(message: string, context: TutorContext, level: ExplanationLevel): TutorResponse {
  const text = normalize(message);
  const lesson = context.lessonContent;
  const gate = context.selectedGate?.type;
  const isSimple = topicMatch(message, "simply", "simple", "easy");
  const asksExample = topicMatch(message, "example", "show me");
  const asksWhy = topicMatch(message, "why", "matter");
  const asksSummary = topicMatch(message, "remember", "summary", "summarize", "key takeaway");
  const asksCircuit = topicMatch(message, "circuit");
  if (context.source === "assessment") return answerAssessment(context, level);
  const asksResult = topicMatch(message, "result", "histogram", "measurement", "shots", "probability");
  const topicGate = topicMatch(message, "cnot") ? "CNOT" : topicMatch(message, "hadamard", " h ", "h gate") ? "H" : topicMatch(message, "x gate", "pauli x") ? "X" : topicMatch(message, "y gate", "pauli y") ? "Y" : topicMatch(message, "z gate", "pauli z") ? "Z" : topicMatch(message, "s gate") ? "S" : topicMatch(message, "t gate") ? "T" : undefined;

  if (context.source === "simulation" || context.source === "visualization" || context.simulationResult) {
    if (context.source === "visualization" || context.visualization || topicMatch(message, "bloch", "statevector", "histogram")) return answerVisualization(context, level);
    if (asksResult || !text.trim()) return answerSimulation(context, level);
  }

  if (context.source === "circuit" || context.circuitSnapshot) {
    const selected = topicGate ?? gate;
    if (selected && (asksCircuit || asksWhy || asksExample || topicMatch(message, "gate", "operation", "flip", "phase", "superposition", "control", "target"))) return answerGate(context, level, selected);
    if (asksCircuit || topicMatch(message, "what am i seeing", "explain this")) {
      return response("circuit", `${levelPrefix(level)}this is a ${context.circuitSnapshot?.qubits ?? 0}-qubit circuit with ${context.circuitSnapshot?.gates.length ?? 0} operations: ${circuitSummary(context.circuitSnapshot)}.`, [
        { heading: "How to read it", bullets: ["Each row is a qubit.", "Columns represent operation steps.", "CNOT uses a control and target on the same column."] },
      ], context, bellLesson(context.simulationResult), ["Explain the selected gate", "Why does this circuit behave this way?", "What should I try next?"]);
    }
  }

  if (lesson) {
    if (asksSummary) {
      return response("summary", `${levelPrefix(level)}${lesson.title} is about ${lesson.description.toLowerCase()}.`, [
        { heading: "Key takeaways", bullets: lesson.takeaways },
        { heading: "Try this", paragraphs: [lesson.example.description] },
      ], context, lesson.id, ["Quiz me on this lesson", "Explain the hardest part simply", "How does this relate to a circuit?"]);
    }
    if (asksExample) {
      const example = lesson.circuit?.length ? lesson.circuit.join("\n") : lesson.example.description;
      return response("example", `${levelPrefix(level)}here is a concrete way to connect the lesson to practice.`, [
        { heading: lesson.example.title, paragraphs: [lesson.example.description], code: lesson.circuit?.length ? example : undefined },
      ], context, lesson.id, ["Explain this example", "Why does this work?", "What should I try next?"]);
    }
    if (isSimple || asksWhy || topicMatch(message, "concept", "work", "important")) {
      const relevant = lesson.sections[0];
      return response("explanation", `${levelPrefix(level)}${relevant?.body ?? lesson.description}`, [
        { heading: lesson.title, paragraphs: lesson.sections.slice(0, 2).map((section) => section.body) },
        { heading: "Remember", bullets: lesson.takeaways.slice(0, 3) },
      ], context, lesson.id, ["Give me an example", "What should I remember?", "How does this work in a circuit?"]);
    }
  }

  if (topicGate) return answerGate(context, level, topicGate);

  if (topicMatch(message, "qubit", "bits")) {
    const content = level === "Beginner"
      ? "Think of a qubit as the basic unit of quantum information. Before measurement it can be described using amplitudes for |0⟩ and |1⟩."
      : level === "Intermediate"
        ? "A single-qubit state can be written α|0⟩ + β|1⟩ with |α|² + |β|² = 1. The squared magnitudes give computational-basis probabilities."
        : "A pure qubit is a normalized vector (α, β)ᵀ in a two-dimensional complex Hilbert space, with global phase physically irrelevant.";
    return response("explanation", content, [{ heading: "Next idea", bullets: ["Superposition describes multiple basis components in one state.", "Measurement samples a classical basis outcome from the state's probabilities."] }], context, "qubit-states");
  }

  if (topicMatch(message, "superposition", "amplitude")) {
    const content = level === "Beginner"
      ? "Superposition means a qubit state can contain both |0⟩ and |1⟩ components before measurement. H|0⟩ creates an equal example."
      : level === "Intermediate"
        ? "A state such as (|0⟩+|1⟩)/√2 has amplitudes 1/√2 for both basis states, giving 50% probability for each measurement outcome."
        : "Superposition is a linear combination of basis vectors; measurement probabilities are the squared magnitudes of the amplitudes, while relative phase can affect interference.";
    return response("explanation", content, [{ heading: "Try this", bullets: ["Start at |0⟩.", "Apply H.", "Inspect the resulting 50% / 50% mock distribution."] }], context, "superposition");
  }

  if (topicMatch(message, "entanglement", "bell")) {
    return response("explanation", "A Bell state is a two-qubit state with strong correlations that cannot be represented as independent single-qubit states. The teaching circuit H on q0 followed by CNOT(q0,q1) prepares (|00⟩+|11⟩)/√2 from |00⟩.", [
      { heading: "What you see", bullets: ["Measurement outcomes |00⟩ and |11⟩ occur with about equal probability in the mock result.", "The correlation is the key teaching point: the outcomes are linked rather than independent."] },
    ], context, "entanglement", ["Explain CNOT", "Why don't we see |01⟩ here?", "Explain this result simply"]);
  }

  if (topicMatch(message, "probability", "measurement")) {
    return response("simulation", "Measurement probability tells you how often a computational-basis outcome is expected over repeated preparations. In the mock simulator, probabilities are deterministic teaching data.", [
      { heading: "Rule of thumb", paragraphs: ["For amplitude α of a basis state, probability is |α|².", "Counts are the displayed shot totals that correspond to those probabilities."] },
    ], context, "measurement");
  }

  if (topicMatch(message, "bloch")) return answerVisualization({ ...context, source: "visualization", visualization: "bloch" }, level);
  if (topicMatch(message, "statevector")) return answerVisualization({ ...context, source: "visualization", visualization: "statevector" }, level);
  if (topicMatch(message, "depth")) {
    return response("explanation", `${levelPrefix(level)}circuit depth is the number of sequential operation columns needed by the circuit snapshot. Gates that act in the same valid column can contribute to one depth layer.`, [
      { heading: "Why it matters", bullets: ["Depth is a simple measure of circuit length.", "Lower depth can matter because real hardware has noise and coherence limits."] },
    ], context);
  }

  if (topicMatch(message, "algorithm", "grover", "qaoa", "vqe", "deutsch")) {
    return response("explanation", "Quantum algorithms are structured circuit patterns designed to manipulate amplitudes toward useful outcomes. In this MVP, the curriculum introduces Deutsch-Jozsa, Grover's Algorithm, QAOA, and VQE at a conceptual level.", [
      { heading: "Keep learning", paragraphs: ["Use the Algorithms module for the existing explanations rather than treating the tutor as a replacement for the lesson content."] },
    ], context, "deutsch-jozsa", ["Explain Grover's Algorithm", "What should I learn first?", "How does a circuit implement an algorithm?"]);
  }

  return response("fallback", "I don't have enough context to answer that yet. Try asking about the current lesson, a quantum gate, the current circuit, the simulation result, or the visualization you're viewing.", [
    { heading: "Try one of these", bullets: getSuggestedQuestions(context).slice(0, 4) },
  ], context, relatedForContext(context), ["Explain this concept simply", "Explain the current circuit", "Explain this result"]);
}
