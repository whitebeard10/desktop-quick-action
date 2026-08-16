import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  launchApp: (pathOrExe: string) => ipcRenderer.invoke('app:launch', pathOrExe),
  openExternal: (url: string) => ipcRenderer.invoke('app:launch', url),
  getSystemMetrics: () => ipcRenderer.invoke('system:metrics'),
  getScreenBounds: () => ipcRenderer.invoke('system:screen-bounds'),
  // Returns { screenWidth, screenHeight } for initial bubble placement
  getWindowPosition: () => ipcRenderer.invoke('window:get-position'),
  // Move the OS window to an absolute screen position
  moveWindow: (x: number, y: number) => ipcRenderer.send('window:move', x, y),
  // Resize the OS window (called when panel opens or closes)
  setWindowSize: (width: number, height: number) => ipcRenderer.invoke('window:set-size', width, height),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  hideToTray: () => ipcRenderer.invoke('window:hide'),
  onHotkeyToggle: (callback: () => void) => {
    ipcRenderer.on('hotkey-toggle', () => callback());
  },
  onPositionChanged: (callback: (pos: { x: number; y: number }) => void) => {
    ipcRenderer.on('window:position-changed', (_event, pos) => callback(pos));
  },
});
