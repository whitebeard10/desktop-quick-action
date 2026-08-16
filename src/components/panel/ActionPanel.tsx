import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  LayoutGrid, 
  Search, 
  UserCheck, 
  Palette, 
  Settings, 
  X, 
  Bell, 
  VolumeX, 
  Camera, 
  Terminal, 
  Lock, 
  Power,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { AppLauncher } from '../launcher/AppLauncher';
import { WidgetDashboard } from '../widgets/WidgetDashboard';
import { UniversalSearch } from '../search/UniversalSearch';
import { ProfileSwitcher } from '../profiles/ProfileSwitcher';
import { ThemeCustomizer } from '../themes/ThemeCustomizer';
import { SettingsPanel } from '../settings/SettingsPanel';
import { actionEngine } from '@core/action-engine';
import { springPresets } from '@core/animation-system';
import { windowManager } from '@core/window-manager';

export type PanelTab = 'launcher' | 'widgets' | 'search' | 'profiles' | 'themes' | 'settings';

const PANEL_W = 460;
const PANEL_H = 680;
const GAP = 8; // gap between bubble and panel

export const ActionPanel: React.FC = () => {
  const { 
    isPanelOpen, 
    togglePanel, 
    activeProfile, 
    theme, 
    notifications, 
    unreadNotificationCount, 
    markNotificationsRead, 
    clearNotifications,
    settings,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<PanelTab>('launcher');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHeaderDragging, setIsHeaderDragging] = useState(false);

  const headerDragRef = useRef<{
    startX: number;
    startY: number;
    winStartPos: { x: number; y: number };
  } | null>(null);

  // Notify WindowManager when panel state changes so it can resize the OS window
  useEffect(() => {
    windowManager.setPanelOpen(isPanelOpen);
  }, [isPanelOpen]);

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const pos = windowManager.getPosition();
    headerDragRef.current = {
      startX: e.screenX,
      startY: e.screenY,
      winStartPos: { ...pos },
    };
    setIsHeaderDragging(true);
  };

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!headerDragRef.current) return;
    const dx = e.screenX - headerDragRef.current.startX;
    const dy = e.screenY - headerDragRef.current.startY;
    windowManager.setPosition({
      x: headerDragRef.current.winStartPos.x + dx,
      y: headerDragRef.current.winStartPos.y + dy,
    }, false);
  };

  const handleHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!headerDragRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
    headerDragRef.current = null;
    setIsHeaderDragging(false);
  };

  if (!isPanelOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.92, x: -10 }}
        transition={springPresets.snappy}
        style={{
          width: PANEL_W,
          height: PANEL_H,
          flexShrink: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          borderColor: theme.borderGlass,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
        className="relative rounded-3xl border p-4 text-slate-100 flex flex-col gap-3 overflow-hidden shadow-2xl"
      >
        {/* Header Bar — draggable via pointer events so user can drag the whole window while panel is open */}
        <div
          className="flex items-center justify-between border-b border-white/10 pb-3 select-none"
          style={{ cursor: isHeaderDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
          onPointerDown={handleHeaderPointerDown}
          onPointerMove={handleHeaderPointerMove}
          onPointerUp={handleHeaderPointerUp}
        >
          <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow"
              style={{
                backgroundColor: `${activeProfile.accentColor}33`,
                color: activeProfile.accentColor,
                border: `1px solid ${activeProfile.accentColor}55`,
              }}
            >
              {activeProfile.name}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Notification Drawer Toggle */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (unreadNotificationCount > 0) markNotificationsRead();
              }}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Notifications Drawer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => togglePanel(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Close Panel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div
          className="grid grid-cols-4 gap-2 py-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => actionEngine.execute({ type: 'execute_command', target: 'mute_audio' })}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-1.5 text-xs text-slate-300 hover:text-white transition-all"
            title="Toggle Mute"
          >
            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
            <span>Mute</span>
          </button>

          <button
            onClick={() => actionEngine.execute({ type: 'execute_command', target: 'take_screenshot' })}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-1.5 text-xs text-slate-300 hover:text-white transition-all"
            title="Take Screenshot"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>Capture</span>
          </button>

          <button
            onClick={() => actionEngine.execute({ type: 'launch_app', target: 'terminal' })}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-1.5 text-xs text-slate-300 hover:text-white transition-all"
            title="Open Interactive Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => actionEngine.execute({ type: 'execute_command', target: 'lock_system' })}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-1.5 text-xs text-slate-300 hover:text-white transition-all"
            title="Lock Windows Workstation"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Lock</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {[
            { id: 'launcher', label: 'Launcher', icon: Rocket },
            { id: 'widgets', label: 'Widgets', icon: LayoutGrid },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'profiles', label: 'Profiles', icon: UserCheck },
            { id: 'themes', label: 'Themes', icon: Palette },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PanelTab)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div
          className="relative min-h-[380px] pt-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {activeTab === 'launcher' && <AppLauncher />}
          {activeTab === 'widgets' && <WidgetDashboard />}
          {activeTab === 'search' && <UniversalSearch />}
          {activeTab === 'profiles' && <ProfileSwitcher />}
          {activeTab === 'themes' && <ThemeCustomizer />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>

        {/* Overlay Notification Drawer */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-4 top-16 z-50 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-400" /> System Notifications
                </span>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-white">{n.title}</div>
                        <div className="text-[11px] text-slate-300">{n.message}</div>
                        <div className="text-[9px] text-slate-500 mt-1">
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
