import { BookOpen, Clock3, Layers3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContinueLearningCard, CurriculumCard } from "../components/learning";
import { Badge, Card, EmptyState, PageHeader, ProgressBar, SectionHeader } from "../components/ui";
import { learningModules } from "../mockData";
import { useLearning } from "../context/LearningContext";
import { assessments } from "../data/assessments";
import { useAssessments } from "../context/AssessmentContext";

export function Learn() {
  const navigate = useNavigate();
  const { overallProgress, moduleProgress, continueLesson } = useLearning();
  const { getSummary } = useAssessments();

  if (!learningModules.length) {
    return <EmptyState title="No curriculum available" description="The mock curriculum is currently empty. Add a module to begin learning." />;
  }

  const activeModule = learningModules.find((module) => module.id === continueLesson.moduleId) ?? learningModules[0];

  return (
    <div>
      <PageHeader
        eyebrow="Learning hub"
        title="Learn quantum computing"
        description="Build your intuition in small steps, from qubits and measurement to gates, concepts, and foundational algorithms."
        action={<button className="btn btn-secondary" onClick={() => navigate(`/learn/module/${activeModule.id}`)}><Layers3 size={16} /> View active module</button>}
      />

      <section className="learning-overview-grid">
        <Card className="learning-overview-card">
          <div className="learning-overview-icon"><BookOpen size={20} /></div>
          <div><span className="card-kicker">Overall curriculum</span><strong>{overallProgress}%</strong><p>Across {learningModules.length} learning modules and {learningModules.reduce((sum, module) => sum + module.lessons.length, 0)} concise lessons.</p></div>
          <ProgressBar value={overallProgress} label="Curriculum completion" />
        </Card>
        <Card className="learning-overview-card">
          <div className="learning-overview-icon cyan"><Clock3 size={20} /></div>
          <div><span className="card-kicker">Estimated pathway</span><strong>~2h 45m</strong><p>Short, focused lessons designed for a first pass through quantum fundamentals.</p></div>
          <div className="overview-tags"><Badge tone="purple">Beginner friendly</Badge><Badge tone="cyan">Interactive</Badge></div>
        </Card>
      </section>

      <ContinueLearningCard />

      <section className="learning-assessment-strip">
        <SectionHeader title="Assessment progress" action={<button className="text-button" onClick={() => navigate("/assessments")}>View assessments <span aria-hidden="true">→</span></button>} />
        <div className="learning-assessment-grid">{assessments.map((assessment) => { const summary = getSummary(assessment.id); return <Card key={assessment.id} className="learning-assessment-card"><div className="learning-assessment-top"><Badge tone="purple">{assessment.title}</Badge><span className={summary.latest ? "learning-assessment-score" : "learning-assessment-score is-muted"}>{summary.latest ? `${summary.latest.percentage}%` : "Not started"}</span></div><ProgressBar value={summary.latest?.percentage ?? 0} label={summary.latest ? "Latest score" : "Assessment readiness"} /><p>{summary.latest ? (summary.latest.passed ? "Passed — review or continue learning." : "Review the related lessons and try again.") : "Ready when you are."}</p></Card>; })}</div>
      </section>

      <section className="curriculum-section">
        <SectionHeader title="Curriculum" action={<span className="muted-small">{moduleProgress.reduce((sum, item) => sum + item.completed, 0)} lessons complete</span>} />
        <div className="curriculum-grid">
          {learningModules.map((module) => <CurriculumCard key={module.id} module={module} />)}
        </div>
      </section>

      <section className="learning-path-note">
        <Badge tone="neutral">Learning path</Badge>
        <p>Start with Fundamentals, then use Gates to understand circuit operations before moving into Concepts and Algorithms. Each module can also be revisited independently.</p>
      </section>
    </div>
  );
}