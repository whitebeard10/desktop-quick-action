import React, { useEffect } from 'react';
import { FloatingBubble } from './components/bubble/FloatingBubble';
import { ActionPanel } from './components/panel/ActionPanel';
import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const { initEngines, theme } = useAppStore();

  useEffect(() => {
    initEngines();
  }, [initEngines]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent select-none p-3 flex items-center justify-center">
      <FloatingBubble />
      <ActionPanel />
    </div>
  );
};

export default App;
