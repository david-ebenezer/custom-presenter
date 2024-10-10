const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');

let adminWindow;
let displayWindow;

function createWindows() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  // Create the admin window on the primary display
  adminWindow = new BrowserWindow({
    width: primaryDisplay.workAreaSize.width,
    height: primaryDisplay.workAreaSize.height,
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  adminWindow.loadFile(path.join(__dirname, 'public/index.html'));

  // Create the display window for the secondary screen
  if (displays.length > 1) {
    const secondaryDisplay = displays.find(display => display.id !== primaryDisplay.id);
    displayWindow = new BrowserWindow({
      width: secondaryDisplay.workAreaSize.width,
      height: secondaryDisplay.workAreaSize.height,
      x: secondaryDisplay.bounds.x,
      y: secondaryDisplay.bounds.y,
      fullscreen: true,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    });
  } else {
    // Fallback to creating display window on primary screen if no secondary display
    displayWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      fullscreen: true,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    });
  }

  displayWindow.loadFile(path.join(__dirname, 'public/screen1.html'));
}

app.whenReady().then(() => {
  createWindows();

  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Movies', extensions: ['mp4', 'mkv', 'avi'] }]
    });
    if (!canceled) {
      displayWindow.webContents.send('play-video', filePaths[0]);
      return filePaths[0];
    }
  });

  ipcMain.on('play-video', (event, videoPath) => {
    displayWindow.webContents.send('play-video', videoPath);
  });

  ipcMain.handle('get-text', () => {
    return 'Sample text from main process';
  });

  ipcMain.on('text-update', (event, text) => {
    displayWindow.webContents.send('text-update', text);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});