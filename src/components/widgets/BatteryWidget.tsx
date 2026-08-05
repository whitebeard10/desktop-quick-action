import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, Zap } from 'lucide-react';
import { batteryService } from '@core/service-layer/BatteryService';
import { useAppStore } from '@/store/useAppStore';

export const BatteryWidget: React.FC = () => {
  const [battery, setBattery] = useState(batteryService.getStatus());
  const { theme } = useAppStore();

  useEffect(() => {
    batteryService.init();
    const interval = setInterval(() => {
      setBattery(batteryService.getStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getBatteryColor = (level: number) => {
    if (level < 20) return 'bg-rose-500 text-rose-400';
    if (level < 50) return 'bg-amber-500 text-amber-400';
    return 'bg-emerald-500 text-emerald-400';
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          {battery.isCharging ? (
            <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <Battery className="w-4 h-4 text-slate-400" />
          )}
          <span>System Battery</span>
        </div>
        <span className="text-xs font-bold text-white">{battery.levelPct}%</span>
      </div>

      {/* Progress Meter Bar */}
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBatteryColor(battery.levelPct).split(' ')[0]}`}
          style={{ width: `${battery.levelPct}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400">
        <span>Status: <span className="text-slate-200 font-medium">{battery.isCharging ? 'Charging' : 'On Battery'}</span></span>
        {battery.isCharging ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Zap className="w-3 h-3 fill-current" /> Fast Charge
          </span>
        ) : (
          <span>Discharging</span>
        )}
      </div>
    </div>
  );
};
