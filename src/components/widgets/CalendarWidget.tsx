import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const CalendarWidget: React.FC = () => {
  const { theme } = useAppStore();
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.toLocaleString('default', { weekday: 'long' });

  // Generate simple 7x5 month grid
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <CalendarIcon className="w-4 h-4" style={{ color: theme.accentColor }} />
          <span>{currentMonth}</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{dayOfWeek}</span>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-semibold">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-center text-xs gap-1">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="p-1" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = dayNum === dayOfMonth;
          return (
            <div
              key={dayNum}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                isToday
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
};
