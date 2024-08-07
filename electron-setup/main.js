const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

function createWindow() {
  // Create the main window
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'public/index.html'));

  // Get display information
  const displays = screen.getAllDisplays();
  const primaryScreen = displays[0]; // Use the first screen as fallback
  
  // Create the display window for the second screen
  let screen1Window;
  if (displays.length > 1) {
    const secondScreen = displays[1]; // Use the second screen
    screen1Window = new BrowserWindow({
      width: secondScreen.size.width,
      height: secondScreen.size.height,
      x: secondScreen.bounds.x,
      y: secondScreen.bounds.y,
      fullscreen: true, // Make the window fullscreen
      frame: false, // Remove the frame and menu bar
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    });
  } else {
    // Fallback to the primary screen
    screen1Window = new BrowserWindow({
      width: 1920,
      height: 1080,
      x: primaryScreen.bounds.x,
      y: primaryScreen.bounds.y,
      frame: false, // Remove the frame and menu bar
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    });
  }

  // Load the display HTML
  screen1Window.loadFile(path.join(__dirname, 'public/screen1.html'));

  // Create another display window for screen2.html
  const screen2Window = new BrowserWindow({
    width: 1920,
    height: 1080,
    x: 1920, // Adjust position as needed
    y: 600, // Adjust position as needed
    frame: true, // Show frame and menu bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  screen2Window.loadFile(path.join(__dirname, 'public/screen2.html'));
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
