import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive } from 'lucide-react';
import { systemMonitorService, SystemMetrics } from '@core/service-layer/SystemMonitorService';
import { useAppStore } from '@/store/useAppStore';

export const SystemMonitorWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>(systemMonitorService.getMetrics());
  const { theme } = useAppStore();

  useEffect(() => {
    systemMonitorService.startMonitoring(2000);
    const interval = setInterval(() => {
      setMetrics({ ...systemMonitorService.getMetrics() });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Cpu className="w-4 h-4" style={{ color: theme.accentColor }} />
          <span>System Performance Telemetry</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* CPU Gauge */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>CPU Usage</span>
            <span className="font-bold text-blue-400">{metrics.cpuUsagePct}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.cpuUsagePct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">8 Cores Active</span>
        </div>

        {/* RAM Gauge */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>RAM Memory</span>
            <span className="font-bold text-purple-400">{metrics.ramPct}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.ramPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{(metrics.ramUsedMb / 1024).toFixed(1)} GB / 16 GB</span>
        </div>
      </div>
    </div>
  );
};
