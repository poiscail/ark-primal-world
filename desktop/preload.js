/* Pont minimal entre le jeu et l'application de bureau : plein écran, quitter, informations (version, dossier de sauvegarde),
   options (fenêtre sans bordure, sauvegarde portable), copies de sauvegarde dans un dossier choisi, capture d'écran (F12),
   journal des plantages. */
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("arkDesktop", {
  toggleFullscreen: () => ipcRenderer.send("ark:fullscreen"),
  quit: () => ipcRenderer.send("ark:quit"),
  info: () => ipcRenderer.sendSync("ark:info"),
  opts: () => ipcRenderer.sendSync("ark:opts"),
  setOpt: (k, v) => ipcRenderer.send("ark:setOpt", k, v),
  relaunch: () => ipcRenderer.send("ark:relaunch"),
  pickDir: () => ipcRenderer.invoke("ark:pickDir"),
  backup: (name, content) => ipcRenderer.sendSync("ark:backup", name, content),
  noBackup: () => ipcRenderer.send("ark:noBackup"),
  portable: on => ipcRenderer.sendSync("ark:portable", !!on),
  crashLog: () => ipcRenderer.sendSync("ark:crashlog"),
  onShot: cb => ipcRenderer.on("ark:shot", (e, f) => cb(f))
});
