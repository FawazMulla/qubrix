import { assessments } from "./assessments";
import { learningModules } from "../mockData";

export type InstructorAssessmentAttempt = {
  id: string;
  assessmentId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  submittedAt: string;
  responses: Record<string, boolean>;
};

export type InstructorLearner = {
  id: string;
  name: string;
  initials: string;
  enrolledDate: string;
  lastActive: string;
  moduleProgress: Record<string, number>;
  currentModuleId: string;
  currentLesson: string;
  assessmentAttempts: InstructorAssessmentAttempt[];
  activity: InstructorActivity[];
};

export type InstructorActivity = {
  id: string;
  learnerId: string;
  label: string;
  detail: string;
  timestamp: string;
};

const cohortSeed: Array<[string, string, string, string, string, number[], Record<string, number[]>]> = [
  ["learner-01", "Avery Stone", "AS", "2026-08-28", "2026-09-26", [6,8,5,4], {"fundamentals":[84],"gates":[88],"concepts":[79],"algorithms":[82]}],
  ["learner-02", "Jordan Ellis", "JE", "2026-08-30", "2026-09-25", [6,7,3,0], {"fundamentals":[91],"gates":[72,81],"concepts":[64]}],
  ["learner-03", "Mina Patel", "MP", "2026-09-01", "2026-09-24", [6,6,2,0], {"fundamentals":[76],"gates":[69],"concepts":[58]}],
  ["learner-04", "Riley Brooks", "RB", "2026-09-03", "2026-09-22", [5,6,0,0], {"fundamentals":[82],"gates":[74,67]}],
  ["learner-05", "Casey Nguyen", "CN", "2026-09-04", "2026-09-20", [4,5,0,0], {"fundamentals":[73],"gates":[61,70]}],
  ["learner-06", "Taylor Reed", "TR", "2026-09-06", "2026-09-18", [4,3,0,0], {"fundamentals":[68],"gates":[55,63]}],
  ["learner-07", "Samira Cole", "SC", "2026-09-08", "2026-09-17", [3,2,0,0], {"fundamentals":[71],"gates":[62]}],
  ["learner-08", "Noah Kim", "NK", "2026-09-09", "2026-09-15", [2,2,0,0], {"fundamentals":[64],"gates":[58]}],
  ["learner-09", "Emery Davis", "ED", "2026-09-10", "2026-09-13", [2,1,0,0], {"fundamentals":[60],"gates":[52]}],
  ["learner-10", "Quinn Harper", "QH", "2026-09-12", "2026-09-11", [1,0,0,0], {"fundamentals":[57]}],
  ["learner-11", "Morgan Blake", "MB", "2026-09-13", "2026-09-08", [1,0,0,0], {"fundamentals":[62]}],
  ["learner-12", "Robin Hayes", "RH", "2026-09-14", "2026-09-05", [0,0,0,0], {}],
];

const moduleIds = learningModules.map((module) => module.id);
const moduleLessonCounts = Object.fromEntries(learningModules.map((module) => [module.id, module.lessons.length]));
const assessmentByModule = Object.fromEntries(assessments.map((assessment) => [assessment.moduleId, assessment]));

function buildResponses(assessmentId: string, score: number, seed: number) {
  const assessment = assessments.find((item) => item.id === assessmentId);
  if (!assessment) return {};
  const count = assessment.questions.length;
  const correctTarget = Math.round((score / 100) * count);
  return Object.fromEntries(assessment.questions.map((question, index) => [question.id, ((index + seed) % count) < correctTarget]));
}

function buildAttempts(learnerId: string, scores: Record<string, number[]>, seed: number): InstructorAssessmentAttempt[] {
  return Object.entries(scores).flatMap(([moduleId, attempts]) => {
    const assessment = assessmentByModule[moduleId];
    if (!assessment) return [];
    return attempts.map((score, index) => ({
      id: `${learnerId}-${assessment.id}-${index + 1}`,
      assessmentId: assessment.id,
      attemptNumber: index + 1,
      score,
      passed: score >= assessment.passingScore,
      submittedAt: `2026-09-${String(10 + seed + index).padStart(2, "0")}T${String(9 + index).padStart(2, "0")}:30:00Z`,
      responses: buildResponses(assessment.id, score, seed + index),
    }));
  });
}

function currentLessonFor(moduleProgress: Record<string, number>) {
  const module = learningModules.find((item) => moduleProgress[item.id] < moduleLessonCounts[item.id]);
  if (!module) return "Curriculum complete";
  return module.lessons[moduleProgress[module.id]].title;
}

function buildActivity(learnerId: string, name: string, lastActive: string, moduleProgress: Record<string, number>): InstructorActivity[] {
  const currentModule = learningModules.find((module) => moduleProgress[module.id] < moduleLessonCounts[module.id]);
  const activityModule = currentModule?.title ?? "Quantum Algorithms";
  return [
    { id: `${learnerId}-activity-1`, learnerId, label: `${name} reviewed ${activityModule}.`, detail: "Lesson activity", timestamp: lastActive },
    { id: `${learnerId}-activity-2`, learnerId, label: `${name} opened an assessment checkpoint.`, detail: "Assessment activity", timestamp: lastActive },
  ];
}

export const instructorLearners: InstructorLearner[] = cohortSeed.map(([id, name, initials, enrolledDate, lastActive, progress, scores], index) => {
  const moduleProgress = Object.fromEntries(moduleIds.map((moduleId, moduleIndex) => [moduleId, progress[moduleIndex]]));
  const assessmentAttempts = buildAttempts(id, scores, index);
  return {
    id, name, initials, enrolledDate, lastActive, moduleProgress, assessmentAttempts,
    currentModuleId: moduleIds.find((moduleId) => moduleProgress[moduleId] < moduleLessonCounts[moduleId]) ?? moduleIds[moduleIds.length - 1],
    currentLesson: currentLessonFor(moduleProgress),
    activity: buildActivity(id, name, lastActive, moduleProgress),
  };
});

export function getInstructorLearners() { return instructorLearners; }
export function getLearnerDetail(id: string) { return instructorLearners.find((learner) => learner.id === id); }

function overallProgress(learner: InstructorLearner) {
  const completed = moduleIds.reduce((sum, moduleId) => sum + learner.moduleProgress[moduleId], 0);
  const total = moduleIds.reduce((sum, moduleId) => sum + moduleLessonCounts[moduleId], 0);
  return total ? Math.round((completed / total) * 100) : 0;
}

function latestAttempts(learner: InstructorLearner) {
  return assessments.map((assessment) => learner.assessmentAttempts.filter((attempt) => attempt.assessmentId === assessment.id).slice(-1)[0]).filter(Boolean) as InstructorAssessmentAttempt[];
}

function assessmentAverage(learner: InstructorLearner) {
  const latest = latestAttempts(learner);
  return latest.length ? Math.round(latest.reduce((sum, attempt) => sum + attempt.score, 0) / latest.length) : null;
}

export function getInstructorOverview() {
  const learners = getInstructorLearners();
  const active = learners.filter((learner) => daysSince(learner.lastActive) <= 7).length;
  const completion = Math.round(learners.reduce((sum, learner) => sum + overallProgress(learner), 0) / learners.length);
  const scoredLearners = learners.flatMap(latestAttempts).map((attempt) => attempt.score);
  const averageAssessment = scoredLearners.length ? Math.round(scoredLearners.reduce((sum, score) => sum + score, 0) / scoredLearners.length) : null;
  return { totalLearners: learners.length, activeLearners: active, averageProgress: completion, averageAssessmentScore: averageAssessment, completedCurriculum: learners.filter((learner) => overallProgress(learner) === 100).length };
}

export function getModuleAnalytics() {
  const learners = getInstructorLearners();
  return learningModules.map((module) => {
    const completed = learners.filter((learner) => learner.moduleProgress[module.id] === module.lessons.length).length;
    const progress = Math.round(learners.reduce((sum, learner) => sum + (learner.moduleProgress[module.id] / module.lessons.length) * 100, 0) / learners.length);
    const attempts = learners.flatMap((learner) => learner.assessmentAttempts.filter((attempt) => attempt.assessmentId === assessmentByModule[module.id]?.id));
    const score = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length) : null;
    return { id: module.id, name: module.title, completionRate: Math.round((completed / learners.length) * 100), progress, assessmentAverage: score, learnerCount: learners.length };
  });
}

export function getAssessmentAnalytics() {
  const learners = getInstructorLearners();
  return assessments.map((assessment) => {
    const attempts = learners.flatMap((learner) => learner.assessmentAttempts.filter((attempt) => attempt.assessmentId === assessment.id));
    const passed = attempts.filter((attempt) => attempt.passed).length;
    const latest = learners.flatMap((learner) => learner.assessmentAttempts.filter((attempt) => attempt.assessmentId === assessment.id).at(-1)).filter(Boolean) as InstructorAssessmentAttempt[];
    return { id: assessment.id, title: assessment.title, attempts: attempts.length, learnersCompleted: latest.length, averageScore: attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length) : null, passRate: attempts.length ? Math.round((passed / attempts.length) * 100) : null };
  });
}

export function getQuestionAnalytics() {
  const learners = getInstructorLearners();
  return assessments.flatMap((assessment) => assessment.questions.map((question) => {
    const responses = learners.flatMap((learner) => learner.assessmentAttempts.filter((attempt) => attempt.assessmentId === assessment.id).map((attempt) => attempt.responses[question.id]).filter((value): value is boolean => typeof value === "boolean"));
    const correct = responses.filter(Boolean).length;
    return { id: question.id, question: question.question, concept: question.relatedConcept, moduleId: question.moduleId, attempts: responses.length, correctPercent: responses.length ? Math.round((correct / responses.length) * 100) : null };
  })).filter((item) => item.attempts > 0).sort((a, b) => (a.correctPercent ?? 0) - (b.correctPercent ?? 0));
}

export function getRecentActivity() {
  return getInstructorLearners().flatMap((learner) => learner.activity).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10);
}

export function getLearnerSummary(learner: InstructorLearner) {
  return { ...learner, overallProgress: overallProgress(learner), assessmentAverage: assessmentAverage(learner), latestAssessment: latestAttempts(learner).slice(-1)[0] ?? null, currentModule: learningModules.find((module) => module.id === learner.currentModuleId)?.title ?? "Unknown module" };
}

export function getLearnerModuleProgress(learner: InstructorLearner) {
  return learningModules.map((module) => ({ id: module.id, name: module.title, completed: learner.moduleProgress[module.id], total: module.lessons.length, percent: Math.round((learner.moduleProgress[module.id] / module.lessons.length) * 100) }));
}

export function daysSince(date: string) {
  const reference = new Date("2026-09-26T23:59:59Z").getTime();
  return Math.floor((reference - new Date(date).getTime()) / 86400000);
}

export function getAttentionReasons(learner: InstructorLearner) {
  const summary = getLearnerSummary(learner);
  const reasons: string[] = [];
  if (summary.overallProgress < 45) reasons.push("Progress below cohort average");
  if (summary.assessmentAverage !== null && summary.assessmentAverage < 70) reasons.push("Assessment review recommended");
  if (daysSince(learner.lastActive) > 7) reasons.push("Low recent activity");
  if (learner.assessmentAttempts.some((attempt) => attempt.attemptNumber > 1 && !attempt.passed)) reasons.push("Repeated assessment attempts");
  return reasons;
}