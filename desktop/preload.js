/* Pont minimal entre le jeu et l'application de bureau : plein écran, quitter, informations (version, dossier de sauvegarde). */
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("arkDesktop", {
  toggleFullscreen: () => ipcRenderer.send("ark:fullscreen"),
  quit: () => ipcRenderer.send("ark:quit"),
  info: () => ipcRenderer.sendSync("ark:info")
});
