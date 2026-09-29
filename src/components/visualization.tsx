import { useState, type CSSProperties } from "react";
import { CircleDot, Info } from "lucide-react";
import { Badge, Card, Tabs } from "./ui";
import type { CircuitGate, CircuitState } from "../data/circuitData";
import { presetCircuits } from "../data/circuitData";
import type { SimulationResult } from "../services/mockSimulation";

const formatNumber = (value: number) => Math.abs(value) < 0.0005 ? "0.000" : value.toFixed(3);
const basisLabel = (basis: string) => `|${basis}⟩`;
export const circuitName = (circuit: CircuitState) => {
  const match = presetCircuits.find(preset => JSON.stringify(preset.circuit) === JSON.stringify(circuit));
  return match?.name ?? `${circuit.qubits}-qubit circuit`;
};

function Bar({ state, value, max, display, tooltip, selected, onSelect }: { state: string; value: number; max: number; display: string; tooltip: string; selected: boolean; onSelect: () => void }) {
  const width = max ? Math.max(2, (value / max) * 100) : 0;
  return <button type="button" className={`viz-bar-row ${selected ? "is-selected" : ""}`} onClick={onSelect} aria-pressed={selected} title={tooltip}>
    <span className="viz-state-label">{basisLabel(state)}</span>
    <span className="viz-bar-track"><span className="viz-bar-fill" style={{ width: `${width}%` }} /></span>
    <strong>{display}</strong>
  </button>;
}

export function MeasurementHistogram({ result }: { result: SimulationResult }) {
  const [mode, setMode] = useState<"probability" | "count">("probability");
  const [selected, setSelected] = useState<string | null>(null);
  const entries = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([state, value]) => mode === "probability" ? value * 100 : result.measurementCounts[state] ?? 0), 1);
  return <Card className="viz-card">
    <div className="viz-card-header"><div><span className="card-kicker">Measurements</span><h2>Measurement distribution</h2><p>Each bar uses the same probabilities and counts stored in the selected SimulationResult.</p></div><div className="viz-toggle" role="group" aria-label="Measurement display mode">
      <button type="button" className={mode === "probability" ? "is-active" : ""} onClick={() => setMode("probability")}>Probability</button>
      <button type="button" className={mode === "count" ? "is-active" : ""} onClick={() => setMode("count")}>Counts</button>
    </div></div>
    <div className="viz-bars" aria-label="Measurement histogram">{entries.map(([state, probability]) => <Bar key={state} state={state} value={mode === "probability" ? probability * 100 : result.measurementCounts[state] ?? 0} display={mode === "probability" ? `${(probability * 100).toFixed(1)}%` : `${(result.measurementCounts[state] ?? 0).toLocaleString()} counts`} tooltip={`${basisLabel(state)} · ${(result.measurementCounts[state] ?? 0).toLocaleString()} counts · ${(probability * 100).toFixed(1)}%`} max={max} selected={selected === state} onSelect={() => setSelected(selected === state ? null : state)} />)}</div>
    <div className="viz-data-note" aria-live="polite"><Info size={14} />{selected ? `${basisLabel(selected)} · ${(result.measurementCounts[selected] ?? 0).toLocaleString()} counts · ${((result.probabilities[selected] ?? 0) * 100).toFixed(1)}%` : "Select a state to inspect its exact count and probability."}</div>
  </Card>;
}

export function StatevectorViewer({ result }: { result: SimulationResult }) {
  const [mode, setMode] = useState<"probability" | "amplitude">("probability");
  if (!result.statevector.length) return <Card className="viz-card"><div className="viz-unavailable"><Info size={18} /><strong>Statevector data is unavailable for this simulation.</strong><span>The measurement and circuit views can still be inspected.</span></div></Card>;
  return <Card className="viz-card">
    <div className="viz-card-header"><div><span className="card-kicker">Quantum state</span><h2>Statevector viewer</h2><p>Amplitudes and probabilities are read directly from the mock result.</p></div><div className="viz-toggle" role="group" aria-label="Statevector display mode"><button type="button" className={mode === "probability" ? "is-active" : ""} onClick={() => setMode("probability")}>Probability</button><button type="button" className={mode === "amplitude" ? "is-active" : ""} onClick={() => setMode("amplitude")}>Amplitude</button></div></div>
    <div className="statevector-table-wrap"><table className="statevector-table"><caption className="sr-only">Statevector values</caption><thead><tr><th scope="col">State</th><th scope="col">Real</th><th scope="col">Imaginary</th><th scope="col">Magnitude</th><th scope="col">Probability</th></tr></thead><tbody>{result.statevector.map(state => {
      const magnitude = Math.hypot(state.real, state.imaginary);
      return <tr key={state.basis}><th scope="row">{basisLabel(state.basis)}</th><td>{formatNumber(state.real)}</td><td>{formatNumber(state.imaginary)}</td><td>{formatNumber(magnitude)}</td><td><strong>{(state.probability * 100).toFixed(1)}%</strong>{mode === "amplitude" && <small className="table-mode-note"> amplitude view</small>}</td></tr>;
    })}</tbody></table></div>
  </Card>;
}

function blochPoint(result: SimulationResult) {
  const states = result.statevector;
  if (result.qubitCount !== 1 || states.length < 2) return { x: 0, y: 0, z: 0, label: "Representative view" };
  const zero = states.find(s => s.basis === "0");
  const one = states.find(s => s.basis === "1");
  if (!zero || !one) return { x: 0, y: 0, z: 0, label: "Representative view" };
  const ax = { re: zero.real, im: zero.imaginary };
  const ay = { re: one.real, im: one.imaginary };
  return {
    x: 2 * (ax.re * ay.re + ax.im * ay.im),
    y: 2 * (ax.re * ay.im - ax.im * ay.re),
    z: zero.probability - one.probability,
    label: "Single-qubit state"
  };
}

export function BlochSphere({ result }: { result: SimulationResult }) {
  const point = blochPoint(result);
  const [hovered, setHovered] = useState(false);
  const px = 160 + point.x * 92;
  const py = 112 - point.z * 88;
  return <Card className="viz-card">
    <div className="viz-card-header"><div><span className="card-kicker">State geometry</span><h2>Bloch sphere</h2><p>{result.qubitCount === 1 ? "A compact view of the single-qubit state." : "A representative single-axis view for a multi-qubit result; full state information remains in the statevector."}</p></div><Badge tone="cyan">{point.label}</Badge></div>
    <div className="bloch-layout">
      <div className="bloch-visual" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} tabIndex={0} aria-label={`Bloch sphere showing ${point.label}`} role="img">
        <svg viewBox="0 0 320 224" className="bloch-svg" aria-hidden="true">
          <ellipse cx="160" cy="112" rx="108" ry="38" className="bloch-ring bloch-ring-horizontal" />
          <ellipse cx="160" cy="112" rx="108" ry="38" transform="rotate(60 160 112)" className="bloch-ring" />
          <ellipse cx="160" cy="112" rx="108" ry="38" transform="rotate(-60 160 112)" className="bloch-ring" />
          <circle cx="160" cy="112" r="88" className="bloch-sphere" />
          <line x1="62" y1="112" x2="258" y2="112" className="bloch-axis" />
          <line x1="160" y1="24" x2="160" y2="200" className="bloch-axis" />
          <line x1="82" y1="156" x2="238" y2="68" className="bloch-axis" />
          <line x1="160" y1="112" x2={px} y2={py} className="bloch-vector" />
          <circle cx={px} cy={py} r={hovered ? 8 : 6} className="bloch-point" />
          <text x="160" y="15" textAnchor="middle" className="bloch-label">|0⟩</text><text x="160" y="218" textAnchor="middle" className="bloch-label">|1⟩</text>
          <text x="265" y="117" className="bloch-label">X</text><text x="247" y="62" className="bloch-label">Y</text><text x="166" y="31" className="bloch-label">Z</text>
        </svg>
      </div>
      <div className="bloch-details"><div className="bloch-state"><CircleDot size={16} /><span>State point</span><strong>{result.qubitCount === 1 ? (point.z > 0.5 ? "|0⟩" : point.z < -0.5 ? "|1⟩" : "Superposition") : "Multi-qubit result"}</strong></div><div><span>Probability detail</span><p>{result.qubitCount === 1 ? `|0⟩ ${((result.probabilities["0"] ?? 0) * 100).toFixed(1)}% · |1⟩ ${((result.probabilities["1"] ?? 0) * 100).toFixed(1)}%` : "Use the statevector for the complete multi-qubit state."}</p></div><div className="viz-data-note">{hovered ? "State point highlighted." : "Hover or focus the sphere to highlight the state point."}</div></div>
    </div>
  </Card>;
}

function GateMark({ gate }: { gate: CircuitGate }) {
  return <span className={`circuit-result-gate ${gate.type === "CNOT" ? "is-cnot" : ""}`} title={gate.type === "CNOT" ? `CNOT q${gate.qubit} → q${gate.targetQubit}` : gate.type}>{gate.type === "CNOT" ? "●⊕" : gate.type === "MEASURE" ? "M" : gate.type}</span>;
}

export function CircuitResultView({ result }: { result: SimulationResult }) {
  const columns = Math.max(result.depth, 1);
  const rows = Array.from({ length: result.qubitCount }, (_, q) => q);
  return <Card className="viz-card">
    <div className="viz-card-header"><div><span className="card-kicker">Executed circuit</span><h2>Circuit result</h2><p>This diagram is reconstructed from the selected SimulationResult.circuitSnapshot.</p></div><Badge tone="purple">{result.gateCount} gates</Badge></div>
    <div className="circuit-result-scroll"><div className="circuit-result-grid" style={{ "--result-columns": columns } as CSSProperties}><div className="circuit-result-corner" />{Array.from({ length: columns }, (_, column) => <div className="circuit-result-column" key={column}>t{column + 1}</div>)}{rows.map(q => <div className="circuit-result-row" key={q}><strong>q{q}</strong>{Array.from({ length: columns }, (_, column) => {
      const gate = result.circuitSnapshot.gates.find(g => g.column === column && (g.qubit === q || (g.type === "CNOT" && g.targetQubit === q)));
      return <div className="circuit-result-cell" key={column}>{gate && <GateMark gate={gate} />}{gate?.type === "CNOT" && gate.targetQubit === q && <span className="circuit-result-target">⊕</span>}</div>;
    })}</div>)}</div></div>
  </Card>;
}

export function Interpretation({ result }: { result: SimulationResult }) {
  const gates = result.circuitSnapshot.gates;
  const hasH = gates.some(g => g.type === "H");
  const hasX = gates.some(g => g.type === "X");
  const hasCnot = gates.some(g => g.type === "CNOT");
  let title = "What does this mean?";
  let body = "The mock engine produced a deterministic result for this circuit. Measurement probabilities describe how often each classical basis state would appear in the simulated sample.";
  if (result.qubitCount === 1 && hasH && !hasX && !hasCnot) body = "The Hadamard gate places the qubit into an equal superposition, so the mock measurement result is split approximately evenly between |0⟩ and |1⟩.";
  else if (result.qubitCount === 1 && hasX) body = "The X gate flips |0⟩ to |1⟩, so the mock result concentrates measurement probability on |1⟩.";
  else if (result.qubitCount === 2 && hasH && hasCnot) body = "The H + CNOT pattern creates the Bell-state teaching example. In this mock result, measurements are concentrated approximately equally on |00⟩ and |11⟩.";
  return <Card className="viz-interpretation"><div className="interpretation-icon"><Info size={18} /></div><div><span className="card-kicker">Beginner explanation</span><h2>{title}</h2><p>{body}</p><small>Mock Simulation Result · no external quantum service was contacted.</small></div></Card>;
}

export function VisualizationTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <Tabs items={[{ value: "overview", label: "Overview" }, { value: "measurements", label: "Measurements" }, { value: "statevector", label: "Statevector" }, { value: "bloch", label: "Bloch Sphere" }, { value: "circuit", label: "Circuit" }]} value={value} onChange={onChange} />;
}
