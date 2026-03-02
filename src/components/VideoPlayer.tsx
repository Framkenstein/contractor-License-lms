'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, RotateCcw } from 'lucide-react';
import { Lesson } from '@/types';

interface VideoPlayerProps {
  lesson: Lesson;
  onProgress: (percentage: number) => void;
  onComplete: () => void;
  initialProgress?: number;
}

export function VideoPlayer({ lesson, onProgress, onComplete, initialProgress = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialProgress > 0) {
        video.currentTime = (initialProgress / 100) * video.duration;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const percentage = (video.currentTime / video.duration) * 100;
      onProgress(percentage);

      if (percentage >= 90 && !hasCompleted) {
        setHasCompleted(true);
        onComplete();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!hasCompleted) {
        setHasCompleted(true);
        onComplete();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [initialProgress, onProgress, onComplete, hasCompleted]);

  useEffect(() => {
    setHasCompleted(false);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [lesson.id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const value = parseFloat(e.target.value);
    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const value = parseFloat(e.target.value);
    video.currentTime = value;
    setCurrentTime(value);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={lesson.videoPath}
        className="w-full aspect-video"
        onClick={togglePlay}
      />

      {/* Play overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center"
          >
            <Play className="w-10 h-10 text-slate-900 ml-1" fill="currentColor" />
          </motion.div>
        </div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4"
      >
        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-slate-600 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-amber-500"
            style={{
              background: `linear-gradient(to right, #f59e0b ${(currentTime / duration) * 100}%, #475569 ${(currentTime / duration) * 100}%)`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-amber-500 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button onClick={() => skip(-10)} className="text-white hover:text-amber-500 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>

            <button onClick={() => skip(10)} className="text-white hover:text-amber-500 transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-amber-500 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            <span className="text-sm text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button onClick={toggleFullscreen} className="text-white hover:text-amber-500 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
