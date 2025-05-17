const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let adminWindow;
let displayWindow1;
let displayWindow2;

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

  // Create display windows
  // Display 1
  displayWindow1 = new BrowserWindow({
    width: 1920,
    height: 1080,
    x: primaryDisplay.bounds.x + 100,
    y: primaryDisplay.bounds.y + 100,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  displayWindow1.loadFile(path.join(__dirname, 'public/screen1.html'));

  // Display 2
  displayWindow2 = new BrowserWindow({
    width: 1920,
    height: 1080,
    x: primaryDisplay.bounds.x + 200,
    y: primaryDisplay.bounds.y + 200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  displayWindow2.loadFile(path.join(__dirname, 'public/screen4.html'));

  // If we have additional displays, position the windows on them
  const secondaryDisplays = displays.filter(display => display.id !== primaryDisplay.id);
  if (secondaryDisplays.length > 0) {
    displayWindow1.setPosition(secondaryDisplays[0].bounds.x, secondaryDisplays[0].bounds.y);
    if (secondaryDisplays.length > 1) {
      displayWindow2.setPosition(secondaryDisplays[1].bounds.x, secondaryDisplays[1].bounds.y);
    }
  }
}

// Helper function to safely send messages to windows
function safeSendToWindow(window, channel, data) {
  if (window && !window.isDestroyed()) {
    window.webContents.send(channel, data);
  }
}

app.whenReady().then(() => {
  createWindows();

  ipcMain.handle('dialog:openFile', async (event, type) => {
    const filters = type === 'video' 
      ? [{ name: 'Movies', extensions: ['mp4', 'mkv', 'avi'] }]
      : [{ name: 'ProPresenter Files', extensions: ['pro6'] }];
      
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: filters
    });
    
    if (!canceled && filePaths && filePaths.length > 0) {
      if (type === 'video') {
        const videoPath = filePaths[0];
        console.log('Sending video path to display windows:', videoPath);
        
        // Convert to absolute path if needed
        const absolutePath = path.resolve(videoPath);
        console.log('Absolute video path:', absolutePath);
        
        // Send to all display windows
        if (displayWindow1 && !displayWindow1.isDestroyed()) {
          displayWindow1.webContents.send('play-video', absolutePath);
        }
        if (displayWindow2 && !displayWindow2.isDestroyed()) {
          displayWindow2.webContents.send('play-video', absolutePath);
        }
      }
      return filePaths[0];
    }
    return null;
  });

  // Handle video control events
  ipcMain.on('video-control', (event, data) => {
    console.log('Received video control:', data);
    
    // Forward the control command to all display windows
    if (displayWindow1 && !displayWindow1.isDestroyed()) {
      displayWindow1.webContents.send('video-control', data);
    }
    if (displayWindow2 && !displayWindow2.isDestroyed()) {
      displayWindow2.webContents.send('video-control', data);
    }
  });

  // Handle video time updates
  ipcMain.on('video-time-update', (event, data) => {
    // Forward the time update to the admin window
    if (adminWindow && !adminWindow.isDestroyed()) {
      adminWindow.webContents.send('video-time-update', data);
    }
  });

  // Add new handler for opening folder
  ipcMain.handle('dialog:openFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    
    if (!canceled) {
      return filePaths[0];
    }
  });

  // Add new handler for getting ProPresenter files
  ipcMain.handle('get-propresenter-files', async (event, folderPath) => {
    try {
      console.log('Reading ProPresenter files from:', folderPath);
      const files = await fs.readdir(folderPath);
      const proPresenterFiles = [];
      
      for (const file of files) {
        if (file.toLowerCase().endsWith('.pro6')) {
          const filePath = path.join(folderPath, file);
          const stats = await fs.stat(filePath);
          proPresenterFiles.push({
            name: file,
            path: filePath,
            modified: stats.mtime
          });
        }
      }
      
      console.log('Found ProPresenter files:', proPresenterFiles.length);
      return proPresenterFiles;
    } catch (error) {
      console.error('Error reading ProPresenter files:', error);
      return [];
    }
  });

  // Add handler for reading files
  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      console.log('Reading file:', filePath);
      const content = await fs.readFile(filePath, 'utf8');
      console.log('File content length:', content.length);
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  });

  // Add handler for play-video event
  ipcMain.on('play-video', (event, videoPath) => {
    if (!videoPath) {
      console.error('Received undefined video path');
      return;
    }

    console.log('Received play-video event with path:', videoPath);
    // Convert to absolute path if needed
    const absolutePath = path.resolve(videoPath);
    console.log('Sending absolute video path:', absolutePath);
    
    // Send to all display windows
    if (displayWindow1 && !displayWindow1.isDestroyed()) {
      displayWindow1.webContents.send('play-video', absolutePath);
    }
    if (displayWindow2 && !displayWindow2.isDestroyed()) {
      displayWindow2.webContents.send('play-video', absolutePath);
    }
  });

  // Handle text updates
  ipcMain.on('text-update', (event, data) => {
    console.log('Received text update in main process:', data);
    
    // Send to all display windows
    if (displayWindow1 && !displayWindow1.isDestroyed()) {
      console.log('Sending to display window 1');
      displayWindow1.webContents.send('text-update', data);
    }
    if (displayWindow2 && !displayWindow2.isDestroyed()) {
      console.log('Sending to display window 2');
      displayWindow2.webContents.send('text-update', data);
    }
  });

  ipcMain.on('fetch-verse', (event, text) => {
    // Send to all display windows
    safeSendToWindow(displayWindow1, 'fetch-verse', text);
    safeSendToWindow(displayWindow2, 'fetch-verse', text);
  });
  
  // Add specific screen targeting
  ipcMain.on('text-update-screen1', (event, text) => {
    safeSendToWindow(displayWindow1, 'text-update', text);
  });
  
  ipcMain.on('text-update-screen2', (event, text) => {
    safeSendToWindow(displayWindow2, 'text-update', text);
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