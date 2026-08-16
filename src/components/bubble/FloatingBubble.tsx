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

export const FloatingBubble: React.FC = () => {
  const { 
    isPanelOpen, 
    togglePanel, 
    unreadNotificationCount, 
    theme, 
    settings 
  } = useAppStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cpuPct, setCpuPct] = useState(18);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    winStartPos: { x: number; y: number };
    hasMoved: boolean;
  } | null>(null);

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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const pos = windowManager.getPosition();
    dragRef.current = {
      startX: e.screenX,
      startY: e.screenY,
      winStartPos: { ...pos },
      hasMoved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;

    const dx = e.screenX - dragRef.current.startX;
    const dy = e.screenY - dragRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      dragRef.current.hasMoved = true;
      setIsDragging(true);

      const targetX = dragRef.current.winStartPos.x + dx;
      const targetY = dragRef.current.winStartPos.y + dy;

      windowManager.setPosition({ x: targetX, y: targetY }, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    const hasMoved = dragRef.current.hasMoved;
    dragRef.current = null;
    setIsDragging(false);

    if (hasMoved) {
      const currentPos = windowManager.getPosition();
      windowManager.setPosition(currentPos, settings.snapToEdge);
    } else {
      togglePanel();
    }
  };

  const currentOpacity = isHovered || isDragging
    ? 1.0 
    : isPanelOpen 
    ? 1.0 
    : Math.max(0.7, settings?.idleOpacity ?? 0.85);

  const size = Math.max(48, settings?.bubbleSize ?? 56);

  return (
    <div
      style={{
        width: size,
        height: size,
        cursor: isDragging ? 'grabbing' : 'grab',
        flexShrink: 0,
        touchAction: 'none',
        userSelect: 'none',
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => {
        setIsHovered(true);
        if (!isPanelOpen) bubbleFSM.transitionTo('hover');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isPanelOpen) bubbleFSM.transitionTo('idle');
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        animate={{
          scale: isHovered && !isPanelOpen && !isDragging ? 1.08 : 1.0,
          opacity: currentOpacity,
        }}
        transition={springPresets.snappy}
        title="Desktop Action Hub (Click to Toggle / Drag to Move)"
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: settings?.cornerRadius ?? 16,
            backgroundColor: '#0f172a',
            borderColor: theme?.borderGlass || 'rgba(255, 255, 255, 0.3)',
            boxShadow: isHovered || isDragging 
              ? `0 0 30px ${theme?.accentGlow || 'rgba(59, 130, 246, 0.8)'}` 
              : '0 0 15px rgba(59, 130, 246, 0.4), 0 10px 25px rgba(0,0,0,0.8)',
            border: `2px solid ${theme?.borderGlass || 'rgba(255, 255, 255, 0.35)'}`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
          }}
        >
          {/* Animated Accent Ring */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: settings.cornerRadius,
              boxShadow: `inset 0 0 12px ${theme.accentGlow}`,
              opacity: isHovered || isDragging ? 1 : 0,
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
                pointerEvents: 'none',
              }}
            >
              {unreadNotificationCount}
            </motion.span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
