'use client';

import { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/types';

const STORAGE_KEY = 'contractor-lms-progress';

const defaultProgress: Progress = {
  completedLessons: [],
  currentLesson: null,
  videoProgress: {},
  quizScores: {},
  examScores: {},
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress(defaultProgress);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, isLoaded]);

  const markLessonComplete = useCallback((lessonId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
    }));
  }, []);

  const setCurrentLesson = useCallback((lessonId: string | null) => {
    setProgress((prev) => ({
      ...prev,
      currentLesson: lessonId,
    }));
  }, []);

  const updateVideoProgress = useCallback((lessonId: string, percentage: number) => {
    setProgress((prev) => ({
      ...prev,
      videoProgress: {
        ...prev.videoProgress,
        [lessonId]: percentage,
      },
    }));
  }, []);

  const saveQuizScore = useCallback(
    (quizId: string, score: number, total: number) => {
      const passed = (score / total) * 100 >= 70;
      setProgress((prev) => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [quizId]: { score, total, passed },
        },
      }));
    },
    []
  );

  const saveExamScore = useCallback(
    (examId: string, score: number, total: number) => {
      const passed = (score / total) * 100 >= 72;
      setProgress((prev) => ({
        ...prev,
        examScores: {
          ...prev.examScores,
          [examId]: { score, total, passed, date: new Date().toISOString() },
        },
      }));
    },
    []
  );

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getOverallProgress = useCallback(() => {
    const totalLessons = 54;
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  }, [progress.completedLessons]);

  return {
    progress,
    isLoaded,
    markLessonComplete,
    setCurrentLesson,
    updateVideoProgress,
    saveQuizScore,
    saveExamScore,
    resetProgress,
    getOverallProgress,
  };
}
