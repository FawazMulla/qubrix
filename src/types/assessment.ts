export type AssessmentQuestionType = "multiple-choice" | "true-false" | "multiple-select" | "coding";
export type AssessmentDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface AssessmentOption {
  id: string;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  type: AssessmentQuestionType;
  question: string;
  options?: AssessmentOption[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: AssessmentDifficulty;
  relatedConcept: string;
  moduleId: string;
  lessonId?: string;
  codeStarter?: string;
  expectedGoal?: string;
  framework?: "Qiskit" | "PennyLane" | "Cirq";
  gradingPattern?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  lessonId?: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  attemptsAllowed: number | null;
  estimatedDuration: string;
}

export interface AssessmentAnswer {
  questionId: string;
  value: string | string[];
  correct: boolean | null;
  submitted: boolean;
}

export interface AssessmentResult {
  assessmentId: string;
  moduleId: string;
  lessonId?: string;
  attemptId: string;
  answers: AssessmentAnswer[];
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  attemptNumber: number;
  timeSpentSeconds?: number;
}

export interface AssessmentProgressState {
  assessmentId: string;
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  submittedQuestions: string[];
  questionFeedback: Record<string, { correct: boolean; explanation: string; correctAnswer: string | string[] }>;
  startedAt?: string;
}

export interface AssessmentAttemptSummary {
  assessmentId: string;
  latest: AssessmentResult | null;
  best: AssessmentResult | null;
  attemptCount: number;
}
