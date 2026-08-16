import React, { useEffect, useState } from 'react';
import { FloatingBubble } from './components/bubble/FloatingBubble';
import { ActionPanel } from './components/panel/ActionPanel';
import { useAppStore } from './store/useAppStore';
import { windowManager, PanelLayoutState } from '@core/window-manager';
import { eventBus } from '@core/event-bus';

export const App: React.FC = () => {
  const { initEngines, isPanelOpen } = useAppStore();
  const [layout, setLayout] = useState<PanelLayoutState>(windowManager.getLayoutState());

  useEffect(() => {
    initEngines();
  }, [initEngines]);

  useEffect(() => {
    const unsub = eventBus.on('PANEL_LAYOUT_CHANGED', (newLayout: PanelLayoutState) => {
      setLayout(newLayout);
    });
    return () => unsub();
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        minWidth: '100%',
        minHeight: '100%',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: isPanelOpen ? layout.bubbleRelX : 0,
          top: isPanelOpen ? layout.bubbleRelY : 0,
        }}
      >
        <FloatingBubble />
      </div>

      {isPanelOpen && (
        <div
          style={{
            position: 'absolute',
            left: layout.panelRelX,
            top: layout.panelRelY,
          }}
        >
          <ActionPanel />
        </div>
      )}
    </div>
  );
};

export default App;
