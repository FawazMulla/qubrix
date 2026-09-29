import { ArrowLeft, Clock3, FlaskConical, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, ProgressBar, Select } from "../components/ui";
import { frameworks, type Framework } from "../data/circuitData";
import { frameworkMetadata } from "../services/mockSimulation";
import { useSimulation } from "../context/SimulationContext";

const SHOTS = [100, 500, 1000, 5000, 10000];
const dateLabel = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });

export function Simulator() {
  const navigate = useNavigate();
  const { circuit, framework, shots, status, latestResult, history, savedCircuit, setCircuit, setFramework, setShots, execute, selectResult, loadSavedCircuit } = useSimulation();
  const metadata = frameworkMetadata(framework);
  const running = status === "VALIDATING" || status === "RUNNING";
  const run = async () => {
    const activeCircuit = circuit ?? loadSavedCircuit();
    if (!activeCircuit) return;
    await execute(activeCircuit, framework, shots);
  };
  const explainResult = () => { if (latestResult?.status === "SUCCESS") navigate("/tutor", { state: { tutorContext: { source: "simulation", circuitSnapshot: latestResult.circuitSnapshot, simulationResult: latestResult, returnPath: "/simulator" } } }); };
  const statusLabel = status === "VALIDATING" ? "Validating circuit…" : status === "RUNNING" ? "Running on " + framework + "…" : status === "SUCCESS" ? "Simulation completed" : status === "ERROR" ? "Simulation could not be completed" : "Ready to simulate";

  if (!circuit) return <div className="simulator-page">
    <PageHeader eyebrow="Simulation workspace" title="Simulator" description="Run deterministic frontend-only mock executions across supported quantum frameworks." />
    {savedCircuit ? <EmptyState title="Saved circuit is ready" description="Your saved circuit is available. Load it here or return to the Circuit Designer to edit it." action={<div className="sim-empty-actions"><Button onClick={() => { const loaded = loadSavedCircuit(); if (loaded) setCircuit(loaded); }}><Play size={15} /> Load Saved Circuit</Button><Button variant="secondary" onClick={() => navigate("/circuit-designer")}><ArrowLeft size={15} /> Edit Circuit</Button></div>} /> : <EmptyState title="No circuit ready to simulate" description="Build and save a circuit in the Circuit Designer first. No external simulator or quantum hardware is contacted." action={<Button onClick={() => navigate("/circuit-designer")}><ArrowLeft size={15} /> Open Circuit Designer</Button>} />}
  </div>;

  return <div>
    <PageHeader eyebrow="Simulation workspace" title="Multi-Framework Simulator" description="Run the current circuit through a deterministic mock engine. Results are structured for the next visualization phase." action={<Button onClick={run} disabled={running || !circuit.gates.length}><Play size={15} /> {running ? "Running…" : "Run Circuit"}</Button>} />
    <div className="simulator-notice"><FlaskConical size={16} /><span><strong>Mock execution:</strong> no Qiskit, PennyLane, Cirq, qBraid, cloud service, or quantum hardware is contacted.</span></div>
    {status === "ERROR" && latestResult?.error && <ErrorState title="Simulation error" description={latestResult.error} />}
    <div className="simulator-controls">
      <Card><div className="sim-control-copy"><span className="card-kicker">Framework</span><h2>{framework}</h2><p>{metadata.description}</p></div><Select label="Execution framework" aria-label="Execution framework" value={framework} onChange={e => setFramework(e.target.value as Framework)}>{frameworks.map(f => <option key={f}>{f}</option>)}</Select></Card>
      <Card><div className="sim-control-copy"><span className="card-kicker">Shots</span><h2>{shots.toLocaleString()}</h2><p>Deterministic mock measurement samples.</p></div><Select label="Number of shots" aria-label="Number of shots" value={shots} onChange={e => setShots(Number(e.target.value))}>{SHOTS.map(s => <option key={s} value={s}>{s.toLocaleString()}</option>)}</Select></Card>
    </div>
    <Card className="sim-circuit-summary"><div><span className="card-kicker">Current circuit</span><h2>{circuit.qubits}-qubit circuit</h2><p>{circuit.gates.length} operations · depth {circuit.gates.length ? Math.max(...circuit.gates.map(g => g.column)) + 1 : 0}</p></div><div className="sim-circuit-actions"><Button variant="secondary" size="sm" onClick={() => navigate("/circuit-designer")}><RotateCcw size={14} /> Edit circuit</Button>{latestResult?.status === "SUCCESS" && <><Button size="sm" onClick={() => navigate("/visualizer")}>View Results</Button><Button variant="secondary" size="sm" onClick={explainResult}>Explain This Result</Button></>}</div></Card>
    <Card className="simulation-status-card" aria-live="polite"><div className="simulation-status-main"><Badge tone={status === "SUCCESS" ? "success" : status === "ERROR" ? "danger" : running ? "cyan" : "purple"}>{status}</Badge><div><strong>{statusLabel}</strong><span>{metadata.name} · {metadata.backend} · {shots.toLocaleString()} shots</span></div></div>{running && <ProgressBar value={status === "VALIDATING" ? 28 : 72} label="Mock execution" showValue={false} />}</Card>
    {latestResult?.status === "SUCCESS" && <><div className="simulation-summary-grid">
      <Card><span>Framework</span><strong>{latestResult.framework}</strong><small>{latestResult.backend}</small></Card>
      <Card><span>Status</span><strong>Completed</strong><small>Frontend mock execution</small></Card>
      <Card><span>Qubits</span><strong>{latestResult.qubitCount}</strong><small>{latestResult.gateCount} gates</small></Card>
      <Card><span>Depth</span><strong>{latestResult.depth}</strong><small>{latestResult.shots.toLocaleString()} shots</small></Card>
      <Card><span>Execution time</span><strong>{latestResult.executionTime.toFixed(2)}s</strong><small>Mocked timing</small></Card>
    </div>
    <Card className="measurement-card"><div className="section-header"><h2>Measurement results</h2><Badge tone="neutral">{latestResult.shots.toLocaleString()} shots</Badge></div><div className="measurement-table-wrap"><table><thead><tr><th scope="col">State</th><th scope="col">Count</th><th scope="col">Probability</th></tr></thead><tbody>{Object.entries(latestResult.measurementCounts).map(([state,count]) => <tr key={state}><th scope="row">{state}</th><td>{count.toLocaleString()}</td><td>{(latestResult.probabilities[state] * 100).toFixed(1)}%</td></tr>)}</tbody></table></div></Card>
    <Card className="state-info-card"><div className="section-header"><h2>State information</h2><Badge tone="neutral">Visualizer-ready</Badge></div><div className="state-list">{latestResult.statevector.map(state => <div className="state-row" key={state.basis}><code>|{state.basis}⟩</code><span>Amplitude {state.real.toFixed(3)} + {state.imaginary.toFixed(3)}i</span><strong>{(state.probability * 100).toFixed(1)}%</strong></div>)}</div></Card></>}
    <Card className="history-card"><div className="section-header"><h2>Simulation history</h2><span className="muted-small">Current browser session</span></div>{history.length ? <div className="simulation-history">{history.map(item => <button type="button" className="history-item" key={item.id} onClick={() => { selectResult(item); }}><div><strong>{item.qubitCount}-qubit circuit</strong><span>{item.framework} · {item.shots.toLocaleString()} shots</span></div><div><Badge tone={item.status === "SUCCESS" ? "success" : "danger"}>{item.status}</Badge><small><Clock3 size={12} /> {dateLabel(item.createdAt)}</small></div></button>)}</div> : <div className="history-empty"><Clock3 size={18} /><span>No mock executions yet.</span></div>}</Card>
  </div>;
}
