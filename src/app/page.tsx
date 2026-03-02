'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, RotateCcw, Coffee } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { UserMenu } from '@/components/UserMenu';
import { VideoPlayer } from '@/components/VideoPlayer';
import { QuizEngine } from '@/components/QuizEngine';
import { Dashboard } from '@/components/Dashboard';
import { ProgressBar } from '@/components/ProgressBar';
import { useProgress } from '@/hooks/useProgress';
import { getModules, getQuizzes, getPracticeExams, getLessonQuiz, getLessonTakeaways } from '@/lib/courseData';
import { Module, Quiz, PracticeExam, Lesson, QuizQuestion } from '@/types';

type ViewType = 'dashboard' | 'lesson' | 'quiz' | 'exam';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentExam, setCurrentExam] = useState<PracticeExam | null>(null);
  const [lessonQuizQuestions, setLessonQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [lessonTakeaways, setLessonTakeaways] = useState<string[] | null>(null);

  const {
    progress,
    isLoaded,
    markLessonComplete,
    updateVideoProgress,
    saveQuizScore,
    saveExamScore,
    resetProgress,
    getOverallProgress,
  } = useProgress();

  const modules = getModules();
  const quizzes = getQuizzes();
  const practiceExams = getPracticeExams();

  const handleSelectLesson = (lessonId: string) => {
    const lesson = modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setLessonQuizQuestions(getLessonQuiz(lessonId));
      setLessonTakeaways(getLessonTakeaways(lessonId));
      setActiveView('lesson');
      setActiveItemId(lessonId);
    }
  };

  const handleSelectQuiz = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (quiz) {
      setCurrentQuiz(quiz);
      setActiveView('quiz');
      setActiveItemId(quizId);
    }
  };

  const handleSelectExam = (examId: string) => {
    const exam = practiceExams.find((e) => e.id === examId);
    if (exam) {
      setCurrentExam(exam);
      setActiveView('exam');
      setActiveItemId(examId);
    }
  };

  const handleGoHome = () => {
    setActiveView('dashboard');
    setActiveItemId(null);
    setCurrentLesson(null);
    setCurrentQuiz(null);
    setCurrentExam(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg lg:hidden"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:relative z-40"
          >
            <Sidebar
              modules={modules}
              quizzes={quizzes}
              practiceExams={practiceExams}
              currentLessonId={progress.currentLesson}
              completedLessons={progress.completedLessons}
              onSelectLesson={handleSelectLesson}
              onSelectQuiz={handleSelectQuiz}
              onSelectExam={handleSelectExam}
              activeView={activeView === 'dashboard' ? 'lesson' : activeView}
              activeItemId={activeItemId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              {activeView !== 'dashboard' && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="text-white font-medium truncate max-w-md">
                    {activeView === 'lesson' && currentLesson?.title}
                    {activeView === 'quiz' && currentQuiz?.title}
                    {activeView === 'exam' && currentExam?.title}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block w-48">
                <ProgressBar progress={getOverallProgress()} />
              </div>
              <a
                href="https://buymeacoffee.com/dreadpirateroberts"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-slate-900 font-medium rounded-lg hover:bg-amber-400 transition-colors text-sm"
              >
                <Coffee className="w-4 h-4" />
                <span className="hidden lg:inline">Support</span>
              </a>
              <button
                onClick={resetProgress}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Reset Progress"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard
                modules={modules}
                quizzes={quizzes}
                practiceExams={practiceExams}
                progress={progress}
                overallProgress={getOverallProgress()}
                onStartLesson={handleSelectLesson}
                onStartQuiz={handleSelectQuiz}
                onStartExam={handleSelectExam}
              />
            </motion.div>
          )}

          {activeView === 'lesson' && currentLesson && (
            <motion.div
              key={`lesson-${currentLesson.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="max-w-5xl mx-auto">
                <VideoPlayer
                  lesson={currentLesson}
                  onProgress={(percentage) => updateVideoProgress(currentLesson.id, percentage)}
                  onComplete={() => markLessonComplete(currentLesson.id)}
                  initialProgress={progress.videoProgress[currentLesson.id] || 0}
                />

                <div className="mt-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {currentLesson.title}
                  </h2>
                  <p className="text-slate-400">
                    Module {currentLesson.moduleId} • Section {currentLesson.sectionId}
                  </p>

                  {progress.completedLessons.includes(currentLesson.id) && (
                    <div className="mt-4 flex items-center gap-2 text-green-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                </div>

                {/* Key Takeaways - shown below lesson info */}
                {lessonTakeaways && lessonTakeaways.length > 0 && (
                  <div className="mt-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-amber-500">Key Takeaways</h3>
                    </div>
                    <ul className="space-y-3">
                      {lessonTakeaways.map((takeaway, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-300">
                          <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm leading-relaxed" dangerouslySetInnerHTML={{
                            __html: takeaway.replace(
                              /(https?:\/\/[^\s]+)/g,
                              '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 underline">$1</a>'
                            )
                          }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lesson Quiz - shown below video */}
                {lessonQuizQuestions && lessonQuizQuestions.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                      <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Lesson Quiz</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                    </div>
                    <QuizEngine
                      title={`${currentLesson.title} - Quiz`}
                      questions={lessonQuizQuestions}
                      passingScore={70}
                      onComplete={(score, total) => saveQuizScore(`lesson-${currentLesson.id}`, score, total)}
                      compact
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'quiz' && currentQuiz && (
            <motion.div
              key={`quiz-${currentQuiz.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="max-w-3xl mx-auto">
                <QuizEngine
                  title={currentQuiz.title}
                  questions={currentQuiz.questions}
                  passingScore={currentQuiz.passingScore}
                  onComplete={(score, total) => saveQuizScore(currentQuiz.id, score, total)}
                />
              </div>
            </motion.div>
          )}

          {activeView === 'exam' && currentExam && (
            <motion.div
              key={`exam-${currentExam.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="max-w-3xl mx-auto">
                <QuizEngine
                  title={currentExam.title}
                  questions={currentExam.questions}
                  passingScore={currentExam.passingScore}
                  timeLimit={currentExam.timeLimit}
                  onComplete={(score, total) => saveExamScore(currentExam.id, score, total)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
