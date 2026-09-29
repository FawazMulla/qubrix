import type { Assessment } from "../types/assessment";

const q = (
  id: string,
  type: "multiple-choice" | "true-false" | "multiple-select" | "coding",
  question: string,
  correctAnswer: string | string[],
  explanation: string,
  relatedConcept: string,
  moduleId: string,
  lessonId?: string,
  options?: Array<{ id: string; label: string }>,
): import("../types/assessment").AssessmentQuestion => ({
  id, type, question, correctAnswer, explanation, relatedConcept, moduleId, lessonId, options,
  difficulty: type === "coding" ? "Intermediate" : "Beginner",
});

export const assessments: Assessment[] = [
  {
    id: "fundamentals-checkpoint",
    title: "Quantum Fundamentals Checkpoint",
    description: "Check your understanding of qubits, superposition, measurement, and probability amplitudes.",
    moduleId: "fundamentals",
    passingScore: 70,
    attemptsAllowed: null,
    estimatedDuration: "8 min",
    questions: [
      q("fund-q1","multiple-choice","Which statement best describes a qubit before measurement?","b","A qubit can be described as a normalized combination of basis states before measurement.", "Qubits", "fundamentals", "qubit-states", [{id:"a",label:"It is always exactly 0 or 1."},{id:"b",label:"It can be described using amplitudes for |0⟩ and |1⟩."},{id:"c",label:"It stores two classical bits."},{id:"d",label:"It cannot be measured."}]),
      q("fund-q2","true-false","A measurement in the computational basis produces a classical 0 or 1 for a single qubit.","true","Measurement produces a classical outcome in the chosen basis; the outcome probabilities come from the state's amplitudes.","Measurement","fundamentals","measurement",[{id:"true",label:"True"},{id:"false",label:"False"}]),
      q("fund-q3","multiple-choice","What does H|0⟩ represent?","c","The Hadamard gate maps |0⟩ to (|0⟩ + |1⟩)/√2, an equal superposition.","Superposition","fundamentals","superposition",[{id:"a",label:"|0⟩ only"},{id:"b",label:"|1⟩ only"},{id:"c",label:"An equal superposition of |0⟩ and |1⟩"},{id:"d",label:"A measured classical bit"}]),
      q("fund-q4","multiple-select","Select all statements that correctly describe probability amplitudes.",["a","c"],"Amplitudes can be complex, and their squared magnitudes give measurement probabilities. They are not themselves percentages.","Probability amplitudes","fundamentals","probability-amplitudes",[{id:"a",label:"Squared magnitude gives the corresponding measurement probability."},{id:"b",label:"Every amplitude is a percentage between 0 and 100."},{id:"c",label:"Amplitudes may contain phase information."},{id:"d",label:"Amplitudes do not need to be normalized."}]),
      q("fund-q5","multiple-choice","Which pair forms the standard computational basis for one qubit?","a","The computational basis states are |0⟩ and |1⟩.","Qubit states","fundamentals","qubit-states",[{id:"a",label:"|0⟩ and |1⟩"},{id:"b",label:"|+⟩ and |-⟩ only"},{id:"c",label:"0 and 2"},{id:"d",label:"True and False"}]),
    ],
  },
  {
    id: "quantum-gates-checkpoint",
    title: "Quantum Gates Checkpoint",
    description: "Test your understanding of X, Y, Z, H, S, T, CNOT, and measurement operations.",
    moduleId: "gates",
    passingScore: 70,
    attemptsAllowed: 3,
    estimatedDuration: "10 min",
    questions: [
      q("gates-q1","multiple-choice","What does the X gate do to |0⟩?","b","X is the quantum analogue of a bit flip: X|0⟩ = |1⟩.","X gate","gates","x-gate",[{id:"a",label:"Leaves it unchanged"},{id:"b",label:"Maps it to |1⟩"},{id:"c",label:"Creates measurement"},{id:"d",label:"Creates a two-qubit state"}]),
      q("gates-q2","multiple-choice","Which gate changes the phase of |1⟩ while leaving |0⟩ unchanged?","c","Z applies a minus sign to |1⟩ and leaves |0⟩ unchanged.","Z gate","gates","z-gate",[{id:"a",label:"X"},{id:"b",label:"H"},{id:"c",label:"Z"},{id:"d",label:"CNOT"}]),
      q("gates-q3","true-false","CNOT flips the target qubit only when the control qubit is |1⟩.","true","CNOT is a controlled-X operation: the target changes only for control state |1⟩.","CNOT","gates","cnot-gate",[{id:"true",label:"True"},{id:"false",label:"False"}]),
      q("gates-q4","multiple-select","Select all gates that are phase operations in the introductory curriculum.",["b","c","d"],"Z changes relative phase, S adds a π/2 phase to |1⟩, and T adds a π/4 phase. X is a basis-state flip.","Phase gates","gates",undefined,[{id:"a",label:"X"},{id:"b",label:"Z"},{id:"c",label:"S"},{id:"d",label:"T"}]),
      q("gates-q5","coding","Write a short Qiskit-style circuit that applies H to q0 and then measures q0.","h","The expected educational pattern is a one-qubit circuit containing H on q0 followed by measurement. The grader checks for the key gate/measurement calls; it does not execute code.","Circuit construction","gates","h-gate"),
    ],
  },
  {
    id: "quantum-concepts-checkpoint",
    title: "Quantum Concepts Checkpoint",
    description: "Connect superposition, entanglement, measurement, statevectors, and the Bloch sphere.",
    moduleId: "concepts",
    passingScore: 70,
    attemptsAllowed: null,
    estimatedDuration: "9 min",
    questions: [
      q("concepts-q1","multiple-choice","What relationship is demonstrated by the Bell-style H + CNOT circuit?","c","The circuit prepares correlated two-qubit outcomes such as |00⟩ and |11⟩, illustrating entanglement.","Entanglement","concepts","entanglement",[{id:"a",label:"Two independent classical bits"},{id:"b",label:"A guaranteed |01⟩ result"},{id:"c",label:"Correlated two-qubit outcomes from an entangled state"},{id:"d",label:"A single-qubit phase rotation"}]),
      q("concepts-q2","multiple-choice","What does a statevector entry tell you?","b","A statevector entry gives the complex amplitude associated with a computational-basis state; its squared magnitude gives probability.","Statevector","concepts","quantum-state-representation",[{id:"a",label:"Only the final classical bit"},{id:"b",label:"The complex amplitude for a basis state"},{id:"c",label:"The circuit's runtime"},{id:"d",label:"The number of gates"}]),
      q("concepts-q3","true-false","The Bloch sphere is a compact visualization for a single-qubit state.","true","The Bloch sphere provides an intuitive geometric representation of a single qubit's pure state.","Bloch sphere","concepts","bloch-sphere",[{id:"true",label:"True"},{id:"false",label:"False"}]),
      q("concepts-q4","multiple-select","Which outcomes are expected in the simplified Bell-state teaching result? ",["a","d"],"The mock Bell result is approximately split between |00⟩ and |11⟩, with |01⟩ and |10⟩ approximately absent.","Bell states","concepts","entanglement",[{id:"a",label:"|00⟩"},{id:"b",label:"|01⟩"},{id:"c",label:"|10⟩"},{id:"d",label:"|11⟩"}]),
      q("concepts-q5","multiple-choice","Why can two states have similar measurement probabilities but different quantum behavior?","a","Relative phase can differ while immediate computational-basis probabilities remain the same, affecting later interference.","Quantum phase","concepts","superposition",[{id:"a",label:"Their amplitudes can have different phases."},{id:"b",label:"Probabilities are never related to amplitudes."},{id:"c",label:"Measurement always ignores the state."},{id:"d",label:"A qubit can contain two independent classical values."}]),
    ],
  },
  {
    id: "quantum-algorithms-checkpoint",
    title: "Quantum Algorithms Checkpoint",
    description: "Review the conceptual roles of Deutsch-Jozsa, Grover's Algorithm, QAOA, and VQE.",
    moduleId: "algorithms",
    passingScore: 70,
    attemptsAllowed: 3,
    estimatedDuration: "8 min",
    questions: [
      q("alg-q1","multiple-choice","What is the introductory goal of Grover's Algorithm?","b","Grover's algorithm provides a quadratic speedup for searching an unstructured space in the standard query model.","Grover's Algorithm","algorithms","grovers-algorithm",[{id:"a",label:"Factoring integers exponentially faster"},{id:"b",label:"Searching an unstructured space with a quadratic query improvement"},{id:"c",label:"Only measuring a single qubit"},{id:"d",label:"Replacing every classical algorithm"}]),
      q("alg-q2","multiple-choice","Deutsch-Jozsa is commonly introduced as a way to distinguish what kind of oracle behavior?","c","The algorithm distinguishes a constant function from a balanced function under its promise.","Deutsch-Jozsa","algorithms","deutsch-jozsa",[{id:"a",label:"Prime versus composite numbers"},{id:"b",label:"Noisy versus noiseless hardware"},{id:"c",label:"Constant versus balanced functions"},{id:"d",label:"Classical bits versus qubits"}]),
      q("alg-q3","true-false","QAOA is a hybrid quantum-classical approach often introduced for optimization problems.","true","QAOA alternates problem and mixing operations and uses a classical optimizer to tune parameters in its common formulation.","QAOA","algorithms","qaoa",[{id:"true",label:"True"},{id:"false",label:"False"}]),
      q("alg-q4","multiple-select","Which are reasonable high-level descriptions of VQE?",["a","c"],"VQE is a hybrid variational method that estimates energies using parameterized quantum circuits and classical optimization.","VQE","algorithms","vqe",[{id:"a",label:"It uses a parameterized quantum state preparation."},{id:"b",label:"It requires a full fault-tolerant quantum computer for the MVP concept."},{id:"c",label:"A classical optimizer can update circuit parameters."},{id:"d",label:"It is identical to Grover's search procedure."}]),
      q("alg-q5","multiple-choice","What do the four algorithm lessons have in common in this MVP?","d","They are introductory conceptual lessons that connect algorithmic goals to quantum-circuit ideas without implementing real quantum execution.","Algorithm overview","algorithms","deutsch-jozsa",[{id:"a",label:"They require backend quantum hardware."},{id:"b",label:"They are all search algorithms."},{id:"c",label:"They only use one gate."},{id:"d",label:"They connect algorithmic intent to quantum-circuit concepts."}]),
    ],
  },
];

export const getAssessment = (id: string) => assessments.find((assessment) => assessment.id === id);
export const getAssessmentsForModule = (moduleId: string) => assessments.filter((assessment) => assessment.moduleId === moduleId);
