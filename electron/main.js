const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  // Create the main window
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  // Load the admin interface HTML
  mainWindow.loadFile(path.join(__dirname, 'public/index.html'));

  // Create the display window without a menu bar
  const screen1Window = new BrowserWindow({
    width: 800,
    height: 600,
    x: 1920, // Position it on the second screen (adjust as needed)
    frame: false, // Remove the frame and menu bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  // Load the display HTML
  screen1Window.loadFile(path.join(__dirname, 'public/screen1.html'));
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('get-text', () => {
    return 'Sample text from main process';
  });

  ipcMain.on('text-update', (event, text) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('text-update', text);
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
