export interface Lesson {
  id: string;
  title: string;
  videoPath: string;
  youtubeId?: string;
  duration?: string;
  moduleId: number;
  sectionId: number;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  moduleId?: number;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface PracticeExam {
  id: string;
  title: string;
  type: 'law-business' | 'trade';
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface Progress {
  completedLessons: string[];
  currentLesson: string | null;
  videoProgress: Record<string, number>;
  quizScores: Record<string, { score: number; total: number; passed: boolean }>;
  examScores: Record<string, { score: number; total: number; passed: boolean; date: string }>;
}

export interface CourseData {
  modules: Module[];
  quizzes: Quiz[];
  practiceExams: PracticeExam[];
}
