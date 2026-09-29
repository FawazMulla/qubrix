import "./Assessments.css";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, CircleAlert, FileCode2, RotateCcw } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Breadcrumb, Button, Card, EmptyState, PageHeader, ProgressBar } from "../components/ui";
import { getAssessment } from "../data/assessments";
import { getLesson, getModule } from "../mockData";
import { useAssessments } from "../context/AssessmentContext";
import { useLearning } from "../context/LearningContext";
import type { Assessment, AssessmentAttemptSummary, AssessmentQuestion } from "../types/assessment";

export function AssessmentDetail() {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { active, startAssessment, setAnswer, setQuestionIndex, submitQuestion, submitAssessment, resetAssessment, getSummary, canAttempt, results } = useAssessments();
  const { continueLesson } = useLearning();
  const assessment = assessmentId ? getAssessment(assessmentId) : undefined;
  const [reviewOpen, setReviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessment && new URLSearchParams(location.search).get("retake") === "1" && canAttempt(assessment.id)) {
      startAssessment(assessment.id);
      navigate("/assessments/" + assessment.id, { replace: true });
    }
  }, [assessment, canAttempt, location.search, navigate, startAssessment]);

  if (!assessment) return <EmptyState title="Assessment not found" description="That assessment is not available in the current Qubrix curriculum." action={<Link className="btn btn-secondary" to="/assessments">Back to assessments</Link>} />;

  const summary = getSummary(assessment.id);
  const isActive = active?.assessmentId === assessment.id;
  const module = getModule(assessment.moduleId);

  if (!isActive && summary.latest) {
    return <AssessmentResults assessment={assessment} summary={summary} results={results.filter((item) => item.assessmentId === assessment.id)} reviewOpen={reviewOpen} setReviewOpen={setReviewOpen} onRetake={() => { if (resetAssessment(assessment.id)) setReviewOpen(false); }} onContinue={() => navigate("/learn/module/" + continueLesson.moduleId + "/lesson/" + continueLesson.id)} onReviewLessons={() => navigate("/learn/module/" + assessment.moduleId)} />;
  }

  if (!isActive) return <div className="assessment-detail-page">
    <Breadcrumb items={[{ label: "Assessments", href: "/assessments" }, { label: assessment.title }]} />
    <PageHeader eyebrow={module?.title ?? "Assessment"} title={assessment.title} description={assessment.description} />
    <Card className="assessment-start-card">
      <div className="assessment-start-icon"><span className="assessment-target-glyph">◎</span></div>
      <div><Badge tone="purple">Ready to begin</Badge><h2>Show what you know</h2><p>{assessment.questions.length} questions · {assessment.estimatedDuration} · Passing score {assessment.passingScore}%.</p><ul><li>Navigate without losing selected answers.</li><li>Submit each answer for educational feedback.</li><li>Review incorrect answers after submission.</li><li>{assessment.attemptsAllowed === null ? "Unlimited attempts." : assessment.attemptsAllowed + " attempts allowed."}</li></ul></div>
      <Button disabled={!canAttempt(assessment.id)} onClick={() => { setError(null); startAssessment(assessment.id); }}>{canAttempt(assessment.id) ? "Start assessment" : "Attempt limit reached"} <ArrowRight size={15} /></Button>
    </Card>
  </div>;

  const question = assessment.questions[active.currentQuestionIndex];
  if (!question) return <EmptyState title="Question unavailable" description="This assessment question is missing from the mock data." action={<Link className="btn btn-secondary" to="/assessments">Back to assessments</Link>} />;

  const answer = active.answers[question.id];
  const feedback = active.questionFeedback[question.id];
  const isLast = active.currentQuestionIndex === assessment.questions.length - 1;
  const allAnswered = assessment.questions.every((item) => {
    const value = active.answers[item.id];
    return value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
  });

  const selectOption = (id: string) => {
    if (feedback) return;
    if (question.type === "multiple-select") {
      const current = Array.isArray(answer) ? answer : [];
      setAnswer(question.id, current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    } else setAnswer(question.id, id);
  };

  const submitCurrent = () => {
    if (feedback) return;
    const result = submitQuestion(assessment.id, question.id);
    if (!result) setError("Select or enter an answer before submitting.");
    else setError(null);
  };

  const tutor = () => navigate("/tutor", { state: { tutorContext: {
    source: "assessment", assessmentId: assessment.id, assessmentTitle: assessment.title, questionId: question.id,
    question: question.question, learnerAnswer: answer, correctAnswer: question.correctAnswer, explanation: question.explanation,
    moduleId: assessment.moduleId, moduleTitle: module?.title, lessonId: question.lessonId,
    lessonTitle: question.lessonId ? getLesson(question.lessonId)?.title : undefined, topic: question.relatedConcept,
    returnPath: "/assessments/" + assessment.id
  } } });

  return <div className="assessment-detail-page">
    <Breadcrumb items={[{ label: "Assessments", href: "/assessments" }, { label: assessment.title }]} />
    <PageHeader eyebrow={module?.title ?? "Assessment"} title={assessment.title} description={assessment.description} action={<Button variant="ghost" onClick={() => navigate("/assessments")}><ArrowLeft size={15} /> Exit</Button>} />
    <div className="assessment-workspace">
      <aside className="assessment-question-nav" aria-label="Assessment questions">
        <div className="assessment-nav-header"><span className="card-kicker">Progress</span><strong>{active.currentQuestionIndex + 1} / {assessment.questions.length}</strong></div>
        <ProgressBar value={((active.currentQuestionIndex + 1) / assessment.questions.length) * 100} label="Question progress" />
        <div className="assessment-question-grid">{assessment.questions.map((item, index) => <button type="button" key={item.id} className={"assessment-question-dot " + (index === active.currentQuestionIndex ? "active " : "") + (active.submittedQuestions.includes(item.id) ? "answered" : "")} aria-label={"Question " + (index + 1)} onClick={() => setQuestionIndex(index)}>{index + 1}</button>)}</div>
        <div className="assessment-nav-note"><span>Passing score</span><strong>{assessment.passingScore}%</strong></div>
      </aside>

      <main className="assessment-question-panel">
        <Card className="assessment-question-card">
          <div className="assessment-question-top"><div><Badge tone={question.type === "coding" ? "cyan" : "purple"}>{question.type === "multiple-select" ? "Select all that apply" : question.type === "coding" ? "Coding challenge" : question.type === "true-false" ? "True / False" : "Multiple choice"}</Badge><span>{question.difficulty} · {question.relatedConcept}</span></div><span className="assessment-question-number">Question {active.currentQuestionIndex + 1} of {assessment.questions.length}</span></div>
          <h2>{question.question}</h2>

          {question.type === "coding" ? <CodingAnswer question={question} answer={answer} disabled={Boolean(feedback)} onChange={(value) => setAnswer(question.id, value)} /> : <div className="assessment-options" role={question.type === "multiple-select" ? "group" : "radiogroup"} aria-label={question.type === "multiple-select" ? "Select all that apply" : "Answer choices"}>
            {question.options?.map((option) => {
              const selected = Array.isArray(answer) ? answer.includes(option.id) : answer === option.id;
              const correct = Boolean(feedback) && (Array.isArray(question.correctAnswer) ? question.correctAnswer.includes(option.id) : question.correctAnswer === option.id);
              const incorrect = Boolean(feedback) && selected && !correct;
              return <button type="button" key={option.id} className={"assessment-option " + (selected ? "selected " : "") + (correct ? "correct " : "") + (incorrect ? "incorrect" : "")} onClick={() => selectOption(option.id)} aria-pressed={selected} disabled={Boolean(feedback)}><span className="assessment-option-marker">{selected ? "✓" : ""}</span><span>{option.label}</span></button>;
            })}
          </div>}

          {feedback && <div className={"assessment-feedback " + (feedback.correct ? "is-correct" : "is-incorrect")} role="status"><div className="assessment-feedback-icon">{feedback.correct ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}</div><div><strong>{feedback.correct ? "Correct" : "Not quite"}</strong><p>{feedback.explanation}</p>{!feedback.correct && <p><strong>Correct answer:</strong> {formatAnswer(question, feedback.correctAnswer)}</p>}</div></div>}
          {error && <div className="assessment-inline-error" role="alert">{error}</div>}

          <div className="assessment-question-actions">
            <Button variant="secondary" disabled={active.currentQuestionIndex === 0} onClick={() => { setError(null); setQuestionIndex(active.currentQuestionIndex - 1); }}><ArrowLeft size={15} /> Previous</Button>
            {!feedback ? <Button onClick={submitCurrent}>Submit answer <CheckCircle2 size={15} /></Button> : isLast ? <Button disabled={!allAnswered} onClick={() => { const result = submitAssessment(assessment.id); if (!result) setError("Complete every question before finishing."); }} >Finish assessment <ArrowRight size={15} /></Button> : <Button onClick={() => { setError(null); setQuestionIndex(active.currentQuestionIndex + 1); }}>Next question <ArrowRight size={15} /></Button>}
          </div>
          {isLast && feedback && !allAnswered && <p className="assessment-submit-note">Answer every question before finishing the assessment.</p>}
        </Card>

        {question.type === "coding" && feedback && <Card className="assessment-code-output"><div className="card-kicker">Mock grader</div><strong>{feedback.correct ? "Pattern matched" : "Pattern needs review"}</strong><p>No code was executed. The grader checked the expected educational pattern locally.</p><pre>{feedback.correct ? "Mock output: circuit accepted" : "Mock output: expected H gate + measurement pattern"}</pre></Card>}

        {feedback && <Card className="assessment-tutor-card"><div className="assessment-tutor-icon"><Bot size={17} /></div><div><span className="card-kicker">After submission</span><h3>Need help with this concept?</h3><p>The AI Tutor can explain the submitted question and your result without changing the grade.</p></div><Button variant="secondary" size="sm" onClick={tutor}>Ask AI Tutor</Button></Card>}
      </main>
    </div>
  </div>;
}

function AssessmentResults({ assessment, summary, results, reviewOpen, setReviewOpen, onRetake, onContinue, onReviewLessons }: { assessment: Assessment; summary: AssessmentAttemptSummary; results: import("../types/assessment").AssessmentResult[]; reviewOpen: boolean; setReviewOpen: (value: boolean) => void; onRetake: () => void; onContinue: () => void; onReviewLessons: () => void }) {
  const navigate = useNavigate();
  const result = summary.latest;
  if (!result) return null;
  const incorrect = result.answers.filter((answer) => !answer.correct);
  return <div className="assessment-detail-page">
    <Breadcrumb items={[{ label: "Assessments", href: "/assessments" }, { label: assessment.title }]} />
    <PageHeader eyebrow="Assessment complete" title="Assessment Complete" description={result.passed ? "You passed this checkpoint. Keep the momentum going into the next lesson." : "Use the feedback to revisit the concepts you missed, then try again when you are ready."} />
    <section className="assessment-result-hero">
      <Card className="assessment-result-score"><span>Score</span><strong>{result.percentage}%</strong><Badge tone={result.passed ? "success" : "danger"}>{result.passed ? "Passed" : "Needs review"}</Badge><p>{result.correctCount} / {result.totalQuestions} correct · Attempt {result.attemptNumber}</p></Card>
      <Card className="assessment-result-summary"><div><span>Best score</span><strong>{summary.best?.percentage ?? result.percentage}%</strong></div><div><span>Attempts</span><strong>{summary.attemptCount}</strong></div><div><span>Passing score</span><strong>{assessment.passingScore}%</strong></div><div><span>Submitted</span><strong>{new Date(result.submittedAt).toLocaleDateString()}</strong></div></Card>
    </section>
    <Card className="assessment-attempt-history"><div className="card-kicker">Attempt history</div><h2>Previous attempts</h2>{[...results].reverse().map((attempt) => <div className="assessment-attempt-row" key={attempt.attemptId}><span>Attempt {attempt.attemptNumber}</span><strong>{attempt.percentage}%</strong><Badge tone={attempt.passed ? "success" : "danger"}>{attempt.passed ? "Passed" : "Review"}</Badge><time>{new Date(attempt.submittedAt).toLocaleString()}</time></div>)}</Card>
    <div className="assessment-result-actions"><Button onClick={result.passed ? onContinue : onReviewLessons}>{result.passed ? "Continue Learning" : "Review Lessons"} <ArrowRight size={15} /></Button>{canRetake(assessment, summary) && <Button variant="secondary" onClick={onRetake}><RotateCcw size={15} /> Retake assessment</Button>}<Button variant="ghost" onClick={() => setReviewOpen(!reviewOpen)}>{reviewOpen ? "Hide review" : "Review incorrect answers"}</Button></div>
    {reviewOpen && <Card className="assessment-review-card"><div className="card-kicker">Review</div><h2>Learn from each response</h2>{incorrect.map((answer) => {
      const question = assessment.questions.find((item) => item.id === answer.questionId);
      if (!question) return null;
      return <article key={answer.questionId} className="assessment-review-item"><Badge tone="danger">Incorrect</Badge><h3>{question.question}</h3><div className="assessment-review-grid"><div><span>Your answer</span><strong>{formatAnswer(question, answer.value)}</strong></div><div><span>Correct answer</span><strong>{formatAnswer(question, question.correctAnswer)}</strong></div></div><p>{question.explanation}</p><Button variant="ghost" size="sm" onClick={() => navigate("/tutor", { state: { tutorContext: { source: "assessment", assessmentId: assessment.id, assessmentTitle: assessment.title, questionId: question.id, question: question.question, learnerAnswer: answer.value, correctAnswer: question.correctAnswer, explanation: question.explanation, moduleId: assessment.moduleId, moduleTitle: getModule(assessment.moduleId)?.title, lessonId: question.lessonId, lessonTitle: question.lessonId ? getLesson(question.lessonId)?.title : undefined, topic: question.relatedConcept, returnPath: "/assessments/" + assessment.id } } })}><Bot size={14} /> Ask AI Tutor</Button></article>;
    })}</Card>}
    {!incorrect.length && <Card className="assessment-perfect-card"><CheckCircle2 size={19} /><div><strong>Everything correct</strong><p>Review the explanations anyway to reinforce the concepts.</p></div></Card>}
  </div>;
}

function CodingAnswer({ question, answer, disabled, onChange }: { question: AssessmentQuestion; answer: string | string[] | undefined; disabled: boolean; onChange: (value: string) => void }) {
  return <div className="assessment-coding-editor"><div className="assessment-code-header"><span><FileCode2 size={15} /> Qiskit-style</span><Badge tone="neutral">Mock grading</Badge></div><textarea aria-label="Code answer" value={typeof answer === "string" ? answer : ""} disabled={disabled} onChange={(event) => onChange(event.target.value)} spellCheck={false} placeholder={question.codeStarter ?? "Write your circuit code here…"} /><p><strong>Expected goal:</strong> Apply H to q0 and measure q0. Grading checks the expected pattern; it does not execute code.</p></div>;
}

function formatAnswer(question: AssessmentQuestion, answer: string | string[]) {
  if (question.type === "coding") return Array.isArray(answer) ? answer.join(", ") : answer || "No code submitted";
  if (Array.isArray(answer)) return answer.map((id) => question.options?.find((option) => option.id === id)?.label ?? id).join(", ");
  return question.options?.find((option) => option.id === answer)?.label ?? (answer || "No answer");
}

function canRetake(assessment: Assessment, summary: AssessmentAttemptSummary) {
  return assessment.attemptsAllowed === null || summary.attemptCount < assessment.attemptsAllowed;
}
