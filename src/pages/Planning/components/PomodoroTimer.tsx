import { useEffect } from 'react';
import { FiX, FiPlay, FiPause, FiSquare, FiCheckCircle } from 'react-icons/fi';
import { cn } from '../../../lib/utils';
import { usePomodoro, MODES } from '../../../context/PomodoroContext';

type Mode = 'work' | 'shortBreak' | 'longBreak';

export function PomodoroTimer() {
  const {
    activeTask,
    mode,
    timeLeft,
    isActive,
    isFlashing,
    closeTimer,
    toggleTimer,
    switchMode,
    resetTimer,
    completeTask
  } = usePomodoro();

  useEffect(() => {
    // Escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTimer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeTimer]);

  if (!activeTask) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentMode = MODES[mode];
  const progress = 100 - (timeLeft / currentMode.time) * 100;

  return (
    <div className={cn(
      "fixed inset-0 z-[150] flex flex-col bg-slate-900/95 backdrop-blur-xl transition-colors duration-500 animate-in fade-in zoom-in-95",
      isFlashing ? "bg-rose-900/90" : ""
    )}>
      
      {/* Background Progress Bar (Top) */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
        <div 
          className={cn("h-full transition-all duration-1000 ease-linear", currentMode.bg)}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Top Bar (Close) */}
      <div className="p-6 flex justify-end">
        <button 
          onClick={closeTimer}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
        >
          <FiX size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        
        {/* Task Info */}
        <div className="text-center mb-12">
          <p className="text-slate-400 font-medium tracking-widest uppercase text-sm mb-3">Fokus Pada Tugas</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl leading-tight line-clamp-3">
            {activeTask.title}
          </h2>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-800/50 rounded-full p-1.5 mb-10 border border-slate-700/50">
          {(Object.keys(MODES) as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                mode === m 
                  ? cn(MODES[m].bg, "text-white shadow-lg") 
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              )}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mb-12 group cursor-pointer" onClick={toggleTimer}>
          <div className={cn(
            "absolute inset-0 rounded-full border-4 border-slate-800 transition-all duration-500",
            isActive ? cn("scale-105 border-opacity-50 border-t-transparent animate-spin-slow", currentMode.color) : ""
          )}></div>
          
          <div className="absolute inset-2 rounded-full bg-slate-800/80 shadow-2xl flex flex-col items-center justify-center border border-slate-700">
            <span className={cn(
              "text-6xl md:text-8xl font-black tracking-tighter tabular-nums transition-colors duration-300",
              isFlashing ? "text-rose-500 animate-pulse" : "text-white"
            )}>
              {formatTime(timeLeft)}
            </span>
            <div className="absolute bottom-10 text-slate-400 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isActive ? <><FiPause /> Jeda</> : <><FiPlay /> Mulai</>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTimer}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95",
              currentMode.bg,
              isActive ? "hover:brightness-90" : "hover:brightness-110"
            )}
          >
            {isActive ? <FiPause size={32} /> : <FiPlay size={32} className="ml-2" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
            title="Reset"
          >
            <FiSquare size={20} />
          </button>

          <button 
            onClick={completeTask}
            className="w-14 h-14 rounded-full bg-slate-800 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 flex items-center justify-center transition-all ml-4 group"
            title="Selesaikan Tugas"
          >
            <FiCheckCircle size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
      </div>
    </div>
  );
}
