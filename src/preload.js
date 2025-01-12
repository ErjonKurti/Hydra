import { contextBridge, ipcRenderer } from 'electron';

// Expose methods to interact with Electron's main process
contextBridge.exposeInMainWorld('electron', {
  checkUser: (username, password) => ipcRenderer.invoke('check-user', { username, password }),
  registerUser: (username, email, password) => ipcRenderer.invoke('register-user', { username, email, password }),
  logOut: () => ipcRenderer.invoke('log-out')
});
