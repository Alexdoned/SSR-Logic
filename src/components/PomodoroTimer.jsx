import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * PomodoroTimer — A 25/5 minute study timer.
 * Modes: Focus (25 min) | Short Break (5 min) | Long Break (15 min)
 */

const MODES = {
  focus: { label: 'Focus', minutes: 1, color: 'from-primary-600 to-violet-600' },
  shortBreak: { label: 'Short Break', minutes: 2, color: 'from-emerald-600 to-teal-600' },
  longBreak: { label: 'Long Break', minutes: 3, color: 'from-sky-600 to-blue-600' },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const currentMode = MODES[mode];
  const totalSeconds = currentMode.minutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Timer tick
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, secondsLeft]);

  // Timer complete
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play notification sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) { /* silent fallback */ }

      if (mode === 'focus') {
        setSessions((prev) => prev + 1);
      }

      // Send browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
          body: mode === 'focus' ? 'Focus session complete! Take a break.' : 'Break is over! Time to focus.',
          icon: '/icons/icon-192x192.png',
        });
      }
    }
  }, [secondsLeft, isRunning, mode]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const switchMode = useCallback((newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(MODES[newMode].minutes * 60);
  }, []);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  // SVG circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="animate-fade-in flex flex-col items-center">
      {/* Mode Selector */}
      <div className="flex gap-1 bg-surface-900/40 p-1 rounded-xl mb-8">
        {Object.entries(MODES).map(([key, m]) => (
          <button key={key} id={`mode-${key}`} onClick={() => switchMode(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              mode === key ? 'bg-primary-600/30 text-primary-300' : 'text-surface-200/50 hover:text-white'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8">
        <div className={`${isRunning ? 'pulse-ring' : ''} rounded-full`}>
          <svg width="280" height="280" className="transform -rotate-90">
            {/* Background Circle */}
            <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            {/* Progress Circle */}
            <circle cx="140" cy="140" r={radius} fill="none"
              stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-linear" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-white font-mono tracking-wider">
              {formatTime(secondsLeft)}
            </p>
            <p className="text-sm text-surface-200/50 mt-2 font-medium">{currentMode.label}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button id="timer-reset" onClick={resetTimer}
          className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-surface-200/60 hover:text-white hover:border-white/30 transition-all cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button id="timer-toggle" onClick={toggleTimer}
          className="w-16 h-16 rounded-2xl btn-glow flex items-center justify-center text-2xl">
          {isRunning ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
          ) : (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        <button id="timer-skip" onClick={() => {
          if (mode === 'focus') switchMode(sessions % 4 === 3 ? 'longBreak' : 'shortBreak');
          else switchMode('focus');
        }}
          className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-surface-200/60 hover:text-white hover:border-white/30 transition-all cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Session Counter */}
      <div className="glass-card px-6 py-4 text-center">
        <p className="text-xs text-surface-200/50 uppercase tracking-wider mb-1">Focus Sessions Today</p>
        <div className="flex items-center justify-center gap-2">
          {[...Array(Math.min(sessions, 8))].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/30" />
          ))}
          {sessions === 0 && <p className="text-surface-200/40 text-sm">Start your first session!</p>}
          {sessions > 8 && <span className="text-primary-400 text-sm font-bold">+{sessions - 8}</span>}
        </div>
        {sessions > 0 && (
          <p className="text-primary-300 text-sm font-semibold mt-2">
            🎯 {sessions} session{sessions > 1 ? 's' : ''} · {sessions * 25} min focused
          </p>
        )}
      </div>
    </div>
  );
}
