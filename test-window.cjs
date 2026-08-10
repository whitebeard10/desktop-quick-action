const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    x: 200,
    y: 200,
    show: true,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    backgroundColor: '#ff0000',  // bright red — impossible to miss
  });

  win.loadURL('data:text/html,<h1 style="color:white;font-size:48px;padding:40px">ELECTRON WORKS</h1>');
  
  console.log('[TEST] Window created at 200,200 - 800x600');
  console.log('[TEST] Bounds:', JSON.stringify(win.getBounds()));
  console.log('[TEST] Visible:', win.isVisible());
});
