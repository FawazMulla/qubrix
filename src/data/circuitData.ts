import type { LucideIcon } from "lucide-react";
import { CircleDot, GitBranch, Ruler, Sparkles, Square, Triangle } from "lucide-react";

export type GateType = "X" | "Y" | "Z" | "H" | "S" | "T" | "CNOT" | "MEASURE";
export type GateFamily = "single" | "multi" | "measurement";
export type Framework = "Qiskit Aer" | "PennyLane" | "Cirq" | "qBraid";
export type CodeFramework = "Qiskit" | "PennyLane" | "Cirq" | "qBraid";

export interface GateDefinition {
  type: GateType;
  symbol: string;
  name: string;
  family: GateFamily;
  description: string;
  purpose: string;
  icon: LucideIcon;
  learnLessonId?: string;
}

export interface CircuitGate {
  id: string;
  type: GateType;
  column: number;
  qubit: number;
  targetQubit?: number;
}

export interface CircuitState {
  qubits: number;
  gates: CircuitGate[];
}

export interface PresetCircuit {
  id: string;
  name: string;
  description: string;
  circuit: CircuitState;
}

export const MAX_QUBITS = 6;
export const MAX_COLUMNS = 12;

export const gateDefinitions: GateDefinition[] = [
  { type: "X", symbol: "X", name: "Pauli-X", family: "single", description: "Flips the qubit state.", purpose: "Swaps |0⟩ and |1⟩, like a quantum bit flip.", icon: Square, learnLessonId: "x-gate" },
  { type: "Y", symbol: "Y", name: "Pauli-Y", family: "single", description: "Flips the state with a phase.", purpose: "Combines a basis-state flip with a phase factor.", icon: Triangle, learnLessonId: "y-gate" },
  { type: "Z", symbol: "Z", name: "Pauli-Z", family: "single", description: "Applies a phase flip.", purpose: "Leaves |0⟩ unchanged and adds a minus phase to |1⟩.", icon: CircleDot, learnLessonId: "z-gate" },
  { type: "H", symbol: "H", name: "Hadamard", family: "single", description: "Creates a superposition.", purpose: "Transforms a basis state into an equal superposition.", icon: Sparkles, learnLessonId: "h-gate" },
  { type: "S", symbol: "S", name: "S gate", family: "single", description: "Applies a quarter-turn phase.", purpose: "Adds a π/2 phase to the |1⟩ component.", icon: Ruler, learnLessonId: "s-gate" },
  { type: "T", symbol: "T", name: "T gate", family: "single", description: "Applies an eighth-turn phase.", purpose: "Adds a π/4 phase to the |1⟩ component.", icon: Ruler, learnLessonId: "t-gate" },
  { type: "CNOT", symbol: "⊕", name: "Controlled-X", family: "multi", description: "Flips a target based on a control.", purpose: "Applies X to the target only when the control is |1⟩.", icon: GitBranch, learnLessonId: "cnot-gate" },
  { type: "MEASURE", symbol: "M", name: "Measure", family: "measurement", description: "Marks a qubit for measurement.", purpose: "Represents conversion from a quantum state to a classical outcome.", icon: CircleDot, learnLessonId: "measurement-operation" },
];

export const frameworks: Framework[] = ["Qiskit Aer", "PennyLane", "Cirq", "qBraid"];
export const codeFrameworks: CodeFramework[] = ["Qiskit", "PennyLane", "Cirq", "qBraid"];

export const emptyCircuit = (qubits = 2): CircuitState => ({ qubits, gates: [] });

export const presetCircuits: PresetCircuit[] = [
  {
    id: "superposition",
    name: "Single Qubit Superposition",
    description: "Prepare q0 in an equal superposition and mark it for measurement.",
    circuit: { qubits: 1, gates: [
      { id: "super-h", type: "H", column: 0, qubit: 0 },
      { id: "super-m", type: "MEASURE", column: 1, qubit: 0 },
    ] },
  },
  {
    id: "bell",
    name: "Bell State / Entanglement",
    description: "Create a Bell-state teaching example with H followed by CNOT and measurement.",
    circuit: { qubits: 2, gates: [
      { id: "bell-h", type: "H", column: 0, qubit: 0 },
      { id: "bell-cnot", type: "CNOT", column: 1, qubit: 0, targetQubit: 1 },
      { id: "bell-m0", type: "MEASURE", column: 2, qubit: 0 },
      { id: "bell-m1", type: "MEASURE", column: 2, qubit: 1 },
    ] },
  },
  {
    id: "measurement",
    name: "Simple Measurement Circuit",
    description: "Flip q0 and then mark it for measurement.",
    circuit: { qubits: 1, gates: [
      { id: "measure-x", type: "X", column: 0, qubit: 0 },
      { id: "measure-m", type: "MEASURE", column: 1, qubit: 0 },
    ] },
  },
];

export const getGateDefinition = (type: GateType) => gateDefinitions.find((gate) => gate.type === type)!;

const qiskitGate = (gate: CircuitGate) => {
  const q = gate.qubit;
  switch (gate.type) {
    case "X": return `qc.x(${q})`;
    case "Y": return `qc.y(${q})`;
    case "Z": return `qc.z(${q})`;
    case "H": return `qc.h(${q})`;
    case "S": return `qc.s(${q})`;
    case "T": return `qc.t(${q})`;
    case "CNOT": return `qc.cx(${q}, ${gate.targetQubit})`;
    case "MEASURE": return `qc.measure(${q}, ${q})`;
  }
};

const pennyLaneGate = (gate: CircuitGate) => {
  const q = gate.qubit;
  switch (gate.type) {
    case "X": return `qml.PauliX(wires=${q})`;
    case "Y": return `qml.PauliY(wires=${q})`;
    case "Z": return `qml.PauliZ(wires=${q})`;
    case "H": return `qml.Hadamard(wires=${q})`;
    case "S": return `qml.S(wires=${q})`;
    case "T": return `qml.T(wires=${q})`;
    case "CNOT": return `qml.CNOT(wires=[${q}, ${gate.targetQubit}])`;
    case "MEASURE": return "return qml.sample()";
  }
};

const cirqGate = (gate: CircuitGate) => {
  const q = `q[${gate.qubit}]`;
  switch (gate.type) {
    case "X": return `circuit.append(cirq.X(${q}))`;
    case "Y": return `circuit.append(cirq.Y(${q}))`;
    case "Z": return `circuit.append(cirq.Z(${q}))`;
    case "H": return `circuit.append(cirq.H(${q}))`;
    case "S": return `circuit.append(cirq.S(${q}))`;
    case "T": return `circuit.append(cirq.T(${q}))`;
    case "CNOT": return `circuit.append(cirq.CNOT(${q}, q[${gate.targetQubit}]))`;
    case "MEASURE": return `circuit.append(cirq.measure(${q}, key="q${gate.qubit}"))`;
  }
};

const orderedGates = (circuit: CircuitState) => [...circuit.gates].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

export function generateCode(circuit: CircuitState, framework: CodeFramework): string {
  const gates = orderedGates(circuit);
  if (framework === "Qiskit") {
    return [
      "from qiskit import QuantumCircuit",
      "",
      `qc = QuantumCircuit(${circuit.qubits}${gates.some((gate) => gate.type === "MEASURE") ? `, ${circuit.qubits}` : ""})`,
      ...gates.map(qiskitGate).filter(Boolean),
      "",
      "# Mock Qubrix circuit representation",
      "print(qc)",
    ].join("\n");
  }
  if (framework === "PennyLane") {
    return [
      "import pennylane as qml",
      "",
      `dev = qml.device("default.qubit", wires=${circuit.qubits})`,
      "",
      "@qml.qnode(dev)",
      "def circuit():",
      ...(gates.filter((gate) => gate.type !== "MEASURE").length ? gates.filter((gate) => gate.type !== "MEASURE").map((gate) => `    ${pennyLaneGate(gate)}`) : ["    pass"]),
      "",
      gates.some((gate) => gate.type === "MEASURE") ? "result = circuit()" : "# No measurement operation in this mock circuit",
    ].join("\n");
  }
  if (framework === "qBraid") {
    return [
      "# qBraid mock representation",
      "# Execution is handled by the Qubrix frontend mock engine.",
      "",
      `circuit = ${circuit.qubits} qubit${circuit.qubits === 1 ? "" : "s"}`,
      ...gates.map((gate) => `# ${gate.type} q${gate.qubit}${gate.targetQubit !== undefined ? ` -> q${gate.targetQubit}` : ""}`),
      "",
      "# Mock Quantum Environment",
    ].join("\n");
  }
  return [
    "import cirq",
    "",
    `q = cirq.LineQubit.range(${circuit.qubits})`,
    "circuit = cirq.Circuit()",
    ...gates.map(cirqGate).filter(Boolean),
    "",
    "print(circuit)",
  ].join("\n");
}

export const frameworkShortLabel: Record<Framework, string> = {
  "Qiskit Aer": "Qiskit",
  PennyLane: "PennyLane",
  Cirq: "Cirq",
  qBraid: "qBraid",
};
