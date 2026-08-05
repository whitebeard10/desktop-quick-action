import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  launchApp: (pathOrExe: string) => ipcRenderer.invoke('app:launch', pathOrExe),
  openExternal: (url: string) => ipcRenderer.invoke('app:launch', url),
  getSystemMetrics: () => ipcRenderer.invoke('system:metrics'),
  moveWindow: (x: number, y: number) => ipcRenderer.send('window:move', x, y),
  onHotkeyToggle: (callback: () => void) => {
    ipcRenderer.on('hotkey-toggle', () => callback());
  },
});
