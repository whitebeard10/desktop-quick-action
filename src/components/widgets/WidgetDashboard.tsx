import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WeatherWidget } from './WeatherWidget';
import { BatteryWidget } from './BatteryWidget';
import { ClipboardWidget } from './ClipboardWidget';
import { CalendarWidget } from './CalendarWidget';
import { NotesWidget } from './NotesWidget';
import { TimerWidget } from './TimerWidget';
import { MusicWidget } from './MusicWidget';
import { DownloadsWidget } from './DownloadsWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';

export const WidgetDashboard: React.FC = () => {
  const { activeProfile, widgets } = useAppStore();

  const renderWidget = (type: string) => {
    switch (type) {
      case 'weather':
        return <WeatherWidget key={type} />;
      case 'battery':
        return <BatteryWidget key={type} />;
      case 'clipboard':
        return <ClipboardWidget key={type} />;
      case 'calendar':
        return <CalendarWidget key={type} />;
      case 'notes':
        return <NotesWidget key={type} />;
      case 'timer':
        return <TimerWidget key={type} />;
      case 'music':
        return <MusicWidget key={type} />;
      case 'downloads':
        return <DownloadsWidget key={type} />;
      case 'cpu_ram':
        return <SystemMonitorWidget key={type} />;
      default:
        return null;
    }
  };

  // activeWidgets stores IDs like 'w-weather'; switch cases expect bare types like 'weather'
  const activeTypes = activeProfile.activeWidgets.map((id) => id.replace(/^w-/, ''));

  return (
    <div className="space-y-3 p-1 max-h-[500px] overflow-y-auto pr-1">
      {activeTypes.map((type) => renderWidget(type))}
    </div>
  );
};
