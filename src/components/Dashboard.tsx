'use client';

import { motion } from 'framer-motion';
import { BookOpen, Trophy, Clock, Play, Coffee, CheckCircle, Award, Users } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Module, Quiz, PracticeExam, Progress } from '@/types';
import Image from 'next/image';

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
      {/* Hero Section with Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="California Contractor License"
            width={200}
            height={200}
            className="rounded-2xl"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          California B-2 Contractor License Exam Prep
        </h1>
        <p className="text-xl text-slate-400 mb-6 max-w-2xl mx-auto">
          Your complete guide to passing the California Residential Remodeling Contractor (B-2) License Exam
        </p>
        
        {/* Support Link */}
        <a
          href="https://buymeacoffee.com/dreadpirateroberts"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-full hover:bg-amber-400 transition-colors mb-8"
        >
          <Coffee className="w-5 h-5" />
          Support This Project
        </a>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50"
      >
        <h2 className="text-xl font-semibold text-white mb-4">About This Course</h2>
        <p className="text-slate-300 mb-4">
          Welcome to this free B-2 Residential Remodeling Contractor License exam preparation course. 
          Designed to help aspiring contractors pass their California State License Board (CSLB) exams with confidence.
        </p>
        
        {/* Donation Request */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            This course represents many hours of development and significant personal expense. If you&apos;ve found 
            this helpful and want to support the work, any contribution helps me continue developing this and future 
            educational content. If demand exists, I hope to expand to other classifications as time and resources 
            permit. Thank you!
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium">63 Video Lessons</p>
              <p className="text-sm text-slate-400">Covering all exam topics</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium">310 Quiz Questions</p>
              <p className="text-sm text-slate-400">Test your knowledge</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium">100% Free</p>
              <p className="text-sm text-slate-400">No hidden fees or subscriptions</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Your Learning Dashboard
        </h2>
        <p className="text-slate-400">
          Track your progress and continue where you left off
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

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <BookOpen className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{completedLessons}/{totalLessons}</p>
            <p className="text-xs text-slate-400">Lessons Completed</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{passedExams}/{practiceExams.length}</p>
            <p className="text-xs text-slate-400">Practice Exams Passed</p>
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
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Law & Business</p>
            {practiceExams
              .filter((e) => e.type === 'law-business')
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
    </div>
  );
}
