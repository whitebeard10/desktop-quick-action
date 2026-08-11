import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Layers, 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sliders,
  Cpu
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { windowManager } from '@core/window-manager';
import { bubbleFSM } from '@core/bubble-state-machine';
import { springPresets } from '@core/animation-system';
import { systemMonitorService } from '@core/service-layer/SystemMonitorService';

export const FloatingBubble: React.FC = () => {
  const { 
    isPanelOpen, 
    togglePanel, 
    unreadNotificationCount, 
    theme, 
    settings 
  } = useAppStore();

  const [bubbleState, setBubbleState] = useState(bubbleFSM.getState());
  const [pos, setPos] = useState(windowManager.getPosition());
  const [isHovered, setIsHovered] = useState(false);
  const [cpuPct, setCpuPct] = useState(18);

  useEffect(() => {
    // Listen to window position and bubble state machine changes
    const unsubPos = windowManager.getPosition();
    setPos(unsubPos);

    systemMonitorService.startMonitoring(2000);
    const unsubMetrics = () => {
      setCpuPct(systemMonitorService.getMetrics().cpuUsagePct);
    };

    const interval = setInterval(unsubMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const isElectron = Boolean((window as any).electronAPI);

  const handleDrag = (_: any, info: any) => {
    if (isElectron) {
      windowManager.moveDelta(info.delta.x, info.delta.y);
      setPos(windowManager.getPosition());
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (!isElectron) {
      const newX = pos.x + info.offset.x;
      const newY = pos.y + info.offset.y;
      windowManager.setPosition({ x: newX, y: newY }, settings.snapToEdge);
      setPos(windowManager.getPosition());
    } else {
      windowManager.setPosition(windowManager.getPosition(), settings.snapToEdge);
      setPos(windowManager.getPosition());
    }
  };

  const currentOpacity = isHovered 
    ? 1.0 
    : isPanelOpen 
    ? 1.0 
    : settings.idleOpacity;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onHoverStart={() => {
        setIsHovered(true);
        if (!isPanelOpen) bubbleFSM.transitionTo('hover');
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        if (!isPanelOpen) bubbleFSM.transitionTo('idle');
      }}
      style={{
        position: 'relative',
        zIndex: 9999,
        touchAction: 'none',
        WebkitAppRegion: isElectron ? 'drag' : undefined,
      } as React.CSSProperties}
      animate={{
        scale: isHovered ? 1.08 : 1.0,
        opacity: currentOpacity,
      }}
      transition={springPresets.snappy}
    >
      <button
        onClick={() => togglePanel()}
        style={{
          width: settings.bubbleSize,
          height: settings.bubbleSize,
          borderRadius: settings.cornerRadius,
          backgroundColor: theme.bgGlass,
          borderColor: theme.borderGlass,
          backdropFilter: `blur(${theme.blurIntensity}px)`,
          WebkitBackdropFilter: `blur(${theme.blurIntensity}px)`,
          boxShadow: isHovered ? `0 0 25px ${theme.accentGlow}` : theme.shadowDepth,
          WebkitAppRegion: isElectron ? 'no-drag' : undefined,
        } as React.CSSProperties}
        className="relative flex items-center justify-center border transition-all duration-200 cursor-grab active:cursor-grabbing group outline-none"
        title="Desktop Action Hub (Click to Toggle / Drag to Move)"
      >
        {/* Animated Accent Ring */}
        <div 
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 12px ${theme.accentGlow}`,
            borderRadius: settings.cornerRadius,
          }}
        />

        {/* Dynamic State Icon */}
        <AnimatePresence mode="wait">
          {isPanelOpen ? (
            <motion.div
              key="expanded"
              initial={{ rotate: -90, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Zap className="w-6 h-6" style={{ color: theme.accentColor }} />
            </motion.div>
          ) : unreadNotificationCount > 0 ? (
            <motion.div
              key="notification"
              initial={{ scale: 0.5 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Bell className="w-6 h-6 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <Layers className="w-6 h-6 text-slate-200 group-hover:text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CPU Activity Ring Indicator */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none p-1"
          viewBox="0 0 36 36"
        >
          <path
            className="text-white/10"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            strokeWidth="2.5"
            strokeDasharray={`${cpuPct}, 100`}
            strokeLinecap="round"
            stroke={theme.accentColor}
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        {/* Unread Badge Counter */}
        {unreadNotificationCount > 0 && !isPanelOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg border border-slate-900"
          >
            {unreadNotificationCount}
          </motion.span>
        )}
      </button>
    </motion.div>
  );
};
