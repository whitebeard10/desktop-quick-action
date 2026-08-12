import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  launchApp: (pathOrExe: string) => ipcRenderer.invoke('app:launch', pathOrExe),
  openExternal: (url: string) => ipcRenderer.invoke('app:launch', url),
  getSystemMetrics: () => ipcRenderer.invoke('system:metrics'),
  getScreenBounds: () => ipcRenderer.invoke('system:screen-bounds'),
  // Returns { screenWidth, screenHeight } for initial bubble placement
  getWindowPosition: () => ipcRenderer.invoke('window:get-position'),
  // Pass-through toggle: false = bubble/panel is under cursor, true = transparent background
  // Notify main of panel open/close so cursor:default inside panel doesn't re-enable pass-through
  setPanelOpen: (open: boolean) => ipcRenderer.send('panel:state-changed', open),
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.send('window:set-ignore-mouse-events', ignore),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  hideToTray: () => ipcRenderer.invoke('window:hide'),
  onHotkeyToggle: (callback: () => void) => {
    ipcRenderer.on('hotkey-toggle', () => callback());
  },
});
