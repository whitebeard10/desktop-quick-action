import React from 'react';
import { Palette, Check, Sliders } from 'lucide-react';
import { useAppStore, THEME_PRESETS } from '@/store/useAppStore';
import { ThemePreset } from '@/types';

export const ThemeCustomizer: React.FC = () => {
  const { theme, setThemePreset, updateThemeConfig, settings, updateSettings } = useAppStore();

  const presets: ThemePreset[] = ['Glass', 'Dark', 'Light', 'AMOLED', 'Minimal', 'Material', 'Fluent'];

  const accentColors = [
    '#0078d4', // Windows Blue
    '#3b82f6', // Bright Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#10b981', // Emerald Green
    '#f59e0b', // Amber
    '#ef4444', // Red
  ];

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Preset Themes */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-400" /> Built-In Windows 11 Themes
        </label>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => {
            const isSelected = theme.id === preset;
            return (
              <button
                key={preset}
                onClick={() => setThemePreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-blue-600/30 border-blue-500 text-white font-bold shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
              >
                <div className="text-xs">{preset}</div>
                {isSelected && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-blue-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Picker */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-2">Accent Color Palette</label>
        <div className="flex items-center gap-2">
          {accentColors.map((color) => (
            <button
              key={color}
              onClick={() => updateThemeConfig({ accentColor: color, accentGlow: `${color}88` })}
              className={`w-7 h-7 rounded-full transition-transform ${
                theme.accentColor === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Custom Parameters Sliders */}
      <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Bubble Size</span>
            <span className="font-mono text-slate-400">{settings.bubbleSize}px</span>
          </div>
          <input
            type="range"
            min={40}
            max={80}
            value={settings.bubbleSize}
            onChange={(e) => updateSettings({ bubbleSize: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Corner Radius</span>
            <span className="font-mono text-slate-400">{settings.cornerRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            value={settings.cornerRadius}
            onChange={(e) => updateSettings({ cornerRadius: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Glass Blur Intensity</span>
            <span className="font-mono text-slate-400">{theme.blurIntensity}px</span>
          </div>
          <input
            type="range"
            min={4}
            max={40}
            value={theme.blurIntensity}
            onChange={(e) => updateThemeConfig({ blurIntensity: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Idle Transparency</span>
            <span className="font-mono text-slate-400">{Math.round(settings.idleOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1.0}
            step={0.05}
            value={settings.idleOpacity}
            onChange={(e) => updateSettings({ idleOpacity: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
