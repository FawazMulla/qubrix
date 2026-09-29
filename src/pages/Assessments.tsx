import "./Assessments.css";
import { ArrowRight, CheckCircle2, Clock3, FileCode2, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, Card, EmptyState, PageHeader, ProgressBar, SectionHeader } from "../components/ui";
import { assessments } from "../data/assessments";
import { getModule } from "../mockData";
import { useAssessments } from "../context/AssessmentContext";

export function Assessments() {
  const navigate = useNavigate();
  const { getSummary, canAttempt } = useAssessments();

  if (!assessments.length) return <EmptyState title="No assessments available" description="There are no assessment checkpoints in the current curriculum." />;

  return <div className="assessment-page">
    <PageHeader eyebrow="Knowledge checks" title="Assessments" description="Check your quantum computing understanding, review feedback, and continue through the curriculum." />
    <section className="assessment-overview-grid">
      <Card className="assessment-overview-card"><div className="assessment-overview-icon"><Target size={19} /></div><div><span className="card-kicker">Learning loop</span><h2>Learn → Practice → Assess</h2><p>Objective questions are graded locally in the browser. Results are mock learner data.</p></div></Card>
      <Card className="assessment-overview-card"><div className="assessment-overview-icon cyan"><FileCode2 size={19} /></div><div><span className="card-kicker">Coding challenge</span><h2>Practice circuit code</h2><p>Try a Qiskit-style task with simulated grading. No code is executed.</p></div></Card>
    </section>
    <SectionHeader title="Curriculum checkpoints" action={<span className="muted-small">{assessments.length} assessments</span>} />
    <div className="assessment-list">
      {assessments.map((assessment) => {
        const summary = getSummary(assessment.id);
        const module = getModule(assessment.moduleId);
        const hasResult = Boolean(summary.latest);
        return <Card className="assessment-list-card" key={assessment.id}>
          <div className="assessment-list-top"><Badge tone="purple">{module?.title ?? "Curriculum"}</Badge><Badge tone={summary.latest?.passed ? "success" : hasResult ? "danger" : "neutral"}>{summary.latest ? (summary.latest.passed ? "Passed" : "Needs review") : "Not started"}</Badge></div>
          <h2>{assessment.title}</h2><p>{assessment.description}</p>
          <div className="assessment-meta"><span><Target size={14} /> {assessment.questions.length} questions</span><span><Clock3 size={14} /> {assessment.estimatedDuration}</span><span>Pass: {assessment.passingScore}%</span></div>
          {summary.latest && <div className="assessment-score-row"><div><strong>{summary.best?.percentage}%</strong><span>best score</span></div><div><strong>{summary.latest.percentage}%</strong><span>latest</span></div><div><strong>{summary.attemptCount}</strong><span>attempt{summary.attemptCount === 1 ? "" : "s"}</span></div></div>}
          <ProgressBar value={summary.latest?.percentage ?? 0} label={summary.latest ? "Latest assessment score" : "Assessment readiness"} />
          <div className="assessment-card-actions"><button className="btn btn-primary" onClick={() => navigate("/assessments/" + assessment.id)}>{hasResult ? "Review assessment" : "Start assessment"} <ArrowRight size={14} /></button>{hasResult && canAttempt(assessment.id) && <button className="btn btn-secondary" onClick={() => navigate("/assessments/" + assessment.id + "?retake=1")}>Retake</button>}</div>
          {assessment.questions.some((question) => question.type === "coding") && <span className="assessment-coding-note"><FileCode2 size={14} /> Includes a simulated coding challenge</span>}
          {summary.latest?.passed && <span className="assessment-complete-note"><CheckCircle2 size={14} /> Passing score reached</span>}
        </Card>;
      })}
    </div>
  </div>;
}
