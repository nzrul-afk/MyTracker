import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { db, type Todo } from '../lib/db';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroState {
  activeTask: Todo | null;
  mode: Mode;
  timeLeft: number;
  isActive: boolean;
  isFlashing: boolean;
  
  startTask: (task: Todo) => void;
  closeTimer: () => void;
  toggleTimer: () => void;
  switchMode: (newMode: Mode) => void;
  resetTimer: () => void;
  completeTask: () => void;
}

export const MODES = {
  work: { label: 'Fokus', time: 25 * 60, color: 'text-rose-500', bg: 'bg-rose-500' },
  shortBreak: { label: 'Istirahat Pendek', time: 5 * 60, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  longBreak: { label: 'Istirahat Panjang', time: 15 * 60, color: 'text-indigo-500', bg: 'bg-indigo-500' },
};

const PomodoroContext = createContext<PomodoroState | null>(null);

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) throw new Error('usePomodoro must be used within PomodoroProvider');
  return context;
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [activeTask, setActiveTask] = useState<Todo | null>(null);
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.time);
  const [isActive, setIsActive] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  
  // Track accurate time to prevent throttling issues
  const lastTickRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      lastTickRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        
        if (delta >= 1) {
          lastTickRef.current = now;
          setTimeLeft(prev => {
            const newTime = prev - delta;
            if (newTime <= 0) {
              handleTimeUp();
              return 0;
            }
            return newTime;
          });
        }
      }, 500); // Check more frequently than 1s to be accurate and recover from background throttling
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimeUp = () => {
    setIsActive(false);
    setIsFlashing(true);
    
    // Real System Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Waktu Habis!', {
        body: `Sesi ${MODES[mode].label} telah selesai.`,
        icon: '/vite.svg'
      });
    }

    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    setTimeout(() => setIsFlashing(false), 5000);
  };

  const startTask = (task: Todo) => {
    setActiveTask(task);
    if (!isActive) {
      setMode('work');
      setTimeLeft(MODES.work.time);
    }
  };

  const closeTimer = () => {
    setIsActive(false);
    setActiveTask(null);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    setIsFlashing(false);
    if (!isActive) {
      lastTickRef.current = Date.now();
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(false);
    setIsFlashing(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
    setIsFlashing(false);
  };

  const completeTask = async () => {
    if (activeTask && activeTask.id) {
      await db.todos.update(activeTask.id, {
        status: 'completed',
        synced: false,
        updatedAt: Date.now()
      });
      // Real System Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Tugas Selesai!', {
          body: `Tugas "${activeTask.title}" berhasil diselesaikan. Kerja bagus!`,
          icon: '/vite.svg'
        });
      }
      closeTimer();
    }
  };

  return (
    <PomodoroContext.Provider value={{
      activeTask,
      mode,
      timeLeft,
      isActive,
      isFlashing,
      startTask,
      closeTimer,
      toggleTimer,
      switchMode,
      resetTimer,
      completeTask
    }}>
      {children}
    </PomodoroContext.Provider>
  );
}
