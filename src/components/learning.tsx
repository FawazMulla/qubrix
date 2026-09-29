import { CheckCircle2, Clock3, LockKeyhole, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, ProgressBar, SectionHeader } from "./ui";
import type { LearningModule, Lesson } from "../types";
import { getModule } from "../mockData";
import { useLearning } from "../context/LearningContext";

function statusLabel(status: "not-started" | "in-progress" | "completed") {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In progress";
  return "Not started";
}

export function CurriculumCard({ module }: { module: LearningModule }) {
  const { moduleProgress } = useLearning();
  const progress = moduleProgress.find((item) => item.name === module.title);
  const completed = progress?.completed ?? 0;
  const percent = progress ? Math.round((completed / progress.total) * 100) : 0;
  const status = percent === 100 ? "completed" : percent > 0 ? "in-progress" : "not-started";

  return (
    <Card className="curriculum-card">
      <div className="curriculum-card-top">
        <span className="module-number">0{module.number}</span>
        <Badge tone={status === "completed" ? "success" : status === "in-progress" ? "purple" : "neutral"}>{statusLabel(status)}</Badge>
      </div>
      <div className="curriculum-copy">
        <span className="card-kicker">Module {module.number}</span>
        <h2>{module.title}</h2>
        <p>{module.description}</p>
      </div>
      <div className="curriculum-meta">
        <span><Clock3 size={14} /> {module.estimatedTime}</span>
        <span>{module.lessons.length} lessons</span>
      </div>
      <ProgressBar value={percent} label="Module progress" />
      <div className="curriculum-footer">
        <span className="completion-copy">{completed} of {module.lessons.length} lessons complete</span>
        <Link className="btn btn-sm btn-primary" to={`/learn/module/${module.id}`}>{status === "not-started" ? "Start module" : status === "completed" ? "Review module" : "Continue"} <Play size={13} /></Link>
      </div>
    </Card>
  );
}

export function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const { isCompleted, completedLessonIds } = useLearning();
  const completed = isCompleted(lesson.id);
  const module = getModule(lesson.moduleId);
  const firstIncompleteId = module?.lessons.find((item) => !completedLessonIds.includes(item.id))?.id;
  const status = completed ? "completed" : lesson.id === firstIncompleteId ? "in-progress" : "not-started";

  return (
    <div className={`lesson-list-item ${completed ? "lesson-complete" : ""}`}>
      <div className="lesson-status-icon" aria-hidden="true">
        {completed ? <CheckCircle2 size={17} /> : status === "in-progress" ? <Play size={15} /> : <span>{index + 1}</span>}
      </div>
      <div className="lesson-list-copy">
        <div className="lesson-list-top">
          <Badge tone={completed ? "success" : status === "in-progress" ? "purple" : "neutral"}>{statusLabel(completed ? "completed" : status)}</Badge>
          <span>{lesson.difficulty}</span><span>·</span><span>{lesson.duration}</span>
        </div>
        <h3>{lesson.title}</h3>
        <p>{lesson.description}</p>
      </div>
      <Link className="btn btn-sm btn-secondary" to={`/learn/module/${lesson.moduleId}/lesson/${lesson.id}`}>{completed ? "Review" : status === "in-progress" ? "Continue" : "Start"} <Play size={13} /></Link>
    </div>
  );
}

export function LearningObjectiveList({ objectives }: { objectives: string[] }) {
  return <ul className="objective-list">{objectives.map((objective) => <li key={objective}><CheckCircle2 size={16} /><span>{objective}</span></li>)}</ul>;
}

export function ContinueLearningCard() {
  const { continueLesson, isCompleted, moduleProgress } = useLearning();
  const module = getModule(continueLesson.moduleId);
  const progress = moduleProgress.find((item) => item.name === module?.title);
  const modulePercent = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
  return (
    <Card className="continue-learning-card">
      <div className="continue-icon"><Sparkles size={19} /></div>
      <div className="continue-copy">
        <Badge tone="cyan">Continue learning</Badge>
        <h2>{continueLesson.title}</h2>
        <p>Pick up where your curriculum progress is currently pointing. {continueLesson.description}</p>
        <ProgressBar value={modulePercent} label="Module progress" />
        <div className="continue-meta"><span>{isCompleted(continueLesson.id) ? "All lessons complete" : continueLesson.duration}</span><span>·</span><span>{continueLesson.difficulty}</span></div>
      </div>
      <Link className="btn btn-primary" to={`/learn/module/${continueLesson.moduleId}/lesson/${continueLesson.id}`}>{isCompleted(continueLesson.id) ? "Review lesson" : "Continue"} <Play size={14} /></Link>
    </Card>
  );
}

export function ModuleProgressSummary({ module }: { module: LearningModule }) {
  const { moduleProgress } = useLearning();
  const progress = moduleProgress.find((item) => item.name === module.title);
  const percent = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
  return <Card className="module-progress-summary"><div><span className="card-kicker">Your progress</span><strong>{percent}%</strong><span>{progress?.completed ?? 0} / {progress?.total ?? module.lessons.length} lessons</span></div><ProgressBar value={percent} label="Module completion" /></Card>;
}

export function LessonList({ module }: { module: LearningModule }) {
  return <section className="lesson-list-section"><SectionHeader title="Lessons" action={<span className="muted-small">{module.lessons.length} lessons · {module.estimatedTime}</span>} /><Card className="lesson-list-card">{module.lessons.map((lesson, index) => <LessonCard key={lesson.id} lesson={lesson} index={index} />)}</Card></section>;
}

export function MissingContent({ title = "Learning content unavailable", description = "This lesson is not available in the current mock curriculum." }: { title?: string; description?: string }) {
  return <Card className="learning-state-card"><LockKeyhole size={22} /><h2>{title}</h2><p>{description}</p><Link className="btn btn-secondary" to="/learn">Back to curriculum</Link></Card>;
}