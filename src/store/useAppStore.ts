import { create } from 'zustand';
import { AppItem, Profile, ThemeConfig, ThemePreset, AppSettings, WidgetInstance, NotificationItem, SearchResultItem } from '@/types';
import { eventBus } from '@core/event-bus';
import { bubbleFSM } from '@core/bubble-state-machine';
import { windowManager } from '@core/window-manager';
import { actionEngine } from '@core/action-engine';
import { searchEngine } from '@core/search-engine';
import { widgetRuntime } from '@core/widget-runtime';
import { pluginHost } from '@core/plugin-host';
import { notificationManager } from '@core/notification-manager';
import { repository } from '@core/repository';
import { interactionEngine } from '@core/interaction-engine';

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  Glass: {
    id: 'Glass',
    name: 'Windows 11 Acrylic Glass',
    mode: 'dark',
    bgGlass: 'rgba(15, 23, 42, 0.75)',
    borderGlass: 'rgba(255, 255, 255, 0.15)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accentColor: '#0078d4',
    accentGlow: 'rgba(0, 120, 212, 0.5)',
    blurIntensity: 24,
    shadowDepth: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  Dark: {
    id: 'Dark',
    name: 'Sleek Dark',
    mode: 'dark',
    bgGlass: 'rgba(18, 18, 24, 0.92)',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#f1f5f9',
    textSecondary: '#64748b',
    accentColor: '#3b82f6',
    accentGlow: 'rgba(59, 130, 246, 0.5)',
    blurIntensity: 16,
    shadowDepth: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  Light: {
    id: 'Light',
    name: 'Fluent Light',
    mode: 'light',
    bgGlass: 'rgba(255, 255, 255, 0.82)',
    borderGlass: 'rgba(0, 0, 0, 0.1)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accentColor: '#0284c7',
    accentGlow: 'rgba(2, 132, 199, 0.4)',
    blurIntensity: 20,
    shadowDepth: '0 10px 25px rgba(0, 0, 0, 0.12)',
  },
  AMOLED: {
    id: 'AMOLED',
    name: 'Pure OLED Pitch Black',
    mode: 'dark',
    bgGlass: 'rgba(0, 0, 0, 0.95)',
    borderGlass: 'rgba(255, 255, 255, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accentColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.6)',
    blurIntensity: 8,
    shadowDepth: '0 0 0 1px rgba(255, 255, 255, 0.15)',
  },
  Minimal: {
    id: 'Minimal',
    name: 'Minimalist Slate',
    mode: 'dark',
    bgGlass: 'rgba(30, 41, 59, 0.85)',
    borderGlass: 'rgba(255, 255, 255, 0.05)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accentColor: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    blurIntensity: 12,
    shadowDepth: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  Material: {
    id: 'Material',
    name: 'Material You Vibrant',
    mode: 'dark',
    bgGlass: 'rgba(23, 15, 38, 0.82)',
    borderGlass: 'rgba(216, 180, 254, 0.2)',
    textPrimary: '#faf5ff',
    textSecondary: '#c084fc',
    accentColor: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.5)',
    blurIntensity: 28,
    shadowDepth: '0 15px 35px rgba(236, 72, 153, 0.2)',
  },
  Fluent: {
    id: 'Fluent',
    name: 'Windows 11 Mica',
    mode: 'dark',
    bgGlass: 'rgba(32, 38, 46, 0.88)',
    borderGlass: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    accentColor: '#0078d4',
    accentGlow: 'rgba(0, 120, 212, 0.4)',
    blurIntensity: 30,
    shadowDepth: '0 16px 32px rgba(0, 0, 0, 0.35)',
  },
};

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'p-work',
    name: 'Work & Productivity',
    icon: 'Briefcase',
    description: 'Optimized for development, office tasks, and document management.',
    accentColor: '#0078d4',
    favoriteAppIds: ['a-vscode', 'a-chrome', 'a-terminal', 'a-notion'],
    activeWidgets: ['w-weather', 'w-notes', 'w-calendar', 'w-cpu_ram'],
  },
  {
    id: 'p-gaming',
    name: 'Gaming & Performance',
    icon: 'Gamepad2',
    description: 'High performance gaming apps, Discord chat, and hardware monitors.',
    accentColor: '#a855f7',
    favoriteAppIds: ['a-steam', 'a-discord', 'a-spotify'],
    activeWidgets: ['w-cpu_ram', 'w-music', 'w-battery'],
  },
  {
    id: 'p-school',
    name: 'School & Study',
    icon: 'GraduationCap',
    description: 'Research tools, scratchpad notes, study timer, and calendar.',
    accentColor: '#10b981',
    favoriteAppIds: ['a-chrome', 'a-notion', 'a-spotify'],
    activeWidgets: ['w-notes', 'w-timer', 'w-calendar'],
  },
  {
    id: 'p-design',
    name: 'Design & Creative',
    icon: 'Palette',
    description: 'Creative suite shortcuts, clipboard manager, and color inspiration.',
    accentColor: '#ec4899',
    favoriteAppIds: ['a-figma', 'a-chrome', 'a-notion'],
    activeWidgets: ['w-clipboard', 'w-music', 'w-weather'],
  },
];

export const INITIAL_APPS: AppItem[] = [
  {
    id: 'a-vscode',
    title: 'Visual Studio Code',
    icon: 'Code2',
    pathOrUrl: 'vscode',
    type: 'exe',
    category: 'Development',
    isPinned: true,
    launchCount: 42,
    profileId: 'p-work',
  },
  {
    id: 'a-terminal',
    title: 'Windows Terminal',
    icon: 'Terminal',
    pathOrUrl: 'terminal',
    type: 'exe',
    category: 'Development',
    isPinned: true,
    launchCount: 38,
    profileId: 'p-work',
  },
  {
    id: 'a-discord',
    title: 'Discord Desktop',
    icon: 'MessageSquare',
    pathOrUrl: 'discord',
    type: 'exe',
    category: 'Media',
    isPinned: true,
    launchCount: 29,
    profileId: 'p-gaming',
  },
  {
    id: 'a-ytmusic',
    title: 'YouTube Music',
    icon: 'Music2',
    pathOrUrl: 'ytmusic',
    type: 'exe',
    category: 'Media',
    isPinned: true,
    launchCount: 25,
    profileId: 'p-work',
  },
  {
    id: 'a-calculator',
    title: 'Windows Calculator',
    icon: 'Calculator',
    pathOrUrl: 'calculator',
    type: 'exe',
    category: 'Utilities',
    isPinned: true,
    launchCount: 18,
    profileId: 'p-work',
  },
  {
    id: 'a-chrome',
    title: 'Google Chrome',
    icon: 'Globe',
    pathOrUrl: 'https://google.com',
    type: 'url',
    category: 'Work',
    isPinned: true,
    launchCount: 89,
    profileId: 'p-work',
  },
  {
    id: 'a-notion',
    title: 'Notion Workspace',
    icon: 'FileSpreadsheet',
    pathOrUrl: 'https://notion.so',
    type: 'url',
    category: 'Utilities',
    isPinned: true,
    launchCount: 19,
    profileId: 'p-work',
  },
  {
    id: 'a-spotify',
    title: 'Spotify Player',
    icon: 'Music',
    pathOrUrl: 'https://open.spotify.com',
    type: 'url',
    category: 'Media',
    isPinned: true,
    launchCount: 35,
    profileId: 'p-work',
  },
  {
    id: 'a-steam',
    title: 'Steam Launcher',
    icon: 'Gamepad2',
    pathOrUrl: 'steam://',
    type: 'exe',
    category: 'Gaming',
    isPinned: true,
    launchCount: 15,
    profileId: 'p-gaming',
  },
  {
    id: 'a-figma',
    title: 'Figma Web App',
    icon: 'Palette',
    pathOrUrl: 'https://figma.com',
    type: 'url',
    category: 'Utilities',
    isPinned: true,
    launchCount: 12,
    profileId: 'p-design',
  },
];

export const INITIAL_WIDGETS: WidgetInstance[] = [
  { id: 'w-weather', type: 'weather', title: 'Weather Forecast', isExpanded: true, refreshIntervalMs: 600000 },
  { id: 'w-battery', type: 'battery', title: 'Battery Monitor', isExpanded: false, refreshIntervalMs: 10000 },
  { id: 'w-clipboard', type: 'clipboard', title: 'Clipboard History', isExpanded: true, refreshIntervalMs: 0 },
  { id: 'w-calendar', type: 'calendar', title: 'Calendar & Schedule', isExpanded: true, refreshIntervalMs: 60000 },
  { id: 'w-notes', type: 'notes', title: 'Quick Scratchpad', isExpanded: true, refreshIntervalMs: 0 },
  { id: 'w-timer', type: 'timer', title: 'Stopwatch & Timer', isExpanded: false, refreshIntervalMs: 1000 },
  { id: 'w-music', type: 'music', title: 'Media Controller', isExpanded: true, refreshIntervalMs: 1000 },
  { id: 'w-downloads', type: 'downloads', title: 'Recent Downloads', isExpanded: false, refreshIntervalMs: 5000 },
  { id: 'w-cpu_ram', type: 'cpu_ram', title: 'CPU & Memory Telemetry', isExpanded: true, refreshIntervalMs: 2000 },
];

interface AppState {
  // States
  activeProfile: Profile;
  profiles: Profile[];
  apps: AppItem[];
  widgets: WidgetInstance[];
  theme: ThemeConfig;
  settings: AppSettings;
  searchQuery: string;
  searchResults: SearchResultItem[];
  unreadNotificationCount: number;
  notifications: NotificationItem[];
  isPanelOpen: boolean;

  // Actions
  setActiveProfile: (profileId: string) => void;
  setThemePreset: (preset: ThemePreset) => void;
  updateThemeConfig: (custom: Partial<ThemeConfig>) => void;
  togglePanel: (override?: boolean) => void;
  launchApp: (app: AppItem) => void;
  addApp: (app: Omit<AppItem, 'id' | 'launchCount'>) => void;
  togglePinApp: (appId: string) => void;
  deleteApp: (appId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleWidgetExpand: (widgetId: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  initEngines: () => void;
}

const getInitialApps = (): AppItem[] => {
  const stored = repository.getItem<AppItem[]>('apps', []);
  if (!stored || stored.length === 0) return INITIAL_APPS;

  const existingIds = new Set(stored.map((a) => a.id));
  const missingDefaults = INITIAL_APPS.filter((a) => !existingIds.has(a.id));

  const updatedStored = stored.map((app) => {
    if (app.id === 'a-discord' && (app.pathOrUrl.includes('discord.com') || app.type === 'url')) {
      return { ...app, pathOrUrl: 'discord', type: 'exe' as const };
    }
    if (app.id === 'a-vscode' && app.pathOrUrl.includes('avina')) {
      return { ...app, pathOrUrl: 'vscode' };
    }
    if (app.id === 'a-terminal' && app.pathOrUrl === 'powershell.exe') {
      return { ...app, pathOrUrl: 'terminal' };
    }
    return app;
  });

  const merged = [...updatedStored, ...missingDefaults];
  repository.setItem('apps', merged);
  return merged;
};

export const useAppStore = create<AppState>((set, get) => ({
  activeProfile: repository.getItem('activeProfile', INITIAL_PROFILES[0]),
  profiles: repository.getItem('profiles', INITIAL_PROFILES),
  apps: getInitialApps(),
  widgets: repository.getItem('widgets', INITIAL_WIDGETS),
  theme: repository.getItem('theme', THEME_PRESETS.Glass),
  settings: repository.getItem('settings', {
    autoHide: false,
    autoHideDelaySec: 5,
    snapToEdge: true,
    idleOpacity: 0.7,
    bubbleSize: 56,
    cornerRadius: 16,
    globalHotkey: 'Ctrl+Space',
    launchAtStartup: false,
    animationSpeed: 'normal',
    soundEffects: true,
  }),
  searchQuery: '',
  searchResults: [],
  unreadNotificationCount: 2,
  notifications: notificationManager.getNotifications(),
  isPanelOpen: true,

  setActiveProfile: (profileId: string) => {
    const profile = get().profiles.find((p) => p.id === profileId);
    if (profile) {
      set({ activeProfile: profile });
      repository.setItem('activeProfile', profile);

      // Auto update accent color matching profile
      get().updateThemeConfig({ accentColor: profile.accentColor });
      eventBus.emit('NOTIFICATION_RECEIVED', {
        type: 'info',
        title: 'Profile Changed',
        message: `Active profile set to ${profile.name}`,
      });
    }
  },

  setThemePreset: (preset: ThemePreset) => {
    const newTheme = THEME_PRESETS[preset];
    if (newTheme) {
      set({ theme: newTheme });
      repository.setItem('theme', newTheme);
    }
  },

  updateThemeConfig: (custom: Partial<ThemeConfig>) => {
    const updated = { ...get().theme, ...custom };
    set({ theme: updated });
    repository.setItem('theme', updated);
  },

  togglePanel: (override?: boolean) => {
    const nextState = override !== undefined ? override : !get().isPanelOpen;
    set({ isPanelOpen: nextState });

    windowManager.setPanelOpen(nextState);

    if (nextState) {
      bubbleFSM.transitionTo('expanded');
    } else {
      bubbleFSM.transitionTo('idle');
    }
  },

  launchApp: async (app: AppItem) => {
    // Increment launch count
    const updatedApps = get().apps.map((item) =>
      item.id === app.id ? { ...item, launchCount: item.launchCount + 1 } : item
    );
    set({ apps: updatedApps });
    repository.setItem('apps', updatedApps);

    // Execute via Action Engine
    await actionEngine.execute({
      type: app.type === 'url' ? 'open_url' : 'launch_app',
      target: app.pathOrUrl,
    });
  },

  addApp: (newApp) => {
    const fullApp: AppItem = {
      ...newApp,
      id: `a-${Date.now()}`,
      launchCount: 0,
    };
    const updated = [...get().apps, fullApp];
    set({ apps: updated });
    repository.setItem('apps', updated);
    searchEngine.initializeIndex(updated, []);
  },

  togglePinApp: (appId: string) => {
    const updated = get().apps.map((a) => (a.id === appId ? { ...a, isPinned: !a.isPinned } : a));
    set({ apps: updated });
    repository.setItem('apps', updated);
  },

  deleteApp: (appId: string) => {
    const updated = get().apps.filter((a) => a.id !== appId);
    set({ apps: updated });
    repository.setItem('apps', updated);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    const results = searchEngine.search(query);
    set({ searchResults: results });
  },

  toggleWidgetExpand: (widgetId: string) => {
    const updated = get().widgets.map((w) =>
      w.id === widgetId ? { ...w, isExpanded: !w.isExpanded } : w
    );
    set({ widgets: updated });
    repository.setItem('widgets', updated);
  },

  updateSettings: (newSettings: Partial<AppSettings>) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    repository.setItem('settings', updated);
  },

  markNotificationsRead: () => {
    notificationManager.markAllAsRead();
    set({ unreadNotificationCount: 0, notifications: notificationManager.getNotifications() });
  },

  clearNotifications: () => {
    notificationManager.clearAll();
    set({ unreadNotificationCount: 0, notifications: [] });
  },

  initEngines: () => {
    // Initialize search engine index
    searchEngine.initializeIndex(get().apps, []);

    // Register active widgets in Widget Runtime
    get().widgets.forEach((w) => widgetRuntime.registerWidget(w));

    // Listen to global events
    eventBus.on('NOTIFICATIONS_UPDATED', (items: NotificationItem[]) => {
      set({
        notifications: items,
        unreadNotificationCount: items.filter((n) => !n.read).length,
      });
    });

    eventBus.on('HOTKEY_TOGGLE_TRIGGERED', () => {
      get().togglePanel();
    });

    eventBus.on('ESCAPE_KEY_TRIGGERED', () => {
      if (get().isPanelOpen) {
        get().togglePanel(false);
      }
    });

    // Start Interaction Engine
    interactionEngine.init();
  },
}));
