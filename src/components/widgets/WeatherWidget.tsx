import React, { useState } from 'react';
import { CloudSun, Sun, CloudRain, RefreshCw, MapPin } from 'lucide-react';
import { weatherService } from '@core/service-layer/WeatherService';
import { useAppStore } from '@/store/useAppStore';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState(weatherService.getWeather());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useAppStore();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const updated = await weatherService.refreshWeather();
    setWeather({ ...updated });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getConditionIcon = (cond: string) => {
    if (cond.includes('Sunny')) return <Sun className="w-8 h-8 text-amber-400" />;
    if (cond.includes('Rain')) return <CloudRain className="w-8 h-8 text-blue-400" />;
    return <CloudSun className="w-8 h-8 text-sky-300" />;
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <MapPin className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
          <span>{weather.city}</span>
        </div>
        <button
          onClick={handleRefresh}
          className={`p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-transform ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          title="Refresh Weather"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getConditionIcon(weather.condition)}
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{weather.tempC}°C</div>
            <div className="text-xs text-slate-400">{weather.condition}</div>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400 space-y-0.5">
          <div>Humidity: <span className="text-slate-200 font-medium">{weather.humidityPct}%</span></div>
          <div>Wind: <span className="text-slate-200 font-medium">{weather.windKmH} km/h</span></div>
        </div>
      </div>

      {/* 3-day forecast */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
        {weather.forecast.map((f, i) => (
          <div key={i} className="p-1.5 rounded-lg bg-white/5 flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium">{f.day}</span>
            <span className="font-bold text-slate-200">{f.tempC}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};
