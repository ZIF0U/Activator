const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  generateCode: (deviceId) => ipcRenderer.invoke('generate-code', deviceId),
});
