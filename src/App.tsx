import React, { useEffect } from 'react';
import { FloatingBubble } from './components/bubble/FloatingBubble';
import { ActionPanel } from './components/panel/ActionPanel';
import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const { initEngines } = useAppStore();

  useEffect(() => {
    initEngines();
  }, [initEngines]);

  return (
    // Full-screen transparent overlay — pointer-events: none so the background
    // passes all clicks through to the desktop. Bubble + panel have pointer-events: auto.
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        userSelect: 'none',
        background: 'transparent',
      }}
    >
      <FloatingBubble />
      <ActionPanel />
    </div>
  );
};

export default App;
