import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Layers, 
  Bell,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { windowManager } from '@core/window-manager';
import { bubbleFSM } from '@core/bubble-state-machine';
import { springPresets } from '@core/animation-system';
import { systemMonitorService } from '@core/service-layer/SystemMonitorService';
import { eventBus } from '@core/event-bus';

export const FloatingBubble: React.FC = () => {
  const { 
    isPanelOpen, 
    togglePanel, 
    unreadNotificationCount, 
    theme, 
    settings 
  } = useAppStore();

  const [pos, setPos] = useState(windowManager.getPosition());
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cpuPct, setCpuPct] = useState(18);

  const isDraggingRef = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  // Sync position from windowManager events
  useEffect(() => {
    const handler = (newPos: { x: number; y: number }) => setPos({ ...newPos });
    eventBus.on('WINDOW_POSITION_CHANGED', handler);
    return () => eventBus.off('WINDOW_POSITION_CHANGED', handler);
  }, []);

  // Keep windowManager's bubbleSize in sync with settings
  useEffect(() => {
    windowManager.setBubbleSize(settings.bubbleSize);
    windowManager.updateScreenBounds();
  }, [settings.bubbleSize]);

  // CPU monitor
  useEffect(() => {
    systemMonitorService.startMonitoring(2000);
    const interval = setInterval(() => {
      setCpuPct(systemMonitorService.getMetrics().cpuUsagePct);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Drag: use incremental mouse deltas to avoid stale-ref position drift ──
  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (!isDraggingRef.current && Math.abs(dx) + Math.abs(dy) > 3) {
      isDraggingRef.current = true;
      setIsDragging(true);
    }
    if (isDraggingRef.current) {
      windowManager.moveDelta(dx, dy);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (isDraggingRef.current) {
      windowManager.setPosition(windowManager.getPosition(), settings.snapToEdge);
    }
    lastMousePos.current = null;
    isDraggingRef.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleClick = () => {
    if (!isDraggingRef.current) {
      togglePanel();
    }
  };

  const currentOpacity = isHovered 
    ? 1.0 
    : isPanelOpen 
    ? 1.0 
    : settings.idleOpacity;

  const size = settings.bubbleSize;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: size,
        height: size,
        zIndex: 9999,
        pointerEvents: 'auto',
        touchAction: 'none',
        // cursor: grab is what cursor-changed in main.ts detects to disable pass-through.
        // MUST remain 'grab' (or 'grabbing') — do NOT set to 'default'.
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      animate={{
        scale: isHovered && !isDragging ? 1.08 : 1.0,
        opacity: currentOpacity,
      }}
      transition={springPresets.snappy}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => {
        setIsHovered(true);
        if (!isPanelOpen) bubbleFSM.transitionTo('hover');
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        if (!isPanelOpen) bubbleFSM.transitionTo('idle');
      }}
      onClick={handleClick}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: settings.cornerRadius,
          backgroundColor: theme.bgGlass,
          borderColor: theme.borderGlass,
          backdropFilter: `blur(${theme.blurIntensity}px)`,
          WebkitBackdropFilter: `blur(${theme.blurIntensity}px)`,
          boxShadow: isHovered ? `0 0 25px ${theme.accentGlow}` : theme.shadowDepth,
          border: `1px solid ${theme.borderGlass}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
        title="Desktop Action Hub (Click to Toggle / Drag to Move)"
      >
        {/* Animated Accent Ring */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: settings.cornerRadius,
            boxShadow: `inset 0 0 12px ${theme.accentGlow}`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
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
              <Layers className="w-6 h-6 text-slate-200" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CPU Activity Ring */}
        <svg 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', padding: 4 }}
          viewBox="0 0 36 36"
        >
          <path
            style={{ color: 'rgba(255,255,255,0.1)' }}
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

        {/* Unread Badge */}
        {unreadNotificationCount > 0 && !isPanelOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              padding: '0 3px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontWeight: 700,
              fontSize: 10,
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              border: '2px solid #0f172a',
            }}
          >
            {unreadNotificationCount}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};
