import { app, BrowserWindow, ipcMain, globalShortcut, shell, Tray, Menu, nativeImage, screen } from 'electron';
import path from 'path';
import os from 'os';
import zlib from 'zlib';
import fs from 'fs';

// Work around GPU process crashes on some Windows systems (exit_code=-1073741819 / 0xC0000005).
// --disable-gpu forces software rendering, which is required for transparent windows
// on systems where the GPU process crashes.
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Build a proper PNG tray icon programmatically — no external file needed.
// Uses real PNG encoding (via zlib deflate) so Windows tray handles it correctly.
function createTrayIcon(): Electron.NativeImage {
  const size = 16;
  // Build RGBA pixel data
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Default: transparent
      rgba[i] = 0; rgba[i + 1] = 0; rgba[i + 2] = 0; rgba[i + 3] = 0;
      // Draw a diamond / chevron shape in blue (#63B3FF)
      const isUpper = y < 8;
      const col = isUpper ? (7 - y) : (y - 8);
      if (x >= col && x <= col + 3) {
        rgba[i] = 99; rgba[i + 1] = 179; rgba[i + 2] = 255; rgba[i + 3] = 255;
      }
    }
  }

  // Encode as a real PNG (IHDR + IDAT + IEND)
  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c = (c >>> 8) ^ crc32Table[(c ^ buf[n]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  const crc32Table = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    return table;
  })();

  function pngChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  // IHDR: width, height, bit-depth 8, color-type 6 (RGBA)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  // IDAT: each row prefixed with filter byte 0 (None)
  const rawData = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    rawData[rowStart] = 0; // filter: None
    rgba.copy(rawData, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }
  const compressed = zlib.deflateSync(rawData);

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG signature
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);

  return nativeImage.createFromBuffer(png);
}

function createTray() {
  try {
    tray = new Tray(createTrayIcon());
    tray.setToolTip('Desktop Action Hub');
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show / Hide', click: () => toggleWindowVisibility() },
      { type: 'separator' },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => toggleWindowVisibility());
  } catch (e) {
    console.warn('[Tray] Could not create tray icon:', e);
  }
}

function toggleWindowVisibility() {
  if (!mainWindow) return;
  if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createWindow() {
  const possiblePreloadPaths = [
    path.join(__dirname, '../preload/preload.mjs'),
    path.join(__dirname, 'preload.mjs'),
    path.join(__dirname, 'preload.cjs'),
    path.join(__dirname, 'preload.js'),
    path.join(app.getAppPath(), 'out/preload/preload.mjs'),
    path.join(app.getAppPath(), 'dist-electron/preload.cjs'),
  ];
  const preloadPath = possiblePreloadPaths.find((p) => fs.existsSync(p));

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: screenWidth,
    height: screenHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // electron-vite sets ELECTRON_RENDERER_URL in dev mode
  const devServerUrl = process.env['ELECTRON_RENDERER_URL']
    || process.env['MAIN_WINDOW_VITE_DEV_SERVER_URL'];
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    const possibleHtmlPaths = [
      path.join(__dirname, '../renderer/index.html'),
      path.join(__dirname, '../../dist/index.html'),
      path.join(__dirname, '../dist/index.html'),
      path.join(app.getAppPath(), 'out/renderer/index.html'),
      path.join(app.getAppPath(), 'dist/index.html'),
    ];
    const htmlPath = possibleHtmlPaths.find((p) => fs.existsSync(p));
    if (htmlPath) {
      mainWindow.loadFile(htmlPath);
    } else {
      console.error('[Window] Could not find index.html to load! Checked:', possibleHtmlPaths);
    }
  }

  // Show window once content is painted — with a timeout fallback
  // Track whether pass-through is currently enabled to avoid redundant calls
  let ignoreMouseEvents = true;
  let panelOpen = false;

  const applyIgnore = (ignore: boolean) => {
    if (ignore === ignoreMouseEvents || !mainWindow) return;
    ignoreMouseEvents = ignore;
    if (ignore) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  };

  // cursor-changed fires in the MAIN PROCESS whenever Chromium changes cursor style.
  // This is synchronous relative to mouse processing — no IPC round-trip race condition.
  // Bubble has cursor:grab, panel buttons have cursor:pointer.
  // Transparent overlay has cursor:default → re-enable pass-through.
  mainWindow.webContents.on('cursor-changed', (_event, type) => {
    if (panelOpen) {
      // Panel is open: full interaction mode regardless of cursor
      applyIgnore(false);
      return;
    }
    // Any non-default/non-none cursor means we're over an interactive element
    const interactive = type !== 'default' && type !== 'none';
    applyIgnore(!interactive);
  });

  // Track panel state so cursor:default elements inside the panel don't re-enable pass-through
  ipcMain.on('panel:state-changed', (_event, open: boolean) => {
    panelOpen = open;
    if (open) {
      applyIgnore(false);
    } else {
      applyIgnore(true);
    }
  });

  // in case GPU issues prevent 'ready-to-show' from firing.
  let shown = false;
  const showWindow = () => {
    if (shown || !mainWindow) return;
    shown = true;
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    // Start as click-through; cursor-changed will disable pass-through over the bubble
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  };
  mainWindow.once('ready-to-show', showWindow);
  setTimeout(showWindow, 1000); // fallback: force show after 1s

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Window] Renderer crashed:', details.reason, details.exitCode);
  });

  // Hide to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  globalShortcut.register('CommandOrControl+Space', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible() || mainWindow.isMinimized()) {
        mainWindow.show();
        mainWindow.focus();
      }
      mainWindow.webContents.send('hotkey-toggle');
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep running in tray — don't quit
});

app.on('before-quit', () => { isQuitting = true; });
app.on('will-quit', () => { globalShortcut.unregisterAll(); });

// ── IPC ──────────────────────────────────────────────────────────────────────

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
    for (const type in cpu.times) totalTick += (cpu.times as any)[type];
    totalIdle += cpu.times.idle;
  });
  return {
    cpuUsagePct: Math.round(100 - (totalIdle / totalTick) * 100) || 15,
    ramUsedMb: Math.round(usedMem),
    ramTotalMb: Math.round(totalMem),
    ramPct: Math.round((usedMem / totalMem) * 100),
  };
});

ipcMain.handle('system:screen-bounds', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  return { width, height };
});

ipcMain.handle('window:get-position', () => {
  // Now returns screen bounds so renderer can calculate initial bubble position
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  return { screenWidth: width, screenHeight: height };
});

// Renderer calls this when mouse enters/leaves the bubble or panel
ipcMain.on('window:set-ignore-mouse-events', (_: any, ignore: boolean) => {
  if (!mainWindow) return;
  if (ignore) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  } else {
    mainWindow.setIgnoreMouseEvents(false);
  }
});

ipcMain.handle('window:minimize', () => { mainWindow?.minimize(); });
ipcMain.handle('window:hide', () => { mainWindow?.hide(); });
