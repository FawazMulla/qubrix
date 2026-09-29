import { ArrowLeft, ArrowRight, Bot, CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InteractiveExample } from "../components/InteractiveExample";
import { MissingContent } from "../components/learning";
import { Badge, Breadcrumb, Button, Card, PageHeader, ProgressBar, Toast } from "../components/ui";
import { getLesson, getModule, getLessonIndex } from "../mockData";
import { getAssessmentsForModule } from "../data/assessments";
import { useLearning } from "../context/LearningContext";

export function LessonDetail() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isCompleted, completeLesson, completedLessonIds } = useLearning();
  const [toast, setToast] = useState<string | null>(null);

  const module = moduleId ? getModule(moduleId) : undefined;
  const lesson = lessonId ? getLesson(lessonId) : undefined;

  useEffect(() => {
    setToast(null);
  }, [lessonId]);

  if (!module || !lesson || lesson.moduleId !== module.id) {
    return (
      <MissingContent
        title="Lesson not found"
        description="That lesson does not belong to the selected module in the current mock curriculum."
      />
    );
  }

  const index = getLessonIndex(module.id, lesson.id);
  const previous = index > 0 ? module.lessons[index - 1] : undefined;
  const next = index < module.lessons.length - 1 ? module.lessons[index + 1] : undefined;
  const completeCount = module.lessons.filter((item) => completedLessonIds.includes(item.id)).length;
  const lessonProgress = Math.round(
    ((index + (isCompleted(lesson.id) ? 1 : 0)) / module.lessons.length) * 100
  );
  const completed = isCompleted(lesson.id);
  const moduleAssessment = getAssessmentsForModule(module.id)[0];

  const handleNext = () => {
    completeLesson(lesson.id);
    if (next) {
      navigate(`/learn/module/${module.id}/lesson/${next.id}`);
    } else {
      navigate(`/learn/module/${module.id}`);
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Learn", href: "/learn" },
          { label: module.title, href: `/learn/module/${module.id}` },
          { label: lesson.title },
        ]}
      />
      <PageHeader
        eyebrow={`Lesson ${index + 1} of ${module.lessons.length}`}
        title={lesson.title}
        description={lesson.description}
        action={
          <Button
            variant="secondary"
            onClick={() =>
              navigate("/tutor", {
                state: {
                  tutorContext: {
                    source: "lesson",
                    moduleId: module.id,
                    moduleTitle: module.title,
                    lessonId: lesson.id,
                    lessonTitle: lesson.title,
                    topic: lesson.description,
                    lessonContent: lesson,
                    returnPath: `/learn/module/${module.id}/lesson/${lesson.id}`,
                    userProgress: { overallProgress: 0, completedLessonIds },
                  },
                },
              })
            }
          >
            <Bot size={16} /> Ask AI Tutor
          </Button>
        }
      />

      <div className="lesson-progress-strip">
        <div>
          <span>Module progress</span>
          <strong>
            {completeCount} / {module.lessons.length} complete
          </strong>
        </div>
        <ProgressBar value={lessonProgress} label="Lesson position" />
      </div>

      <div className="lesson-layout">
        <main className="lesson-main">
          <Card className="lesson-article">
            <div className="lesson-article-meta">
              <Badge tone="purple">{lesson.difficulty}</Badge>
              <span>
                <Clock3 size={14} /> {lesson.duration}
              </span>
            </div>
            {lesson.sections.map((section) => (
              <section key={section.heading} className="lesson-section">
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}

            {lesson.circuit && (
              <div className="circuit-example">
                <div className="card-kicker">Circuit example</div>
                <pre>{lesson.circuit.join("\n")}</pre>
                <span>Conceptual circuit notation · no quantum execution is performed here.</span>
              </div>
            )}

            <InteractiveExample example={lesson.example} />

            <section className="key-takeaways">
              <div className="card-kicker">Key takeaways</div>
              <h2>What to remember</h2>
              <ul>
                {lesson.takeaways.map((takeaway) => (
                  <li key={takeaway}>
                    <CheckCircle2 size={16} />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </section>

            {moduleAssessment && (
              <section className="lesson-knowledge-check">
                <div>
                  <Badge tone="cyan">Knowledge Check</Badge>
                  <h2>Test your understanding</h2>
                  <p>
                    Apply this lesson’s ideas in the {moduleAssessment.title} checkpoint. You can
                    submit answers for feedback and review them with the AI Tutor.
                  </p>
                </div>
                <Link className="btn btn-secondary" to={`/assessments/${moduleAssessment.id}`}>
                  Open Knowledge Check <ArrowRight size={14} />
                </Link>
              </section>
            )}
          </Card>

          <nav className="lesson-navigation" aria-label="Lesson navigation">
            {previous ? (
              <Link
                className="btn btn-secondary"
                to={`/learn/module/${module.id}/lesson/${previous.id}`}
              >
                <ArrowLeft size={15} /> Previous lesson
              </Link>
            ) : (
              <span />
            )}

            <Button variant="primary" onClick={handleNext}>
              {next ? "Next lesson" : "Complete & Back to Module"} <ArrowRight size={15} />
            </Button>
          </nav>
        </main>

        <aside className="lesson-sidebar">
          <Card className="lesson-context-card">
            <span className="card-kicker">You are learning</span>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <Link to={`/learn/module/${module.id}`}>View module</Link>
            {lesson.circuit && (
              <Link className="btn btn-secondary btn-sm" to="/circuit-designer">
                Open Circuit Designer
              </Link>
            )}
          </Card>
          <Card className="lesson-tutor-card">
            <Bot size={19} />
            <span className="card-kicker">Need a hint?</span>
            <h3>Ask about {lesson.title}</h3>
            <p>The tutor will use this module and lesson context when answering.</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate("/tutor", {
                  state: {
                    tutorContext: {
                      source: "lesson",
                      moduleId: module.id,
                      moduleTitle: module.title,
                      lessonId: lesson.id,
                      lessonTitle: lesson.title,
                      topic: lesson.description,
                      lessonContent: lesson,
                      returnPath: `/learn/module/${module.id}/lesson/${lesson.id}`,
                      userProgress: { overallProgress: 0, completedLessonIds },
                    },
                  },
                })
              }
            >
              Ask AI Tutor
            </Button>
          </Card>
        </aside>
      </div>

      {toast && <Toast message={toast} tone={completed ? "neutral" : "success"} />}
    </div>
  );
}