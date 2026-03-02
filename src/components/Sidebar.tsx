'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle, FileText, Trophy } from 'lucide-react';
import { Module, Quiz, PracticeExam } from '@/types';

interface SidebarProps {
  modules: Module[];
  quizzes: Quiz[];
  practiceExams: PracticeExam[];
  currentLessonId: string | null;
  completedLessons: string[];
  onSelectLesson: (lessonId: string) => void;
  onSelectQuiz: (quizId: string) => void;
  onSelectExam: (examId: string) => void;
  activeView: 'lesson' | 'quiz' | 'exam';
  activeItemId: string | null;
}

export function Sidebar({
  modules,
  quizzes,
  practiceExams,
  currentLessonId,
  completedLessons,
  onSelectLesson,
  onSelectQuiz,
  onSelectExam,
  activeView,
  activeItemId,
}: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);
    const [showExams, setShowExams] = useState(false);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const lawBusinessExams = practiceExams.filter((e) => e.type === 'law-business');
  const tradeExams = practiceExams.filter((e) => e.type === 'trade');

  return (
    <aside className="w-80 bg-slate-900/95 border-r border-slate-700/50 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-slate-700/50">
        <h1 className="text-lg font-bold text-amber-500">B-2 License Prep</h1>
        <p className="text-xs text-slate-400 mt-1">Residential Remodeling Contractor</p>
      </div>

      <nav className="p-2">
        {/* Course Modules */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Course Modules
          </h2>
          {modules.map((module) => (
            <div key={module.id} className="mb-1">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-xs flex items-center justify-center flex-shrink-0">
                    {module.id}
                  </span>
                  <span className="text-sm text-slate-200 truncate">{module.title}</span>
                </div>
                {expandedModules.includes(module.id) ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {expandedModules.includes(module.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 border-l border-slate-700/50 pl-2">
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isCurrent = activeView === 'lesson' && activeItemId === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => onSelectLesson(lesson.id)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                              isCurrent
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'hover:bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            )}
                            <span className="text-xs truncate">{lesson.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Practice Exams */}
        <div className="mb-4">
          <button
            onClick={() => setShowExams(!showExams)}
            className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-800/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Practice Exams</span>
            </div>
            {showExams ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showExams && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="ml-2">
                  <p className="text-xs text-slate-500 px-2 py-1">Law & Business</p>
                  {lawBusinessExams.map((exam) => {
                    const isActive = activeView === 'exam' && activeItemId === exam.id;
                    return (
                      <button
                        key={exam.id}
                        onClick={() => onSelectExam(exam.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs truncate">{exam.title}</span>
                      </button>
                    );
                  })}

                  <p className="text-xs text-slate-500 px-2 py-1 mt-2">B-2 Trade</p>
                  {tradeExams.map((exam) => {
                    const isActive = activeView === 'exam' && activeItemId === exam.id;
                    return (
                      <button
                        key={exam.id}
                        onClick={() => onSelectExam(exam.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs truncate">{exam.title}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </aside>
  );
}
