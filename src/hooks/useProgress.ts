'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
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
  const { user, isLoaded: isUserLoaded } = useUser();
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get storage key based on user (if logged in, use their ID for personalized storage)
  const getStorageKey = useCallback(() => {
    if (user?.id) {
      return `${STORAGE_KEY}-${user.id}`;
    }
    return STORAGE_KEY;
  }, [user?.id]);

  useEffect(() => {
    if (!isUserLoaded) return;
    
    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress(defaultProgress);
      }
    } else {
      // If user just logged in, check if there's anonymous progress to migrate
      const anonProgress = localStorage.getItem(STORAGE_KEY);
      if (user?.id && anonProgress) {
        try {
          setProgress(JSON.parse(anonProgress));
        } catch {
          setProgress(defaultProgress);
        }
      } else {
        setProgress(defaultProgress);
      }
    }
    setIsLoaded(true);
  }, [getStorageKey, user?.id, isUserLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(progress));
    }
  }, [progress, isLoaded, getStorageKey]);

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
