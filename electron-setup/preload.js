const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onTextUpdate: (callback) => ipcRenderer.on('text-update', (event, text) => callback(text)),
  sendTextUpdate: (text) => ipcRenderer.send('text-update', text)
});
