import React, { useState, useEffect, useRef } from 'react';
import {
  Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets,
  RefreshCw, MapPin, Pencil, Check, X, Zap, CloudLightning,
  Eye
} from 'lucide-react';
import { weatherService, WeatherData } from '@core/service-layer/WeatherService';
import { eventBus } from '@core/event-bus';
import { useAppStore } from '@/store/useAppStore';

const getConditionIcon = (cond: string) => {
  const c = cond.toLowerCase();
  if (c.includes('thunder')) return <CloudLightning className="w-9 h-9 text-yellow-400" />;
  if (c.includes('snow'))    return <CloudSnow className="w-9 h-9 text-sky-200" />;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
                             return <CloudRain className="w-9 h-9 text-blue-400" />;
  if (c.includes('fog'))     return <Eye className="w-9 h-9 text-slate-400" />;
  if (c.includes('overcast') || c.includes('cloudy'))
                             return <Cloud className="w-9 h-9 text-slate-300" />;
  if (c.includes('partly'))  return <Cloud className="w-9 h-9 text-sky-300" />;
  return <Sun className="w-9 h-9 text-amber-400" />;
};

export const WeatherWidget: React.FC = () => {
  const { theme } = useAppStore();
  const [weather, setWeather] = useState<WeatherData>(weatherService.getWeather());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [editError, setEditError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = eventBus.on('WEATHER_DATA_UPDATED', (data: WeatherData) => {
      setWeather({ ...data });
      setIsRefreshing(false);
    });
    return () => unsub();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    weatherService.refreshWeather();
  };

  const startEditing = () => {
    setCityInput(weather.city.split(',')[0].trim());
    setEditError('');
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError('');
  };

  const submitCity = async () => {
    const val = cityInput.trim();
    if (!val) return;
    setIsRefreshing(true);
    setIsEditing(false);
    setEditError('');
    await weatherService.fetchWeather(val);
    if (weather.error) setEditError(weather.error);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitCity();
    if (e.key === 'Escape') cancelEditing();
  };

  return (
    <div className="p-4 rounded-xl acrylic-card border border-white/10 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accentColor }} />
            <input
              ref={inputRef}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="City name..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
            <button onClick={submitCity} className="p-1 rounded-lg hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors" title="Save">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={cancelEditing} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={startEditing}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white group transition-colors"
            title="Change location"
          >
            <MapPin className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            <span className="font-medium">{weather.city || 'Set location'}</span>
            <Pencil className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>
        )}

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {weather.error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {weather.error}
        </div>
      )}

      {/* Loading state */}
      {isRefreshing && !weather.error && weather.tempC === 0 && (
        <div className="text-xs text-slate-400 py-4 text-center">Fetching weather data...</div>
      )}

      {/* Main temp row */}
      {weather.tempC !== 0 && !weather.error && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getConditionIcon(weather.condition)}
              <div>
                <div className="text-2xl font-extrabold text-white tracking-tight">{weather.tempC}°C</div>
                <div className="text-xs text-slate-400">{weather.condition}</div>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-400 space-y-0.5">
              <div className="flex items-center justify-end gap-1">
                <Droplets className="w-3 h-3 text-sky-400" />
                <span className="text-slate-200 font-medium">{weather.humidityPct}%</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Wind className="w-3 h-3 text-slate-400" />
                <span className="text-slate-200 font-medium">{weather.windKmH} km/h</span>
              </div>
              {weather.feelsLikeC !== 0 && (
                <div className="text-[10px] text-slate-500">Feels {weather.feelsLikeC}°C</div>
              )}
            </div>
          </div>

          {/* Forecast */}
          {weather.forecast.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10 text-center text-xs">
              {weather.forecast.map((f, i) => (
                <div key={i} className="p-1.5 rounded-lg bg-white/5 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">{f.day}</span>
                  <span className="font-bold text-slate-200">{f.highC}°</span>
                  <span className="text-[10px] text-slate-500">{f.lowC}°</span>
                </div>
              ))}
            </div>
          )}

          {weather.lastUpdated > 0 && (
            <div className="text-[10px] text-slate-600 text-right">
              Updated {new Date(weather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
