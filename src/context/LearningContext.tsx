import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getAllModuleProgress, getContinueLesson, initialCompletedLessonIds, learningLessons } from "../mockData";

interface LearningContextValue {
  completedLessonIds: string[];
  completeLesson: (lessonId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  overallProgress: number;
  moduleProgress: ReturnType<typeof getAllModuleProgress>;
  continueLesson: ReturnType<typeof getContinueLesson>;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [completedLessonIds, setCompletedLessonIds] = useState(initialCompletedLessonIds);

  const value = useMemo<LearningContextValue>(() => {
    const completeLesson = (lessonId: string) => {
      setCompletedLessonIds((current) => current.includes(lessonId) ? current : [...current, lessonId]);
    };
    const completedCount = learningLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
    return {
      completedLessonIds,
      completeLesson,
      isCompleted: (lessonId: string) => completedLessonIds.includes(lessonId),
      overallProgress: Math.round((completedCount / learningLessons.length) * 100),
      moduleProgress: getAllModuleProgress(completedLessonIds),
      continueLesson: getContinueLesson(completedLessonIds),
    };
  }, [completedLessonIds]);

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) throw new Error("useLearning must be used inside LearningProvider");
  return context;
}