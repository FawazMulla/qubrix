import { useMemo, useState } from "react";
import { ArrowLeft, Clock3, ExternalLink, FlaskConical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./Visualizer.css";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader } from "../components/ui";
import { useSimulation } from "../context/SimulationContext";
import {
  circuitName,
  CircuitResultView,
  BlochSphere,
  Interpretation,
  MeasurementHistogram,
  StatevectorViewer,
  VisualizationTabs,
} from "../components/visualization";
import type { SimulationResult } from "../services/mockSimulation";

const dateLabel = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function ResultHistory({
  results,
  selected,
  onSelect,
}: {
  results: SimulationResult[];
  selected: SimulationResult | null;
  onSelect: (result: SimulationResult) => void;
}) {
  const navigate = useNavigate();
  return (
    <Card className="visualizer-history">
      <div className="section-header">
        <div>
          <h2>Recent simulations</h2>
          <span className="muted-small">Current browser session</span>
        </div>
        <Badge tone="neutral">{results.length}</Badge>
      </div>
      {results.length ? (
        <div className="visualizer-history-list">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              className={`visualizer-history-item ${selected?.id === result.id ? "is-selected" : ""}`}
              onClick={() => onSelect(result)}
            >
              <div>
                <strong>{circuitName(result.circuitSnapshot)}</strong>
                <span>
                  {result.framework} · {result.qubitCount} qubits · {result.shots.toLocaleString()} shots
                </span>
              </div>
              <div>
                <Badge tone={result.status === "SUCCESS" ? "success" : "danger"}>
                  {result.status}
                </Badge>
                <small>
                  <Clock3 size={12} /> {dateLabel(result.createdAt)}
                </small>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="visualizer-history-empty">
          <span>No simulation results yet.</span>
          <Link className="btn btn-primary btn-sm" to="/circuit-designer">
            Open Circuit Designer
          </Link>
        </div>
      )}
    </Card>
  );
}

function Summary({ result }: { result: SimulationResult }) {
  const fields = [
    ["Framework", result.framework],
    ["Backend / device", result.backend],
    ["Status", result.status],
    ["Qubits", String(result.qubitCount)],
    ["Gates", String(result.gateCount)],
    ["Circuit depth", String(result.depth)],
    ["Shots", result.shots.toLocaleString()],
    ["Execution time", `${result.executionTime.toFixed(2)}s`],
    ["Timestamp", dateLabel(result.createdAt)],
  ];
  return (
    <Card className="visualizer-summary">
      <div className="section-header">
        <div>
          <span className="card-kicker">Simulation summary</span>
          <h2>{circuitName(result.circuitSnapshot)}</h2>
        </div>
        <Badge tone="purple">Mock Simulation Result</Badge>
      </div>
      <div className="visualizer-summary-grid">
        {fields.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function Visualizer() {
  const navigate = useNavigate();
  const { history, selectedResult, latestResult, selectResult } = useSimulation();
  const result = selectedResult ?? latestResult;
  const explainVisualization = () => {
    if (result?.status === "SUCCESS")
      navigate("/tutor", {
        state: {
          tutorContext: {
            source: "visualization",
            visualization:
              tab === "overview"
                ? "histogram"
                : (tab as "histogram" | "statevector" | "bloch" | "circuit"),
            circuitSnapshot: result.circuitSnapshot,
            simulationResult: result,
            returnPath: "/visualizer",
          },
        },
      });
  };
  const [tab, setTab] = useState("overview");
  const hasResult = result?.status === "SUCCESS";
  const resultNotice = useMemo(
    () =>
      result?.status === "ERROR"
        ? result.error ?? "This simulation did not produce visualization data."
        : null,
    [result]
  );

  if (!result || !hasResult)
    return (
      <div className="visualizer-page">
        <PageHeader
          eyebrow="Quantum state exploration"
          title="Quantum State & Result Visualizer"
          description="Explore the state and measurement results produced by your quantum circuit."
        />
        {resultNotice && (
          <ErrorState title="Simulation result unavailable" description={resultNotice} />
        )}
        <EmptyState
          title="No simulation results yet"
          description="Run a circuit in the Simulator, then return here to inspect measurements, statevector data, the Bloch sphere, and the executed circuit."
          action={
            <Link className="btn btn-primary" to="/circuit-designer">
              <ArrowLeft size={15} /> Open Circuit Designer
            </Link>
          }
        />
        <ResultHistory results={history} selected={result} onSelect={selectResult} />
      </div>
    );

  const measurements = <MeasurementHistogram result={result} />;
  const statevector = <StatevectorViewer result={result} />;
  const bloch = <BlochSphere result={result} />;
  const circuit = <CircuitResultView result={result} />;
  return (
    <div className="visualizer-page">
      <PageHeader
        eyebrow="Quantum state exploration"
        title="Quantum State & Result Visualizer"
        description="Explore the state and measurement results produced by your quantum circuit."
        action={
          <div className="sim-circuit-actions">
            <Button variant="secondary" onClick={explainVisualization}>
              Explain This Visualization
            </Button>
            <Button variant="ghost" onClick={() => navigate("/simulator")}>
              <ExternalLink size={15} /> Back to Simulator
            </Button>
          </div>
        }
      />
      <div className="visualizer-notice">
        <FlaskConical size={16} />
        <span>
          <strong>Mock Simulation Result:</strong> this visualization consumes the selected
          SimulationResult only. No quantum API, cloud service, or hardware is contacted.
        </span>
      </div>
      <ResultHistory results={history} selected={result} onSelect={selectResult} />
      <Summary result={result} />
      <div className="visualizer-tabs">
        <VisualizationTabs value={tab} onChange={setTab} />
      </div>
      {tab === "overview" && (
        <div className="visualizer-overview">
          {measurements}
          {statevector}
          {circuit}
          <Interpretation result={result} />
        </div>
      )}
      {tab === "measurements" && <div className="visualizer-single">{measurements}</div>}
      {tab === "statevector" && <div className="visualizer-single">{statevector}</div>}
      {tab === "bloch" && <div className="visualizer-single">{bloch}</div>}
      {tab === "circuit" && <div className="visualizer-single">{circuit}</div>}
      <div className="visualizer-secondary-grid">{tab === "overview" && bloch}</div>
      {tab !== "overview" && <Interpretation result={result} />}
    </div>
  );
}
