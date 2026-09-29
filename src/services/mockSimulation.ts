import type { CircuitGate, CircuitState, Framework } from "../data/circuitData";

export type SimulationStatus = "IDLE" | "READY" | "VALIDATING" | "RUNNING" | "SUCCESS" | "ERROR";
export interface BasisState { basis: string; real: number; imaginary: number; probability: number; }
export interface SimulationResult {
  id: string; circuitId: string; circuitSnapshot: CircuitState; framework: Framework;
  status: "SUCCESS" | "ERROR"; qubitCount: number; gateCount: number; depth: number; shots: number;
  executionTime: number; measurementCounts: Record<string, number>; probabilities: Record<string, number>;
  statevector: BasisState[]; createdAt: string; backend: string; error?: string;
}
export interface SimulationRequest { circuit: CircuitState; framework: Framework; shots: number; }
export interface SimulationExecution { result: SimulationResult; delayMs: number; }

const backends: Record<Framework, string> = {
  "Qiskit Aer": "Aer Simulator", PennyLane: "default.qubit", Cirq: "Cirq Simulator", qBraid: "Mock Quantum Environment"
};
const cloneCircuit = (c: CircuitState): CircuitState => ({ qubits: c.qubits, gates: c.gates.map(g => ({ ...g })) });
const circuitKey = (c: CircuitState) => JSON.stringify({ qubits: c.qubits, gates: [...c.gates].sort((a,b) => a.column-b.column || a.qubit-b.qubit || a.id.localeCompare(b.id)) });
const countsFrom = (p: Record<string, number>, shots: number) => {
  const entries = Object.entries(p); const out: Record<string, number> = {}; let used = 0;
  entries.forEach(([state, probability], i) => { const count = i === entries.length - 1 ? shots - used : Math.round(probability * shots); out[state] = count; used += count; });
  return out;
};
const statevectorFrom = (p: Record<string, number>): BasisState[] =>
  Object.entries(p).map(([basis, probability]) => ({ basis, real: Math.sqrt(probability), imaginary: 0, probability }));

function isBell(c: CircuitState) {
  return c.qubits === 2 &&
    c.gates.some(g => g.type === "H" && g.qubit === 0) &&
    c.gates.some(g => g.type === "CNOT" && g.qubit === 0 && g.targetQubit === 1);
}
function isSingle(c: CircuitState, type: CircuitGate["type"]) {
  return c.qubits === 1 && c.gates.filter(g => g.type !== "MEASURE").length === 1 && c.gates.some(g => g.type === type && g.qubit === 0);
}
function probabilities(c: CircuitState): Record<string, number> {
  if (!c.gates.length) return { ["0".repeat(c.qubits)]: 1 };
  if (isBell(c)) return { "00": 0.5, "11": 0.5 };
  if (isSingle(c, "X")) return { "0": 0, "1": 1 };
  if (isSingle(c, "H")) return { "0": 0.5, "1": 0.5 };
  const measured = c.gates.some(g => g.type === "MEASURE");
  if (measured && c.qubits === 1) {
    if (c.gates.some(g => g.type === "X")) return { "0": 0, "1": 1 };
    if (c.gates.some(g => g.type === "H")) return { "0": 0.5, "1": 0.5 };
    return { "0": 1 };
  }
  if (measured) return { ["0".repeat(c.qubits)]: 0.75, ["1".repeat(c.qubits)]: 0.25 };
  const seed = Array.from(circuitKey(c)).reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const size = 2 ** c.qubits; const a = seed % size; const b = (a + 1 + seed % Math.max(1, size - 1)) % size;
  const result: Record<string, number> = {};
  result[a.toString(2).padStart(c.qubits, "0")] = 0.62;
  result[b.toString(2).padStart(c.qubits, "0")] = size > 2 ? 0.23 : 0.38;
  if (size > 2) {
    const third = Array.from({length:size}, (_,i)=>i).find(i=>i!==a && i!==b) ?? 0;
    result[third.toString(2).padStart(c.qubits, "0")] = 0.15;
  }
  return result;
}
function validate(c: CircuitState, shots: number): string | null {
  if (!c || c.qubits < 1 || c.qubits > 6) return "No valid circuit is ready to simulate.";
  if (!Number.isInteger(shots) || shots < 1) return "Shot count must be a positive whole number.";
  for (const g of c.gates) {
    if (g.qubit < 0 || g.qubit >= c.qubits) return "The circuit contains an invalid qubit reference.";
    if (g.type === "CNOT" && (g.targetQubit === undefined || g.targetQubit < 0 || g.targetQubit >= c.qubits || g.targetQubit === g.qubit)) return "The circuit contains an invalid CNOT.";
  }
  return null;
}
export function prepareSimulation({ circuit, framework, shots }: SimulationRequest): SimulationExecution {
  const error = validate(circuit, shots);
  const id = "sim-" + Date.now();
  const depth = circuit.gates.length ? Math.max(...circuit.gates.map(g => g.column)) + 1 : 0;
  if (error) return { delayMs: 250, result: {
    id, circuitId: circuitKey(circuit), circuitSnapshot: cloneCircuit(circuit), framework, status: "ERROR",
    qubitCount: circuit?.qubits ?? 0, gateCount: circuit?.gates?.length ?? 0, depth, shots,
    executionTime: 0.18, measurementCounts: {}, probabilities: {}, statevector: [], createdAt: new Date().toISOString(),
    backend: backends[framework], error
  }};
  const p = probabilities(circuit); const counts = countsFrom(p, shots);
  const executionTime = Number((0.24 + ((circuit.gates.length * 0.037) % 0.31) + (framework.length % 5) * 0.01).toFixed(2));
  return { delayMs: 650, result: {
    id, circuitId: circuitKey(circuit), circuitSnapshot: cloneCircuit(circuit), framework, status: "SUCCESS",
    qubitCount: circuit.qubits, gateCount: circuit.gates.length, depth, shots, executionTime,
    measurementCounts: counts, probabilities: p, statevector: statevectorFrom(p), createdAt: new Date().toISOString(),
    backend: backends[framework]
  }};
}
export async function runSimulation(request: SimulationRequest): Promise<SimulationResult> {
  const execution = prepareSimulation(request);
  await new Promise(resolve => window.setTimeout(resolve, execution.delayMs));
  return execution.result;
}
export function frameworkMetadata(framework: Framework) {
  const descriptions: Record<Framework,string> = {
    "Qiskit Aer": "Qiskit Aer-style local simulator metadata.",
    PennyLane: "PennyLane device-style mock execution metadata.",
    Cirq: "Cirq simulator-style mock execution metadata.",
    qBraid: "qBraid-style mock quantum environment metadata."
  };
  return { name: framework, backend: backends[framework], execution: "Local Mock Simulation", description: descriptions[framework] };
}
