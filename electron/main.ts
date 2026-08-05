import { app, BrowserWindow, ipcMain, globalShortcut, shell } from 'electron';
import path from 'path';
import os from 'os';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  globalShortcut.register('CommandOrControl+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.webContents.send('hotkey-toggle');
      } else {
        mainWindow.show();
        mainWindow.webContents.send('hotkey-toggle');
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('app:launch', async (_: any, pathOrExe: string) => {
  try {
    if (pathOrExe.startsWith('http')) {
      await shell.openExternal(pathOrExe);
    } else {
      const { exec } = await import('child_process');
      exec(`"${pathOrExe}"`);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('system:metrics', async () => {
  const totalMem = os.totalmem() / (1024 * 1024);
  const freeMem = os.freemem() / (1024 * 1024);
  const usedMem = totalMem - freeMem;
  const cpus = os.cpus();
  
  let totalIdle = 0, totalTick = 0;
  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += (cpu.times as any)[type];
    }
    totalIdle += cpu.times.idle;
  });
  const cpuPct = Math.round(100 - (totalIdle / totalTick) * 100);

  return {
    cpuUsagePct: cpuPct || 15,
    ramUsedMb: Math.round(usedMem),
    ramTotalMb: Math.round(totalMem),
    ramPct: Math.round((usedMem / totalMem) * 100),
  };
});

ipcMain.handle('window:move', (_: any, x: number, y: number) => {
  if (mainWindow) {
    mainWindow.setPosition(Math.round(x), Math.round(y));
  }
});
