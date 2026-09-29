import { useState } from "react";
import { CheckCircle2, CircleDot, Code2, RotateCcw } from "lucide-react";
import { Badge, Button, Card, Select } from "./ui";
import type { LearningExample } from "../types";

const stateOptions = {
  zero: { label: "|0⟩", description: "A definite computational-basis state. Measuring in the computational basis returns 0 with 100% probability.", zero: 100, one: 0 },
  one: { label: "|1⟩", description: "The other computational-basis state. Measuring in the computational basis returns 1 with 100% probability.", zero: 0, one: 100 },
  superposition: { label: "(|0⟩ + |1⟩)/√2", description: "An equal superposition. A computational-basis measurement has 50% probability for each outcome.", zero: 50, one: 50 },
};

const gateInfo: Record<string, { symbol: string; purpose: string; effect: string }> = {
  X: { symbol: "X", purpose: "Bit flip", effect: "X|0⟩ = |1⟩ and X|1⟩ = |0⟩." },
  Y: { symbol: "Y", purpose: "Bit + phase flip", effect: "Y|0⟩ = i|1⟩ and Y|1⟩ = −i|0⟩." },
  Z: { symbol: "Z", purpose: "Phase flip", effect: "Z leaves |0⟩ unchanged and maps |1⟩ to −|1⟩." },
  H: { symbol: "H", purpose: "Create superposition", effect: "H|0⟩ = (|0⟩ + |1⟩)/√2." },
  S: { symbol: "S", purpose: "Quarter-turn phase", effect: "S maps |1⟩ to i|1⟩." },
  T: { symbol: "T", purpose: "Eighth-turn phase", effect: "T maps |1⟩ to e^(iπ/4)|1⟩." },
  CNOT: { symbol: "CX", purpose: "Controlled flip", effect: "The target flips when the control qubit is |1⟩." },
  Measure: { symbol: "M", purpose: "Read a classical outcome", effect: "A computational-basis measurement records 0 or 1." },
};

export function InteractiveExample({ example }: { example: LearningExample }) {
  const [state, setState] = useState<keyof typeof stateOptions>("zero");
  const [hadamardOn, setHadamardOn] = useState(false);
  const [measurementShown, setMeasurementShown] = useState(false);
  const [gate, setGate] = useState("H");

  if (example.type === "state") {
    const current = stateOptions[state];
    return <Card className="interactive-card"><div className="interactive-header"><div><Badge tone="cyan">Try it yourself</Badge><h2>{example.title}</h2><p>{example.description}</p></div></div><div className="state-interactive"><div className="state-choice"><Button size="sm" variant={state === "zero" ? "primary" : "secondary"} onClick={() => setState("zero")}>|0⟩</Button><Button size="sm" variant={state === "one" ? "primary" : "secondary"} onClick={() => setState("one")}>|1⟩</Button><Button size="sm" variant={state === "superposition" ? "primary" : "secondary"} onClick={() => setState("superposition")}>Superposition</Button></div><div className="state-display"><strong>{current.label}</strong><p>{current.description}</p><div className="probability-bars"><ProbabilityBar label="0" value={current.zero} /><ProbabilityBar label="1" value={current.one} /></div></div></div></Card>;
  }

  if (example.type === "hadamard") {
    const active = hadamardOn ? stateOptions.superposition : stateOptions.zero;
    return <Card className="interactive-card"><div className="interactive-header"><div><Badge tone="cyan">Try it yourself</Badge><h2>{example.title}</h2><p>{example.description}</p></div><Button size="sm" variant="secondary" onClick={() => setHadamardOn(false)}><RotateCcw size={14} /> Reset</Button></div><div className="hadamard-flow"><div className="state-node"><strong>|0⟩</strong><span>input</span></div><div className="flow-wire" /><button type="button" className={`gate-node ${hadamardOn ? "gate-node-active" : ""}`} aria-pressed={hadamardOn} onClick={() => setHadamardOn((value) => !value)}>H<span>Hadamard</span></button><div className="flow-wire" /><div className="state-node state-node-result"><strong>{active.label}</strong><span>{hadamardOn ? "output" : "unchanged"}</span></div></div><div className="probability-bars"><ProbabilityBar label="Measure 0" value={active.zero} /><ProbabilityBar label="Measure 1" value={active.one} /></div><p className="interactive-note">{hadamardOn ? "Mock result: an equal 50% / 50% distribution in the computational basis." : "Select H to transform |0⟩ into the equal-superposition example."}</p></Card>;
  }

  if (example.type === "measurement") {
    return <Card className="interactive-card"><div className="interactive-header"><div><Badge tone="cyan">Try it yourself</Badge><h2>{example.title}</h2><p>{example.description}</p></div><Button size="sm" onClick={() => setMeasurementShown(true)}>{measurementShown ? "Measured" : "Measure"}</Button></div><div className="measurement-demo"><div className="measurement-state"><CircleDot size={18} /><strong>(|0⟩ + |1⟩)/√2</strong><span>50% / 50% probability model</span></div><div className="measurement-result">{measurementShown ? <><CheckCircle2 size={19} /><strong>Mock outcome: 0</strong><span>This is a deterministic teaching result, not a real quantum execution.</span></> : <><Code2 size={19} /><strong>Ready to measure</strong><span>Click Measure to reveal the controlled example outcome.</span></>}</div></div></Card>;
  }

  const selected = gateInfo[gate];
  return <Card className="interactive-card"><div className="interactive-header"><div><Badge tone="cyan">Try it yourself</Badge><h2>{example.title}</h2><p>{example.description}</p></div><Select aria-label="Select quantum gate" value={gate} onChange={(event) => setGate(event.target.value)}><option>X</option><option>Y</option><option>Z</option><option>H</option><option>S</option><option>T</option><option>CNOT</option><option>Measure</option></Select></div><div className="gate-demo"><div className="gate-symbol">{selected.symbol}</div><div><span className="card-kicker">{selected.purpose}</span><h3>{selected.symbol} gate</h3><p>{selected.effect}</p></div></div></Card>;
}

function ProbabilityBar({ label, value }: { label: string; value: number }) {
  return <div className="probability-row"><span>{label}</span><div className="probability-track"><span style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>;
}