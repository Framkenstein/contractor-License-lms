import lessonsData from '@/data/lessons.json';
import quizzesData from '@/data/quizzes.json';
import practiceExamsData from '@/data/practice-exams.json';
import lessonQuizzesData from '@/data/lesson-quizzes.json';
import lessonTakeawaysData from '@/data/lesson-takeaways.json';
import { Module, Quiz, PracticeExam, QuizQuestion } from '@/types';

const lessonQuizzesMap = lessonQuizzesData as Record<string, QuizQuestion[]>;
const lessonTakeawaysMap = lessonTakeawaysData as Record<string, string[]>;

const quizQuestionsMap: Record<string, QuizQuestion[]> = {
  'quiz-section-4': (quizzesData as Record<string, QuizQuestion[]>).section4 || [],
  'quiz-section-5': (quizzesData as Record<string, QuizQuestion[]>).section5 || [],
  'quiz-section-6': (quizzesData as Record<string, QuizQuestion[]>).section6 || [],
  'quiz-master': (quizzesData as Record<string, QuizQuestion[]>).master || [],
  'quiz-law-business': (quizzesData as Record<string, QuizQuestion[]>).lawBusiness || [],
  'quiz-trade': (quizzesData as Record<string, QuizQuestion[]>).trade || [],
};

const examQuestionsMap = practiceExamsData as Record<string, QuizQuestion[]>;

export function getModules(): Module[] {
  return lessonsData.modules as Module[];
}

export function getQuizzes(): Quiz[] {
  const quizList: Quiz[] = [
    { id: 'quiz-section-4', title: 'Section 4 Quiz - Law & Safety', moduleId: 4, passingScore: 70, questions: quizQuestionsMap['quiz-section-4'] },
    { id: 'quiz-section-5', title: 'Section 5 Quiz - Remodeling Techniques', moduleId: 5, passingScore: 70, questions: quizQuestionsMap['quiz-section-5'] },
    { id: 'quiz-section-6', title: 'Section 6 Quiz - Building Codes', moduleId: 6, passingScore: 70, questions: quizQuestionsMap['quiz-section-6'] },
    { id: 'quiz-master', title: 'Master Quiz - Comprehensive Review', passingScore: 70, questions: quizQuestionsMap['quiz-master'] },
    { id: 'quiz-law-business', title: 'Law & Business Questions (106)', passingScore: 72, questions: quizQuestionsMap['quiz-law-business'] },
    { id: 'quiz-trade', title: 'Trade Examination Questions (120)', passingScore: 72, questions: quizQuestionsMap['quiz-trade'] },
  ];
  return quizList;
}

export function getPracticeExams(): PracticeExam[] {
  const examList: PracticeExam[] = [
    { id: 'law-business-1', title: 'Law & Business Practice Exam 1', type: 'law-business', passingScore: 72, timeLimit: 120, questions: examQuestionsMap['law-business-1'] || [] },
    { id: 'law-business-2', title: 'Law & Business Practice Exam 2', type: 'law-business', passingScore: 72, timeLimit: 120, questions: examQuestionsMap['law-business-2'] || [] },
    { id: 'law-business-3', title: 'Law & Business Practice Exam 3', type: 'law-business', passingScore: 72, timeLimit: 120, questions: examQuestionsMap['law-business-3'] || [] },
    { id: 'law-business-4', title: 'Law & Business Practice Exam 4', type: 'law-business', passingScore: 72, timeLimit: 120, questions: examQuestionsMap['law-business-4'] || [] },
    { id: 'law-business-5', title: 'Law & Business Practice Exam 5', type: 'law-business', passingScore: 72, timeLimit: 120, questions: examQuestionsMap['law-business-5'] || [] },
    { id: 'law-business-6', title: 'Law & Business Practice Exam 6', type: 'law-business', passingScore: 72, timeLimit: 120, questions: examQuestionsMap['law-business-6'] || [] },
    { id: 'trade-1', title: 'B-2 Trade Practice Exam 1', type: 'trade', passingScore: 72, timeLimit: 150, questions: examQuestionsMap['trade-1'] || [] },
    { id: 'trade-2', title: 'B-2 Trade Practice Exam 2', type: 'trade', passingScore: 72, timeLimit: 150, questions: examQuestionsMap['trade-2'] || [] },
    { id: 'trade-3', title: 'B-2 Trade Practice Exam 3', type: 'trade', passingScore: 72, timeLimit: 150, questions: examQuestionsMap['trade-3'] || [] },
    { id: 'trade-4', title: 'B-2 Trade Practice Exam 4', type: 'trade', passingScore: 72, timeLimit: 150, questions: examQuestionsMap['trade-4'] || [] },
    { id: 'trade-5', title: 'B-2 Trade Practice Exam 5', type: 'trade', passingScore: 72, timeLimit: 150, questions: examQuestionsMap['trade-5'] || [] },
    { id: 'trade-6', title: 'B-2 Trade Practice Exam 6', type: 'trade', passingScore: 72, timeLimit: 150, questions: examQuestionsMap['trade-6'] || [] },
  ];
  return examList;
}

export function getLessonById(lessonId: string) {
  for (const module of lessonsData.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

export function getQuizById(quizId: string): Quiz | null {
  return getQuizzes().find((q) => q.id === quizId) || null;
}

export function getExamById(examId: string): PracticeExam | null {
  return getPracticeExams().find((e) => e.id === examId) || null;
}

export function getTotalLessons(): number {
  return lessonsData.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

export function getLessonQuiz(lessonId: string): QuizQuestion[] | null {
  return lessonQuizzesMap[lessonId] || null;
}

export function getLessonTakeaways(lessonId: string): string[] | null {
  return lessonTakeawaysMap[lessonId] || null;
}

export function getTopicQuizzes(): Record<string, QuizQuestion[]> {
  const topicKeys = Object.keys(lessonQuizzesMap).filter(k => !k.startsWith('m'));
  const result: Record<string, QuizQuestion[]> = {};
  topicKeys.forEach(k => { result[k] = lessonQuizzesMap[k]; });
  return result;
}
