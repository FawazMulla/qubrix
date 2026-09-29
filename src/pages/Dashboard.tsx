import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, CirclePlay, Clock3, Flame, Gauge, GitBranch, Layers3, Sparkles, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { activities, currentUser, dashboardStats, getModule } from "../mockData";
import { useLearning } from "../context/LearningContext";
import { assessments } from "../data/assessments";
import { useAssessments } from "../context/AssessmentContext";
import { Badge, Button, Card, PageHeader, ProgressBar, SectionHeader, StatCard } from "../components/ui";

export function Dashboard() {
  const navigate = useNavigate();
  const { overallProgress, continueLesson, moduleProgress } = useLearning();
  const { getSummary } = useAssessments();
  const featuredAssessment = assessments[0];
  const featuredAssessmentSummary = featuredAssessment ? getSummary(featuredAssessment.id) : null;
  const continueModuleDefinition = getModule(continueLesson.moduleId);
  const continueModule = continueModuleDefinition ? moduleProgress.find((item) => item.name === continueModuleDefinition.title) : undefined;
  const modulePercent = continueModule ? Math.round((continueModule.completed / continueModule.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="September 26"
        title={`Welcome back, ${currentUser.name.split(" ")[0]}`}
        description="Keep building your quantum intuition. Your next breakthrough is one experiment away."
      />

      <section className="dashboard-hero">
        <Card className="progress-hero">
          <div className="progress-hero-copy">
            <Badge tone="purple">Your learning journey</Badge>
            <h2>{continueModule?.name ?? "Quantum curriculum"}</h2>
            <p>Continue with <strong>{continueLesson.title}</strong> to keep moving through your shared curriculum progress.</p>
            <ProgressBar value={overallProgress} label="Overall completion" />
            <Button onClick={() => navigate(`/learn/module/${continueLesson.moduleId}/lesson/${continueLesson.id}`)}>Continue lesson <ArrowRight size={16} /></Button>
          </div>
          <div className="progress-ring" aria-label={`${overallProgress}% overall completion`} style={{ background: `conic-gradient(var(--secondary) ${overallProgress}%, #2A3144 0)` }}>
            <div><strong>{overallProgress}%</strong><span>complete</span></div>
          </div>
        </Card>
        <Card className="recommendation-card">
          <div className="recommendation-top"><div className="stat-icon cyan"><Sparkles size={19} /></div><Badge tone="cyan">Recommended</Badge></div>
          <span className="card-kicker">{continueModule?.name ?? "Learning"}</span>
          <h3>{continueLesson.title}</h3>
          <p>{continueLesson.description}</p>
          <div className="mini-meta"><Clock3 size={15} /> {continueLesson.duration} <span>•</span> {continueLesson.difficulty}</div>
          <Button variant="ghost" onClick={() => navigate(`/learn/module/${continueLesson.moduleId}/lesson/${continueLesson.id}`)}>Open lesson <ArrowRight size={15} /></Button>
        </Card>
      </section>

      <section className="stat-grid">
        <StatCard label="Hours learned" value={dashboardStats.hoursLearned} detail="This month" icon={<Clock3 size={19} />} />
        <StatCard label="Circuits run" value={String(dashboardStats.circuitsRun)} detail="+6 this week" icon={<GitBranch size={19} />} />
        <StatCard label="Average score" value={`${dashboardStats.averageScore}%`} detail="Across assessments" icon={<Target size={19} />} />
        <StatCard label="Learning streak" value={`${dashboardStats.streak} days`} detail="Personal best: 9" icon={<Flame size={19} />} />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-column">
          <SectionHeader title="Continue learning" action={<button className="text-button" onClick={() => navigate("/learn")}>View curriculum <ArrowRight size={14} /></button>} />
          <Card className="lesson-card">
            <div className="lesson-visual"><span>H</span><div className="wire" /><span className="measure">M</span></div>
            <div className="lesson-content">
              <div className="lesson-meta"><Badge tone="purple">{modulePercent > 0 ? "In progress" : "Not started"}</Badge><span>{continueLesson.duration}</span></div>
              <h3>{continueLesson.title}</h3>
              <p>{continueModule?.name} · {continueLesson.description}</p>
              <ProgressBar value={modulePercent} label="Module progress" />
            </div>
          </Card>

          <SectionHeader title="Recent activity" />
          <Card className="activity-card">
            {activities.map((activity, index) => (
              <div className="activity-row" key={activity.title}>
                <div className={`activity-icon activity-${activity.type}`}>{activity.type === "lesson" ? <BookOpen size={16} /> : activity.type === "circuit" ? <Zap size={16} /> : <CheckCircle2 size={16} />}</div>
                <div><strong>{activity.title}</strong><span>{activity.meta}</span></div>
                <time>{activity.time}</time>
                {index < activities.length - 1 && <span className="activity-divider" />}
              </div>
            ))}
          </Card>
        </div>

        <div className="dashboard-column">
          <SectionHeader title="Module progress" />
          <Card className="module-card">
            {moduleProgress.map((module) => {
              const value = Math.round((module.completed / module.total) * 100);
              return <div className="module-row" key={module.name}><div className="module-row-top"><strong>{module.name}</strong><span>{module.completed}/{module.total}</span></div><ProgressBar value={value} showValue={false} /></div>;
            })}
          </Card>

          <SectionHeader title="Quick actions" />
          <div className="quick-action-grid">
            <button className="quick-action" onClick={() => navigate("/circuit-designer")}><div className="quick-icon purple"><Layers3 size={19} /></div><span><strong>Circuit Designer</strong><small>Build visually</small></span><ArrowRight size={15} /></button>
            <button className="quick-action" onClick={() => navigate("/simulator")}><div className="quick-icon cyan"><CirclePlay size={19} /></div><span><strong>Run simulation</strong><small>Try a framework</small></span><ArrowRight size={15} /></button>
            <button className="quick-action" onClick={() => navigate("/tutor", { state: { tutorContext: { source: "lesson", moduleId: continueLesson.moduleId, moduleTitle: continueModule?.name, lessonId: continueLesson.id, lessonTitle: continueLesson.title, topic: continueLesson.description, lessonContent: continueLesson, returnPath: `/learn/module/${continueLesson.moduleId}/lesson/${continueLesson.id}` } } })}><div className="quick-icon navy"><BrainCircuit size={19} /></div><span><strong>Ask AI Tutor</strong><small>Open lesson tutor</small></span><ArrowRight size={15} /></button>
          </div>

          <SectionHeader title="Assessment summary" action={<button className="text-button" onClick={() => navigate("/assessments")}>See all <ArrowRight size={14} /></button>} />
          <Card className="assessment-summary">
            <div className="score-circle"><strong>{featuredAssessmentSummary?.latest?.percentage ?? "—"}</strong><span>score</span></div>
            <div><Badge tone={featuredAssessmentSummary?.latest ? (featuredAssessmentSummary.latest.passed ? "success" : "danger") : "neutral"}>{featuredAssessmentSummary?.latest ? (featuredAssessmentSummary.latest.passed ? "Passed" : "Needs review") : "Not started"}</Badge><h3>{featuredAssessment?.title ?? "Assessment"}</h3><p>{featuredAssessmentSummary?.latest ? `${featuredAssessmentSummary.latest.totalQuestions} questions · Last attempt ${new Date(featuredAssessmentSummary.latest.submittedAt).toLocaleDateString()}` : featuredAssessment ? `${featuredAssessment.questions.length} questions · No attempts yet` : "No assessment available"}</p></div>
            <Gauge size={21} className="assessment-gauge" />
          </Card>
        </div>
      </section>
    </div>
  );
}