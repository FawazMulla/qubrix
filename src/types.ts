export type RouteKey =
  | "dashboard"
  | "learn"
  | "designer"
  | "simulator"
  | "visualizer"
  | "tutor"
  | "assessments"
  | "progress"
  | "instructor";

export interface NavItem {
  key: RouteKey;
  label: string;
  path: string;
  description: string;
}

export interface User {
  name: string;
  role: "Student" | "Instructor";
  initials: string;
  overallProgress: number;
}

export interface Activity {
  title: string;
  meta: string;
  time: string;
  type: "lesson" | "circuit" | "assessment";
}

export interface ModuleProgress {
  name: string;
  completed: number;
  total: number;
}

export interface DashboardStats {
  hoursLearned: string;
  circuitsRun: number;
  averageScore: number;
  streak: number;
}

export type LessonStatus = "not-started" | "in-progress" | "completed";
export type Difficulty = "Beginner" | "Intermediate";

export interface LearningSection {
  heading: string;
  body: string;
}

export interface LearningExample {
  type: "state" | "hadamard" | "measurement" | "gate";
  title: string;
  description: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  sections: LearningSection[];
  example: LearningExample;
  takeaways: string[];
  circuit?: string[];
}

export interface LearningModule {
  id: string;
  number: number;
  title: string;
  description: string;
  estimatedTime: string;
  objectives: string[];
  lessons: Lesson[];
}