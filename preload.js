const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  generateCode: (deviceId) => ipcRenderer.invoke('generate-code', deviceId),
  generatePublicKey: (privateKey) => ipcRenderer.invoke('generate-public-key', privateKey),
  generateFinalKey: (privateKey, deviceId) => ipcRenderer.invoke('generate-final-key', privateKey, deviceId),
});
