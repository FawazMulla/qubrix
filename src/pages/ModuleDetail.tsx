import { ArrowLeft, BookOpen, CheckCircle2, Clock3 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LearningObjectiveList, LessonList, MissingContent, ModuleProgressSummary } from "../components/learning";
import { Badge, Breadcrumb, Button, PageHeader } from "../components/ui";
import { getModule } from "../mockData";
import { getAssessmentsForModule } from "../data/assessments";
import { useAssessments } from "../context/AssessmentContext";
import { useLearning } from "../context/LearningContext";

export function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { moduleProgress, isCompleted } = useLearning();
  const { getSummary } = useAssessments();
  const module = moduleId ? getModule(moduleId) : undefined;

  if (!module) return <MissingContent title="Module not found" description="That module does not exist in the current Qubrix curriculum." />;

  const progress = moduleProgress.find((item) => item.name === module.title);
  const completed = progress?.completed ?? 0;
  const percent = progress ? Math.round((completed / progress.total) * 100) : 0;
  const firstIncomplete = module.lessons.find((lesson) => !isCompleted(lesson.id)) ?? module.lessons[0];

  return (
    <div>
      <Breadcrumb items={[{ label: "Learn", href: "/learn" }, { label: module.title }]} />
      <PageHeader
        eyebrow={`Module 0${module.number}`}
        title={module.title}
        description={module.description}
        action={
          <Button onClick={() => navigate(`/learn/module/${module.id}/lesson/${firstIncomplete.id}`)}>
            {percent === 100 ? "Review module" : completed > 0 ? "Continue module" : "Start module"}
          </Button>
        }
      />

      <section className="module-detail-hero">
        <ModuleProgressSummary module={module} />
        <div className="module-detail-meta">
          <div><BookOpen size={16} /><span>{module.lessons.length} lessons</span></div>
          <div><Clock3 size={16} /><span>{module.estimatedTime}</span></div>
          <div><CheckCircle2 size={16} /><span>{completed} completed</span></div>
        </div>
      </section>

      <section className="module-objectives">
        <div className="module-objectives-copy">
          <Badge tone="purple">Learning objectives</Badge>
          <h2>What you’ll understand</h2>
          <p>Use these objectives as a checklist while working through the lessons.</p>
        </div>
        <LearningObjectiveList objectives={module.objectives} />
      </section>

      <LessonList module={module} />

      {getAssessmentsForModule(module.id).map((assessment) => { const summary = getSummary(assessment.id); return <section className="module-assessment-section" key={assessment.id}><div className="module-assessment-copy"><Badge tone="purple">Module assessment</Badge><h2>{assessment.title}</h2><p>{assessment.description}</p></div><div className="module-assessment-status"><strong>{summary.latest ? `${summary.latest.percentage}%` : "Not started"}</strong><span>{summary.latest ? (summary.latest.passed ? "Passed" : "Needs review") : `${assessment.questions.length} questions · Pass ${assessment.passingScore}%`}</span><Button variant={summary.latest?.passed ? "secondary" : "primary"} onClick={() => navigate(`/assessments/${assessment.id}`)}>{summary.latest ? "Review Assessment" : "Start Assessment"}</Button></div></section>; })}

      {percent === 100 && (
        <div className="module-complete-banner">
          <CheckCircle2 size={19} />
          <div><strong>Module complete</strong><span>You’ve completed every lesson in this learning area. Revisit any lesson to reinforce the concepts.</span></div>
          <Link className="btn btn-secondary" to="/learn">Back to curriculum <ArrowLeft size={14} /></Link>
        </div>
      )}
    </div>
  );
}