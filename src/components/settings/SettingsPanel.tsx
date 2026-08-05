import React, { useState } from 'react';
import { Settings, Shield, Keyboard, Monitor, Power, Info, Puzzle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { pluginHost } from '@core/plugin-host';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, theme } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'hotkeys' | 'plugins' | 'about'>('general');
  const [plugins, setPlugins] = useState(pluginHost.getPlugins());

  const handleTogglePlugin = (id: string) => {
    pluginHost.togglePlugin(id);
    setPlugins([...pluginHost.getPlugins()]);
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Settings Sub-Nav */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'general' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> General & Behavior
        </button>

        <button
          onClick={() => setActiveTab('hotkeys')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'hotkeys' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" /> Hotkeys
        </button>

        <button
          onClick={() => setActiveTab('plugins')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'plugins' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5" /> Plugins
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'about' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-3.5 h-3.5" /> About
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'general' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Snap to Screen Edges</div>
              <div className="text-[11px] text-slate-400">Automatically snap bubble to left or right desktop margin</div>
            </div>
            <input
              type="checkbox"
              checked={settings.snapToEdge}
              onChange={(e) => updateSettings({ snapToEdge: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Auto-Hide When Idle</div>
              <div className="text-[11px] text-slate-400">Dim opacity and peek at screen edge when inactive</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoHide}
              onChange={(e) => updateSettings({ autoHide: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Launch at Windows Startup</div>
              <div className="text-[11px] text-slate-400">Start Desktop Action Hub silently on system boot</div>
            </div>
            <input
              type="checkbox"
              checked={settings.launchAtStartup}
              onChange={(e) => updateSettings({ launchAtStartup: e.target.checked })}
              className="w-4 h-4 accent-blue-500 rounded"
            />
          </div>
        </div>
      )}

      {activeTab === 'hotkeys' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Global Action Hub Hotkey</div>
              <div className="text-[11px] text-slate-400">Press key combination anywhere in Windows to toggle panel</div>
            </div>
            <select
              value={settings.globalHotkey}
              onChange={(e) => updateSettings({ globalHotkey: e.target.value })}
              className="bg-slate-900 border border-white/15 rounded-lg px-3 py-1 text-xs text-white"
            >
              <option value="Ctrl+Space">Ctrl + Space</option>
              <option value="Win+Space">Win + Space</option>
              <option value="Alt+Space">Alt + Space</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'plugins' && (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {plugins.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">v{p.version}</span>
                </div>
                <div className="text-[11px] text-slate-400">{p.description}</div>
              </div>
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={() => handleTogglePlugin(p.id)}
                className="w-4 h-4 accent-blue-500 rounded"
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="p-4 rounded-xl acrylic-card border border-white/10 text-center space-y-2">
          <div className="text-sm font-extrabold text-white">Desktop Action Hub</div>
          <div className="text-xs text-blue-400 font-mono">Version 1.0.0 (Native Windows 11 Assistant)</div>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
            A floating, always-accessible desktop assistant bringing 1-click app launching, universal search, widgets, and workflow automation directly to your screen.
          </p>
          <div className="pt-2 text-[10px] text-slate-500">Built with Electron, React, TypeScript, Framer Motion & Tailwind CSS</div>
        </div>
      )}
    </div>
  );
};
