'use client';

import { motion } from 'framer-motion';
import { BookOpen, Trophy, Clock, Target, Play, FileText } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Module, Quiz, PracticeExam, Progress } from '@/types';

interface DashboardProps {
  modules: Module[];
  quizzes: Quiz[];
  practiceExams: PracticeExam[];
  progress: Progress;
  overallProgress: number;
  onStartLesson: (lessonId: string) => void;
  onStartQuiz: (quizId: string) => void;
  onStartExam: (examId: string) => void;
}

export function Dashboard({
  modules,
  quizzes,
  practiceExams,
  progress,
  overallProgress,
  onStartLesson,
  onStartQuiz,
  onStartExam,
}: DashboardProps) {
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = progress.completedLessons.length;
  const passedQuizzes = Object.values(progress.quizScores).filter((s) => s.passed).length;
  const passedExams = Object.values(progress.examScores).filter((s) => s.passed).length;

  const findNextLesson = () => {
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (!progress.completedLessons.includes(lesson.id)) {
          return lesson;
        }
      }
    }
    return modules[0]?.lessons[0];
  };

  const nextLesson = findNextLesson();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to B-2 License Exam Prep
        </h1>
        <p className="text-slate-400">
          California Residential Remodeling Contractor Certification
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Your Progress</h2>
        <ProgressBar progress={overallProgress} label="Course Completion" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <BookOpen className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{completedLessons}/{totalLessons}</p>
            <p className="text-xs text-slate-400">Lessons Completed</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{passedQuizzes}/{quizzes.length}</p>
            <p className="text-xs text-slate-400">Quizzes Passed</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{passedExams}/{practiceExams.length}</p>
            <p className="text-xs text-slate-400">Exams Passed</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{modules.length}</p>
            <p className="text-xs text-slate-400">Course Modules</p>
          </div>
        </div>
      </motion.div>

      {/* Continue Learning */}
      {nextLesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-2xl p-6 mb-8 border border-amber-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-amber-500 text-sm font-semibold mb-1">Continue Learning</p>
              <h3 className="text-xl font-bold text-white">{nextLesson.title}</h3>
              <p className="text-slate-400 text-sm mt-1">
                Module {nextLesson.moduleId} • Section {nextLesson.sectionId}
              </p>
            </div>
            <button
              onClick={() => onStartLesson(nextLesson.id)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Play className="w-5 h-5" />
              Continue
            </button>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Practice Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Practice Exams
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-400 mb-2">Law & Business</p>
              {practiceExams
                .filter((e) => e.type === 'law-business')
                .slice(0, 3)
                .map((exam) => {
                  const score = progress.examScores[exam.id];
                  return (
                    <button
                      key={exam.id}
                      onClick={() => onStartExam(exam.id)}
                      className="w-full flex items-center justify-between p-3 bg-slate-700/30 rounded-lg mb-2 hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="text-sm text-white">{exam.title}</span>
                      {score && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            score.passed
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {Math.round((score.score / score.total) * 100)}%
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">B-2 Trade</p>
              {practiceExams
                .filter((e) => e.type === 'trade')
                .slice(0, 3)
                .map((exam) => {
                  const score = progress.examScores[exam.id];
                  return (
                    <button
                      key={exam.id}
                      onClick={() => onStartExam(exam.id)}
                      className="w-full flex items-center justify-between p-3 bg-slate-700/30 rounded-lg mb-2 hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="text-sm text-white">{exam.title}</span>
                      {score && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            score.passed
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {Math.round((score.score / score.total) * 100)}%
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </motion.div>

        {/* Section Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Section Quizzes
          </h2>
          <div className="space-y-2">
            {quizzes.map((quiz) => {
              const score = progress.quizScores[quiz.id];
              return (
                <button
                  key={quiz.id}
                  onClick={() => onStartQuiz(quiz.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <span className="text-sm text-white">{quiz.title}</span>
                  {score && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        score.passed
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {Math.round((score.score / score.total) * 100)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
