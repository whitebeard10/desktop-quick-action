import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  launchApp: (pathOrExe: string) => ipcRenderer.invoke('app:launch', pathOrExe),
  openExternal: (url: string) => ipcRenderer.invoke('app:launch', url),
  getSystemMetrics: () => ipcRenderer.invoke('system:metrics'),
  getScreenBounds: () => ipcRenderer.invoke('system:screen-bounds'),
  getWindowPosition: () => ipcRenderer.invoke('window:get-position'),
  moveWindow: (x: number, y: number) => ipcRenderer.send('window:move', x, y),
  moveWindowDelta: (deltaX: number, deltaY: number) => ipcRenderer.invoke('window:move-delta', deltaX, deltaY),
  setWindowSize: (width: number, height: number) => ipcRenderer.invoke('window:set-size', width, height),
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.send('window:set-ignore-mouse-events', ignore),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  hideToTray: () => ipcRenderer.invoke('window:hide'),
  onHotkeyToggle: (callback: () => void) => {
    ipcRenderer.on('hotkey-toggle', () => callback());
  },
});
