const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getProjectsPath: () => ipcRenderer.invoke("get-projects-path"),
  openProjectsFolder: () => ipcRenderer.invoke("open-projects-folder"),
  saveProjectFile: (filename, content, isBinary = false) =>
    ipcRenderer.invoke("save-project-file", { filename, content, isBinary }),
  loadProjectFile: (filename) => ipcRenderer.invoke("load-project-file", filename),
  listProjects: () => ipcRenderer.invoke("list-projects"),
  listMp3Files: () => ipcRenderer.invoke("list-mp3-files"),
  openMp3Folder: () => ipcRenderer.invoke("open-mp3-folder"),
});
