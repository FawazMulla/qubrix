import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Bot, ChevronDown, CircleDot, Code2, Copy, ExternalLink, Info, Layers3, Minus, Play, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, PageHeader, Select, Toast, Tooltip } from "../components/ui";
import {
  MAX_COLUMNS, MAX_QUBITS, codeFrameworks, emptyCircuit, frameworks, gateDefinitions, getGateDefinition, generateCode, presetCircuits,
} from "../data/circuitData";
import type { CodeFramework, CircuitGate, CircuitState, Framework } from "../data/circuitData";
import { useSimulation } from "../context/SimulationContext";

const newId = () => `gate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function cloneCircuit(circuit: CircuitState): CircuitState {
  return { qubits: circuit.qubits, gates: circuit.gates.map((gate) => ({ ...gate })) };
}

function gateAt(circuit: CircuitState, column: number, qubit: number) {
  return circuit.gates.find((gate) => gate.column === column && (gate.qubit === qubit || (gate.type === "CNOT" && gate.targetQubit === qubit)));
}

function cnotAt(circuit: CircuitState, column: number) {
  return circuit.gates.find((gate) => gate.type === "CNOT" && gate.column === column);
}

function validateCircuit(circuit: CircuitState): string | null {
  if (circuit.qubits < 1 || circuit.qubits > MAX_QUBITS) return `Circuit must contain 1–${MAX_QUBITS} qubits.`;
  if (circuit.gates.some((gate) => gate.column < 0 || gate.column >= MAX_COLUMNS)) return "One or more gates are outside the supported operation range.";
  for (const gate of circuit.gates) {
    if (gate.qubit < 0 || gate.qubit >= circuit.qubits) return "A gate references a qubit that does not exist.";
    if (gate.type === "CNOT" && (gate.targetQubit === undefined || gate.targetQubit < 0 || gate.targetQubit >= circuit.qubits || gate.targetQubit === gate.qubit)) {
      return "CNOT needs two different qubits in the same operation column.";
    }
  }
  const occupied = new Set<string>();
  for (const gate of circuit.gates) {
    const cells = gate.type === "CNOT" ? [gate.qubit, gate.targetQubit!] : [gate.qubit];
    for (const q of cells) {
      const key = `${gate.column}:${q}`;
      if (occupied.has(key)) return "Two operations cannot occupy the same qubit slot.";
      occupied.add(key);
    }
  }
  return null;
}

function syntaxHighlight(code: string) {
  return code.split("\n").map((line, index) => (
    <div key={`${index}-${line}`} className="circuit-code-line">
      <span className="code-line-number">{index + 1}</span>
      <code>{line.split(/(from|import|def|return|print|QuantumCircuit|qml\.[A-Za-z]+|cirq\.[A-Za-z]+|qc\.[a-z]+|circuit\.append|#.*|".*?")/g).map((part, i) => {
        const isComment = part.startsWith("#");
        const isKeyword = /^(from|import|def|return|print)$/.test(part);
        const isApi = /^(QuantumCircuit|qml\.|cirq\.|qc\.|circuit\.append)/.test(part);
        return <span key={i} className={isComment ? "code-comment" : isKeyword ? "code-keyword" : isApi ? "code-api" : ""}>{part}</span>;
      })}</code>
    </div>
  ));
}

function GateButton({ type, selected, onClick }: { type: CircuitGate["type"]; selected: boolean; onClick: () => void }) {
  const definition = getGateDefinition(type);
  const Icon = definition.icon;
  return (
    <Tooltip label={`${definition.name}: ${definition.description}`}>
      <button type="button" className={`circuit-gate-button ${selected ? "is-selected" : ""}`} aria-pressed={selected} aria-label={`Select ${definition.name} gate. ${definition.description}`} onClick={onClick}>
        <span className="gate-button-symbol">{definition.symbol}</span>
        <span className="gate-button-copy"><strong>{definition.name}</strong><small>{definition.description}</small></span>
        <Icon size={15} aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

function GatePalette({ selectedGate, onSelect }: { selectedGate: CircuitGate["type"] | null; onSelect: (type: CircuitGate["type"]) => void }) {
  return (
    <Card className="circuit-panel gate-palette">
      <div className="circuit-panel-header"><div><span className="card-kicker">Gate palette</span><h2>Operations</h2></div><Badge tone="purple">{selectedGate ? `Placing ${selectedGate}` : "Choose a gate"}</Badge></div>
      <div className="gate-group"><span className="circuit-group-label">Single qubit</span>{gateDefinitions.filter((gate) => gate.family === "single").map((gate) => <GateButton key={gate.type} type={gate.type} selected={selectedGate === gate.type} onClick={() => onSelect(gate.type)} />)}</div>
      <div className="gate-group"><span className="circuit-group-label">Multi qubit</span>{gateDefinitions.filter((gate) => gate.family === "multi").map((gate) => <GateButton key={gate.type} type={gate.type} selected={selectedGate === gate.type} onClick={() => onSelect(gate.type)} />)}</div>
      <div className="gate-group"><span className="circuit-group-label">Measurement</span>{gateDefinitions.filter((gate) => gate.family === "measurement").map((gate) => <GateButton key={gate.type} type={gate.type} selected={selectedGate === gate.type} onClick={() => onSelect(gate.type)} />)}</div>
    </Card>
  );
}

function CircuitCanvas({ circuit, selectedId, selectedGateType, pendingCnotControl, onSlotClick, onGateSelect }: {
  circuit: CircuitState; selectedId: string | null; selectedGateType: CircuitGate["type"] | null; pendingCnotControl: { column: number; qubit: number } | null; onSlotClick: (column: number, qubit: number) => void; onGateSelect: (gate: CircuitGate) => void;
}) {
  const columns = Array.from({ length: Math.max(4, Math.min(MAX_COLUMNS, Math.max(4, circuit.gates.reduce((max, gate) => Math.max(max, gate.column + 1), 0) + 2))) }, (_, i) => i);
  const getGate = (column: number, qubit: number) => gateAt(circuit, column, qubit);
  return (
    <Card className="circuit-panel circuit-canvas-panel">
      <div className="circuit-panel-header">
        <div><span className="card-kicker">Circuit canvas</span><h2>Build your circuit</h2><p>Choose a gate, then click a slot. Select a placed gate and click another slot to move it.</p></div>
        <Badge tone={pendingCnotControl ? "cyan" : "neutral"}>{pendingCnotControl ? "Choose CNOT target" : `${circuit.qubits} qubits · ${columns.length} columns`}</Badge>
      </div>
      <div className="circuit-scroll" role="grid" aria-label="Quantum circuit editor">
        <div className="circuit-grid" style={{ "--circuit-columns": columns.length } as CSSProperties}>
          <div className="circuit-corner" />
          {columns.map((column) => <div className="circuit-column-label" key={column}>t{column}</div>)}
          {Array.from({ length: circuit.qubits }, (_, qubit) => (
            <div className="circuit-row" key={qubit}>
              <div className="qubit-label"><strong>q{qubit}</strong><span>qubit {qubit}</span></div>
              {columns.map((column) => {
                const gate = getGate(column, qubit);
                const cnot = cnotAt(circuit, column);
                const isCnotTarget = cnot?.targetQubit === qubit;
                const isPending = pendingCnotControl?.column === column && pendingCnotControl.qubit === qubit;
                const cnotMin = cnot ? Math.min(cnot.qubit, cnot.targetQubit ?? cnot.qubit) : -1;
                const cnotMax = cnot ? Math.max(cnot.qubit, cnot.targetQubit ?? cnot.qubit) : -1;
                const isCnotBetween = cnot ? qubit > cnotMin && qubit < cnotMax : false;
                return (
                  <div className={`circuit-cell ${isPending ? "is-pending" : ""} ${selectedGateType ? "is-placeable" : ""}`} key={column}>
                    {cnot && cnot.qubit === qubit ? (
                      <button type="button" className={`placed-gate cnot-control ${selectedId === cnot.id ? "is-selected" : ""}`} aria-label={`CNOT control on q${qubit}, column ${column}`} onClick={() => onGateSelect(cnot)}><span className="cnot-marker">●</span></button>
                    ) : isCnotTarget ? (
                      <button type="button" className={`placed-gate cnot-target ${selectedId === cnot?.id ? "is-selected" : ""}`} aria-label={`CNOT target on q${qubit}, column ${column}`} onClick={() => cnot && onGateSelect(cnot)}><span className="cnot-marker">⊕</span></button>
                    ) : gate ? (
                      <button type="button" className={`placed-gate ${selectedId === gate.id ? "is-selected" : ""}`} aria-label={`${getGateDefinition(gate.type).name} on q${qubit}, column ${column}`} onClick={() => onGateSelect(gate)}><span>{getGateDefinition(gate.type).symbol}</span></button>
                    ) : (
                      <button type="button" className="circuit-slot" aria-label={`Empty circuit slot q${qubit}, column ${column}`} onClick={() => onSlotClick(column, qubit)}>{pendingCnotControl?.column === column && <span className="slot-dot" aria-hidden="true" />}</button>
                    )}
                    {cnot && cnot.column === column && (qubit === cnot.qubit || qubit === cnot.targetQubit || isCnotBetween) && <span className="cnot-wire" aria-hidden="true" style={{ top: isCnotBetween ? "0" : qubit === cnot.qubit ? "50%" : "0", bottom: isCnotBetween ? "0" : qubit === cnot.targetQubit ? "50%" : "0" }} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {!circuit.gates.length && <div className="circuit-empty"><CircleDot size={17} /><span>No operations yet. Select a gate from the palette to start building.</span></div>}
    </Card>
  );
}

function Inspector({ selected, onDelete, onLearn, onTutor }: { selected: CircuitGate | null; onDelete: () => void; onLearn: () => void; onTutor: () => void }) {
  if (!selected) return <Card className="circuit-panel inspector-panel"><div className="inspector-empty"><Info size={22} /><strong>No gate selected</strong><span>Select a gate on the canvas to inspect or move it.</span></div></Card>;
  const definition = getGateDefinition(selected.type);
  return <Card className="circuit-panel inspector-panel">
    <div className="circuit-panel-header"><div><span className="card-kicker">Inspector</span><h2>Gate details</h2></div><Badge tone="purple">{definition.symbol}</Badge></div>
    <div className="inspector-gate"><div className="inspector-symbol">{definition.symbol}</div><div><h3>{definition.name}</h3><span>{definition.family === "single" ? "Single Qubit" : definition.family === "multi" ? "Multi Qubit" : "Measurement"}</span></div></div>
    <div className="inspector-facts">
      <div><span>Qubit position</span><strong>{selected.type === "CNOT" ? `q${selected.qubit} → q${selected.targetQubit}` : `q${selected.qubit}`}</strong></div>
      <div><span>Operation column</span><strong>t{selected.column}</strong></div>
      <div><span>Purpose</span><p>{definition.purpose}</p></div>
    </div>
    <div className="inspector-actions">
      {definition.learnLessonId && <Button variant="ghost" size="sm" onClick={onLearn}><ExternalLink size={14} /> Learn about this gate</Button>}
      <Button variant="secondary" size="sm" onClick={onTutor}><Bot size={14} /> Ask AI Tutor</Button>
      <Button variant="danger" size="sm" onClick={onDelete}><Trash2 size={14} /> Delete gate</Button>
    </div>
  </Card>;
}

function CodePanel({ codeFramework, onFrameworkChange, code, onCopy }: { codeFramework: CodeFramework; onFrameworkChange: (framework: CodeFramework) => void; code: string; onCopy: () => void }) {
  return <Card className="circuit-panel code-panel">
    <div className="circuit-panel-header code-panel-header">
      <div><span className="card-kicker">Code view</span><h2>Generated quantum code</h2><p>Read-only mock code generated from the current circuit.</p></div>
      <div className="code-controls"><Select aria-label="Code framework" value={codeFramework} onChange={(e) => onFrameworkChange(e.target.value as CodeFramework)}>{codeFrameworks.map((framework) => <option key={framework}>{framework}</option>)}</Select><Button variant="secondary" size="sm" onClick={onCopy}><Copy size={14} /> Copy</Button></div>
    </div>
    <div className="syntax-code" aria-label={`${codeFramework} generated code`}>{syntaxHighlight(code)}</div>
  </Card>;
}

function CircuitInfo({ circuit, framework }: { circuit: CircuitState; framework: Framework }) {
  const measurements = circuit.gates.filter((gate) => gate.type === "MEASURE").length;
  const depth = circuit.gates.length ? Math.max(...circuit.gates.map((gate) => gate.column)) + 1 : 0;
  return <Card className="circuit-info">
    <div><span>Qubits</span><strong>{circuit.qubits}</strong></div>
    <div><span>Gates</span><strong>{circuit.gates.length}</strong></div>
    <div><span>Depth</span><strong>{depth}</strong></div>
    <div><span>Measurements</span><strong>{measurements}</strong></div>
    <div><span>Framework</span><strong>{framework}</strong></div>
  </Card>;
}

function Presets({ onLoad }: { onLoad: (preset: typeof presetCircuits[number]) => void }) {
  return <Card className="circuit-panel preset-panel">
    <div className="circuit-panel-header"><div><span className="card-kicker">Examples</span><h2>Preset circuits</h2><p>Start from a teaching example, then modify it freely.</p></div></div>
    <div className="preset-grid">{presetCircuits.map((preset) => <button type="button" className="preset-card" key={preset.id} onClick={() => onLoad(preset)}><span className="preset-symbol">{preset.id === "bell" ? "●⊕" : preset.id === "measurement" ? "X→M" : "H→M"}</span><strong>{preset.name}</strong><span>{preset.description}</span><em>Load example <ChevronDown size={13} /></em></button>)}</div>
  </Card>;
}

export function CircuitDesigner() {
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState<CircuitState>(() => emptyCircuit());
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [selectedGateType, setSelectedGateType] = useState<CircuitGate["type"] | null>(null);
  const [pendingCnotControl, setPendingCnotControl] = useState<{ column: number; qubit: number } | null>(null);
  const [framework, setFramework] = useState<Framework>("Qiskit Aer");
  const [codeFramework, setCodeFramework] = useState<CodeFramework>("Qiskit");
  const [running, setRunning] = useState(false);

  const { shots, setShots, setCircuit: setSimulationCircuit, setFramework: setSimulationFramework, execute: executeSimulation, saveCircuit: saveSimulationCircuit } = useSimulation();
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone?: "neutral" | "success" | "error" } | null>(null);
  

  const selected = circuit.gates.find((gate) => gate.id === selectedGateId) ?? null;
  const code = useMemo(() => generateCode(circuit, codeFramework), [circuit, codeFramework]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  useEffect(() => { setSimulationCircuit(circuit); setSimulationFramework(framework); }, [circuit, framework, setSimulationCircuit, setSimulationFramework]);

  useEffect(() => { setCodeFramework(framework === "Qiskit Aer" ? "Qiskit" : framework === "PennyLane" ? "PennyLane" : framework === "Cirq" ? "Cirq" : "qBraid"); }, [framework]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === "Delete" && selectedGateId && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        setCircuit((current) => ({ ...current, gates: current.gates.filter((gate) => gate.id !== selectedGateId) }));
        setSelectedGateId(null);
        setToast({ message: "Selected gate deleted.", tone: "success" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedGateId]);

  const notify = (message: string, tone: "neutral" | "success" | "error" = "neutral") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2400);
  };

  const chooseGate = (type: CircuitGate["type"]) => {
    setSelectedGateType(type);
    setSelectedGateId(null);
    setPendingCnotControl(null);
    if (type !== "CNOT") notify(`${getGateDefinition(type).name} selected. Choose a circuit slot.`);
    else notify("CNOT selected. Choose the control qubit first.");
  };

  const clearPlacement = () => { setSelectedGateType(null); setPendingCnotControl(null); };

  const placeOrMove = (column: number, qubit: number) => {
    if (!selectedGateType && !selectedGateId) return;
    if (column >= MAX_COLUMNS) { notify("This circuit has reached the supported column limit.", "error"); return; }
    const occupied = gateAt(circuit, column, qubit);
    if (occupied && occupied.id !== selectedGateId && selectedGateType === "CNOT") { notify("CNOT needs two empty qubit slots in the same column.", "error"); return; }
    if (selectedGateType === "CNOT") {
      if (!pendingCnotControl) {
        setPendingCnotControl({ column, qubit });
        notify(`q${qubit} selected as control. Choose a different qubit in column t${column}.`);
        return;
      }
      if (pendingCnotControl.column !== column) { notify("CNOT control and target must share the same operation column.", "error"); return; }
      if (pendingCnotControl.qubit === qubit) { notify("CNOT needs a different target qubit.", "error"); return; }
      const id = selectedGateId ?? newId();
      setCircuit((current) => ({ ...current, gates: [...current.gates.filter((gate) => gate.id !== selectedGateId), { id, type: "CNOT", column, qubit: pendingCnotControl.qubit, targetQubit: qubit }] }));
      setSelectedGateId(id);
      clearPlacement();
      notify(selectedGateId ? "CNOT moved." : "CNOT placed.", "success");
      return;
    }
    if (selectedGateType && occupied && occupied.id !== selectedGateId) {
      const id = newId();
      setCircuit((current) => ({ ...current, gates: [...current.gates.filter((gate) => gate.id !== occupied.id), { id, type: selectedGateType, column, qubit }] }));
      setSelectedGateId(id);
      clearPlacement();
      notify(`${getGateDefinition(selectedGateType).name} replaced the existing operation.`, "success");
      return;
    }
    if (selectedGateId && !selectedGateType) {
      const selectedCurrent = circuit.gates.find((gate) => gate.id === selectedGateId);
      if (selectedCurrent?.type === "CNOT") {
        setPendingCnotControl({ column, qubit });
        setSelectedGateType("CNOT");
        notify(`q${qubit} selected as the new CNOT control. Choose its target.`, "neutral");
        return;
      }
      setCircuit((current) => ({ ...current, gates: current.gates.map((gate) => gate.id === selectedGateId ? { ...gate, column, qubit } : gate) }));
      clearPlacement();
      notify("Gate moved.", "success");
      return;
    }
    if (!selectedGateType) return;
    const id = newId();
    setCircuit((current) => ({ ...current, gates: [...current.gates, { id, type: selectedGateType, column, qubit }] }));
    setSelectedGateId(id);
    clearPlacement();
    notify(`${getGateDefinition(selectedGateType).name} placed.`, "success");
  };

  const selectGate = (gate: CircuitGate) => {
    setSelectedGateId(gate.id);
    setSelectedGateType(null);
    setPendingCnotControl(null);
  };

  const deleteSelected = () => {
    if (!selectedGateId) return;
    setCircuit((current) => ({ ...current, gates: current.gates.filter((gate) => gate.id !== selectedGateId) }));
    setSelectedGateId(null);
    notify("Selected gate deleted.", "success");
  };

  const clearCircuit = () => {
    setCircuit((current) => ({ ...current, gates: [] }));
    setSelectedGateId(null);
    clearPlacement();
    notify("Circuit cleared; qubits preserved.", "success");
  };

  const resetCircuit = () => {
    setCircuit(emptyCircuit());
    setSelectedGateId(null);
    clearPlacement();
    setRunMessage(null);
    notify("Circuit reset to the default two-qubit canvas.", "success");
  };

  const addQubit = () => {
    if (circuit.qubits >= MAX_QUBITS) { notify(`The MVP supports up to ${MAX_QUBITS} qubits.`, "error"); return; }
    setCircuit((current) => ({ ...current, qubits: current.qubits + 1 }));
    notify(`Added q${circuit.qubits}.`, "success");
  };

  const removeQubit = () => {
    if (circuit.qubits <= 1) { notify("At least one qubit is required.", "error"); return; }
    const removed = circuit.qubits - 1;
    const invalid = circuit.gates.some((gate) => gate.qubit === removed || gate.targetQubit === removed);
    setCircuit((current) => ({ ...current, qubits: current.qubits - 1, gates: current.gates.filter((gate) => gate.qubit !== removed && gate.targetQubit !== removed) }));
    setSelectedGateId((id) => id && circuit.gates.some((gate) => gate.id === id && (gate.qubit === removed || gate.targetQubit === removed)) ? null : id);
    notify(invalid ? `Removed q${removed} and its attached operations.` : `Removed q${removed}.`, "success");
  };

  const loadPreset = (preset: typeof presetCircuits[number]) => {
    const next = cloneCircuit(preset.circuit);
    setCircuit(next);
    setSelectedGateId(null);
    clearPlacement();
    notify(`${preset.name} loaded.`, "success");
  };

  const saveCircuit = () => {
    const error = validateCircuit(circuit);
    if (error) {
      notify(error, "error");
      return;
    }
    saveSimulationCircuit(circuit);
    setSimulationCircuit(circuit);
    setSimulationFramework(framework);
    notify("Circuit saved. It is ready to simulate from the Simulator.", "success");
  };

  const runCircuit = async () => {
    const error = validateCircuit(circuit);
    if (error) { notify(error, "error"); return; }
    if (!circuit.gates.length) { notify("Add at least one gate before running the circuit.", "error"); return; }
    setRunning(true);
    setRunMessage("Validating circuit...");
    const result = await executeSimulation(circuit, framework, shots);
    setRunning(false);
    if (result.status === "ERROR") {
      setRunMessage(result.error ?? "Simulation could not be completed.");
      notify(result.error ?? "Simulation could not be completed.", "error");
      return;
    }
    setRunMessage(`Simulation completed · ${framework} · ${shots.toLocaleString()} shots.`);
    notify("Simulation completed. Mock results are ready.", "success");
    navigate("/simulator");
  };

  const askTutor = () => {
    navigate("/tutor", { state: { tutorContext: { source: "circuit", selectedGate: selected ?? undefined, circuitSnapshot: cloneCircuit(circuit), topic: selected ? getGateDefinition(selected.type).description : undefined, returnPath: "/circuit-designer" } } });
  };

  const learnGate = () => {
    if (selected?.type) navigate(`/learn/module/gates/lesson/${getGateDefinition(selected.type).learnLessonId}`);
  };

  const hasUnsupportedCode = codeFramework === "PennyLane" && circuit.gates.some((gate) => gate.type === "MEASURE");
  const codeNote = hasUnsupportedCode ? "Measurement is represented as a mock sample return in PennyLane." : "Code is generated deterministically from the visual circuit and is read-only.";

  return (
    <div className="circuit-designer-page">
      <PageHeader eyebrow="Qubrix workspace" title="Quantum Circuit Designer" description="Visually construct and experiment with quantum circuits, then inspect the framework-specific code that represents your current design." action={<Button onClick={runCircuit} disabled={running}><Play size={15} /> {running ? "Running…" : "Run Circuit"}</Button>} />

      <div className="circuit-toolbar">
        <div className="toolbar-group"><Button variant="secondary" size="sm" onClick={addQubit} disabled={circuit.qubits >= MAX_QUBITS}><Plus size={14} /> Add qubit</Button><Button variant="secondary" size="sm" onClick={removeQubit} disabled={circuit.qubits <= 1}><Minus size={14} /> Remove qubit</Button><Button variant="secondary" size="sm" onClick={clearCircuit}><Trash2 size={14} /> Clear</Button><Button variant="secondary" size="sm" onClick={resetCircuit}><RotateCcw size={14} /> Reset</Button></div>
        <div className="toolbar-group toolbar-right"><Select aria-label="Execution framework" value={framework} onChange={(event) => setFramework(event.target.value as Framework)}>{frameworks.map((item) => <option key={item}>{item}</option>)}</Select><Select aria-label="Number of shots" value={shots} onChange={(event) => setShots(Number(event.target.value))}>{[100, 500, 1000, 5000, 10000].map((value) => <option key={value} value={value}>{value.toLocaleString()} shots</option>)}</Select><Button variant="secondary" size="sm" onClick={saveCircuit}><Save size={14} /> Save Circuit</Button></div>
      </div>

      <CircuitInfo circuit={circuit} framework={framework} />

      <div className="circuit-workspace">
        <GatePalette selectedGate={selectedGateType} onSelect={chooseGate} />
        <CircuitCanvas circuit={circuit} selectedId={selectedGateId} selectedGateType={selectedGateType} pendingCnotControl={pendingCnotControl} onSlotClick={placeOrMove} onGateSelect={selectGate} />
        <Inspector selected={selected} onDelete={deleteSelected} onLearn={learnGate} onTutor={askTutor} />
      </div>

      {runMessage && <Card className={`circuit-run-status ${running ? "is-running" : "is-success"}`}><div><span className="status-dot" /><strong>{runMessage}</strong><span>This is a frontend-only handoff point for the future Simulation Engine.</span></div>{!running && <Button variant="ghost" size="sm" onClick={() => setRunMessage(null)}>Dismiss <X size={13} /></Button>}</Card>}

      <div className="circuit-lower-grid">
        <CodePanel codeFramework={codeFramework} onFrameworkChange={setCodeFramework} code={code} onCopy={() => navigator.clipboard ? navigator.clipboard.writeText(code).then(() => notify("Generated code copied.", "success")).catch(() => notify("Copy is unavailable in this browser.", "error")) : notify("Copy is unavailable in this browser.", "error")} />
        <Card className="circuit-context-card">
          <div className="circuit-panel-header"><div><span className="card-kicker">Learn connection</span><h2>Build with context</h2></div><Layers3 size={18} /></div>
          <p>Gate definitions are shared with the learning curriculum, so the designer can send you back to the existing lesson for the selected operation.</p>
          {selected ? <Button variant="ghost" size="sm" onClick={learnGate}><ExternalLink size={14} /> Learn {getGateDefinition(selected.type).name}</Button> : <span className="muted-small">Select a gate to reveal its lesson link.</span>}
          
        </Card>
      </div>

      <div className="code-note"><Code2 size={14} /><span>{codeNote}</span></div>
      <Presets onLoad={loadPreset} />

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  );
}
