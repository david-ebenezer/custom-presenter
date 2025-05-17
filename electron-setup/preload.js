const { contextBridge, ipcRenderer } = require('electron');

// Create a safe wrapper for ipcRenderer
const safeIpcRenderer = {
  on: (channel, callback) => {
    const validChannels = ['play-video', 'text-update'];
    if (validChannels.includes(channel)) {
      // Remove the event parameter from the callback
      ipcRenderer.on(channel, (_, ...args) => callback(...args));
    }
  },
  send: (channel, data) => {
    const validChannels = ['play-video', 'text-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
};

contextBridge.exposeInMainWorld('electron', {
  onTextUpdate: (callback) => {
    ipcRenderer.on('update-text', (event, data) => callback(data));
  },
  sendTextUpdate: (text) => ipcRenderer.send('text-update', text)
});

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: (type) => ipcRenderer.invoke('dialog:openFile', type),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  getProPresenterFiles: (folderPath) => ipcRenderer.invoke('get-propresenter-files', folderPath),
  
  // Video operations
  sendVideoPath: (path) => ipcRenderer.send('play-video', path),
  onVideoPath: (callback) => {
    ipcRenderer.on('play-video', (_, path) => callback(path));
  },
  sendVideoControl: (data) => ipcRenderer.send('video-control', data),
  onVideoControl: (callback) => {
    ipcRenderer.on('video-control', (_, data) => callback(data));
  },
  onVideoTimeUpdate: (callback) => {
    ipcRenderer.on('video-time-update', (_, data) => callback(data));
  },
  
  // Text operations
  sendTextUpdate: (data) => {
    console.log('Sending text update from preload:', data);
    ipcRenderer.send('text-update', data);
  },
  onTextUpdate: (callback) => {
    console.log('Setting up text update listener in preload');
    ipcRenderer.on('text-update', (_, data) => {
      console.log('Received text update in preload:', data);
      callback(data);
    });
  }
});

// Expose the safe ipcRenderer wrapper
contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, data) => {
    const validChannels = ['update-text', 'play-video', 'video-control', 'video-time-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, callback) => {
    const validChannels = ['play-video', 'video-control', 'video-time-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  }
});
