import { ArrowRight, CheckCircle2, CircleAlert, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Progress.css";
import { Badge, Card, PageHeader, ProgressBar, SectionHeader } from "../components/ui";
import { assessments } from "../data/assessments";
import { getModule } from "../mockData";
import { useLearning } from "../context/LearningContext";
import { useAssessments } from "../context/AssessmentContext";

export function Progress() {
  const navigate = useNavigate();
  const { overallProgress, completedLessonIds, moduleProgress, continueLesson } = useLearning();
  const { getSummary } = useAssessments();
  const completedAssessments = assessments.filter((assessment) => getSummary(assessment.id).latest).length;
  const passedAssessments = assessments.filter((assessment) => getSummary(assessment.id).latest?.passed).length;

  return <div className="progress-page">
    <PageHeader eyebrow="Learner progress" title="Your progress" description="Track lessons, assessment checkpoints, module completion, and the next place to continue learning." action={<button className="btn btn-primary" onClick={() => navigate("/learn/module/" + continueLesson.moduleId + "/lesson/" + continueLesson.id)}>Continue Learning <ArrowRight size={15} /></button>} />
    <section className="progress-overview-grid">
      <Card><span className="card-kicker">Overall curriculum</span><strong className="progress-big">{overallProgress}%</strong><ProgressBar value={overallProgress} label="Lesson completion" /><p>{completedLessonIds.length} lessons complete across the curriculum.</p></Card>
      <Card><span className="card-kicker">Assessments</span><strong className="progress-big">{passedAssessments}/{assessments.length}</strong><ProgressBar value={assessments.length ? (passedAssessments / assessments.length) * 100 : 0} label="Passed checkpoints" /><p>{completedAssessments} assessment{completedAssessments === 1 ? "" : "s"} submitted.</p></Card>
    </section>
    <SectionHeader title="Module progress" />
    <div className="progress-module-grid">{moduleProgress.map((item) => { const module = getModuleByName(item.name); const assessment = assessments.find((candidate) => candidate.moduleId === module?.id); const summary = assessment ? getSummary(assessment.id) : null; const lessonPercent = item.total ? Math.round((item.completed / item.total) * 100) : 0; return <Card key={item.name} className="progress-module-card"><div className="progress-module-top"><div><span className="card-kicker">{module ? "Module " + module.number : "Module"}</span><h3>{item.name}</h3></div><strong>{lessonPercent}%</strong></div><ProgressBar value={lessonPercent} label="Lesson completion" /><div className="progress-assessment-mini"><Target size={15} /><span>Assessment</span><strong>{summary?.latest ? summary.latest.percentage + "%" : "Not started"}</strong><Badge tone={summary?.latest?.passed ? "success" : summary?.latest ? "danger" : "neutral"}>{summary?.latest ? (summary.latest.passed ? "Passed" : "Review") : "Pending"}</Badge></div>{assessment && <button className="text-button" onClick={() => navigate("/assessments/" + assessment.id)}>Open assessment <ArrowRight size={14} /></button>}</Card>; })}</div>
    <SectionHeader title="Assessment history" />
    <Card className="progress-history">{assessments.map((assessment) => { const summary = getSummary(assessment.id); return <div className="progress-history-row" key={assessment.id}><div><strong>{assessment.title}</strong><span>{getModule(assessment.moduleId)?.title}</span></div>{summary.latest ? <><span>{summary.latest.correctCount}/{summary.latest.totalQuestions} correct</span><Badge tone={summary.latest.passed ? "success" : "danger"}>{summary.latest.percentage}% · {summary.latest.passed ? "Passed" : "Review"}</Badge><span>Attempt {summary.latest.attemptNumber}</span></> : <span className="muted-small">Not started</span>}</div>; })}</Card>
    <Card className="progress-next-card">{overallProgress >= 100 ? <><CheckCircle2 size={20} /><div><strong>Curriculum lessons complete</strong><p>Use assessments to reinforce concepts or revisit any module.</p></div></> : <><CircleAlert size={20} /><div><strong>Next up: {continueLesson.title}</strong><p>Continue the curriculum, then use the module checkpoint to test your understanding.</p></div><button className="btn btn-secondary" onClick={() => navigate("/learn/module/" + continueLesson.moduleId + "/lesson/" + continueLesson.id)}>Open lesson</button></>}</Card>
  </div>;
}

function getModuleByName(name: string) {
  const modules = ["fundamentals", "gates", "concepts", "algorithms"].map((id) => getModule(id));
  return modules.find((module) => module?.title === name);
}
