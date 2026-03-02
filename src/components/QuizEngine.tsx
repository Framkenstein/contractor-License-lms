'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, AlertCircle } from 'lucide-react';
import { QuizQuestion } from '@/types';

interface QuizEngineProps {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  onComplete: (score: number, total: number) => void;
  timeLimit?: number;
  compact?: boolean;
}

export function QuizEngine({ title, questions, passingScore, onComplete, timeLimit, compact = false }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  useEffect(() => {
    if (timeRemaining === null || isComplete) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const correctCount = answers.reduce((count, answer, idx) => {
      return answer === questions[idx]?.correctAnswer ? count + 1 : count;
    }, 0);

    setIsComplete(true);
    onComplete(correctCount, questions.length);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers(new Array(questions.length).fill(null));
    setIsComplete(false);
    if (timeLimit) {
      setTimeRemaining(timeLimit * 60);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400">
          Quiz questions are being prepared. Check back soon!
        </p>
      </div>
    );
  }

  if (isComplete) {
    const score = answers.reduce((count, answer, idx) => {
      return answer === questions[idx]?.correctAnswer ? count + 1 : count;
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= passingScore;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/50 rounded-xl p-8 text-center"
      >
        <div
          className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
            passed ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        >
          {passed ? (
            <Trophy className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">
          {passed ? 'Congratulations!' : 'Keep Studying'}
        </h2>

        <p className="text-slate-400 mb-6">
          {passed
            ? "You've passed this assessment!"
            : `You need ${passingScore}% to pass. Review the material and try again.`}
        </p>

        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{score}</p>
            <p className="text-sm text-slate-400">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{questions.length - score}</p>
            <p className="text-sm text-slate-400">Incorrect</p>
          </div>
          <div className="text-center">
            <p className={`text-4xl font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
              {percentage}%
            </p>
            <p className="text-sm text-slate-400">Score</p>
          </div>
        </div>

        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-400">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        {timeRemaining !== null && (
          <div
            className={`text-lg font-mono ${
              timeRemaining < 300 ? 'text-red-500' : 'text-slate-300'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full mb-8">
        <motion.div
          className="h-full bg-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="text-lg text-white mb-6">{currentQuestion?.question}</p>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              let bgColor = 'bg-slate-700/50 hover:bg-slate-700';
              let borderColor = 'border-transparent';

              if (showResult) {
                if (index === currentQuestion.correctAnswer) {
                  bgColor = 'bg-green-500/20';
                  borderColor = 'border-green-500';
                } else if (index === selectedAnswer && !isCorrect) {
                  bgColor = 'bg-red-500/20';
                  borderColor = 'border-red-500';
                }
              } else if (index === selectedAnswer) {
                bgColor = 'bg-amber-500/20';
                borderColor = 'border-amber-500';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 ${bgColor} ${borderColor} transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        index === selectedAnswer
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-white">{option}</span>
                    {showResult && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                    {showResult && index === selectedAnswer && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && currentQuestion?.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-slate-700/50 rounded-lg"
            >
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-amber-500">Explanation: </span>
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end mt-8">
        {!showResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
