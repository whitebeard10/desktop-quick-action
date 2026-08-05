export type BubbleState = 
  | 'idle' 
  | 'hover' 
  | 'dragging' 
  | 'expanded' 
  | 'hidden' 
  | 'notification' 
  | 'disabled' 
  | 'loading' 
  | 'error';

export type CategoryType = 'All' | 'Work' | 'Development' | 'Media' | 'Gaming' | 'Utilities';

export interface AppItem {
  id: string;
  title: string;
  icon: string;
  pathOrUrl: string;
  type: 'exe' | 'lnk' | 'store' | 'url' | 'script' | 'folder';
  category: CategoryType;
  isPinned: boolean;
  launchCount: number;
  profileId: string;
  hotkey?: string;
}

export interface Profile {
  id: string;
  name: string;
  icon: string;
  description: string;
  accentColor: string;
  favoriteAppIds: string[];
  activeWidgets: string[];
}

export type ThemePreset = 'Glass' | 'Dark' | 'Light' | 'AMOLED' | 'Minimal' | 'Material' | 'Fluent';

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  mode: 'dark' | 'light';
  bgGlass: string;
  borderGlass: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  accentGlow: string;
  blurIntensity: number; // in px
  shadowDepth: string;
}

export type WidgetType = 
  | 'weather' 
  | 'battery' 
  | 'clipboard' 
  | 'calendar' 
  | 'notes' 
  | 'timer' 
  | 'music' 
  | 'downloads' 
  | 'cpu_ram';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  isExpanded: boolean;
  refreshIntervalMs: number;
  settings?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface AppSettings {
  autoHide: boolean;
  autoHideDelaySec: number;
  snapToEdge: boolean;
  idleOpacity: number; // 0.1 - 1.0
  bubbleSize: number; // in px (40 - 80)
  cornerRadius: number; // in px (0 - 32)
  globalHotkey: string; // e.g. 'Ctrl+Space'
  launchAtStartup: boolean;
  animationSpeed: 'fast' | 'normal' | 'relaxed';
  soundEffects: boolean;
}

export interface ActionPayload {
  type: 'launch_app' | 'open_url' | 'switch_profile' | 'toggle_panel' | 'trigger_widget' | 'execute_command';
  target: string;
  metadata?: Record<string, any>;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'app' | 'file' | 'url' | 'command' | 'widget' | 'setting';
  icon: string;
  action: ActionPayload;
  score: number;
}
