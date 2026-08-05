import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const TimerWidget: React.FC = () => {
  const { theme } = useAppStore();
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<string[]>([]);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setLaps([]);
  };

  const handleLap = () => {
    setLaps((prev) => [formatTime(seconds), ...prev].slice(0, 3));
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Timer className="w-4 h-4" style={{ color: theme.accentColor }} />
          <span>Stopwatch & Timer</span>
        </div>
        <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10 text-[10px]">
          <button
            onClick={() => { setMode('stopwatch'); handleReset(); }}
            className={`px-2 py-0.5 rounded ${mode === 'stopwatch' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => { setMode('timer'); handleReset(); setSeconds(300); }}
            className={`px-2 py-0.5 rounded ${mode === 'timer' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            5m Timer
          </button>
        </div>
      </div>

      <div className="text-center py-1">
        <div className="text-3xl font-mono font-extrabold tracking-wider text-white">
          {formatTime(seconds)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={handleLap}
          disabled={!isRunning}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-40 text-xs"
          title="Lap"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {laps.length > 0 && (
        <div className="space-y-1 text-[11px] text-slate-400 border-t border-white/10 pt-2">
          {laps.map((lap, i) => (
            <div key={i} className="flex justify-between font-mono">
              <span>Lap {laps.length - i}</span>
              <span className="text-slate-200">{lap}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
