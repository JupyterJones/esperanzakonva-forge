const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  getProjectsPath: () => ipcRenderer.invoke("get-projects-path"),
  openProjectsFolder: () => ipcRenderer.invoke("open-projects-folder"),
  saveProjectFile: (filename, content, isBinary = false) =>
    ipcRenderer.invoke("save-project-file", { filename, content, isBinary }),
  listProjects: () => ipcRenderer.invoke("list-projects"),
});
