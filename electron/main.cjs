const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow = null;

// Determine projects directory:
// 1. If running as portable AppImage, look for ./projects next to the AppImage
// 2. Otherwise use ~/Documents/EsperanzaKonva/projects
function getProjectsDirectory() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const portableDir = path.join(process.env.PORTABLE_EXECUTABLE_DIR, "projects");
    return portableDir;
  }
  const localDir = path.join(process.cwd(), "projects");
  if (fs.existsSync(localDir)) {
    return localDir;
  }
  const docsDir = app.getPath("documents") || app.getPath("home");
  return path.join(docsDir, "EsperanzaKonva", "projects");
}

function ensureProjectsDirectory() {
  const projDir = getProjectsDirectory();
  try {
    if (!fs.existsSync(projDir)) {
      fs.mkdirSync(projDir, { recursive: true });
      console.log(`[EsperanzaKonva] Created projects directory at: ${projDir}`);
    }
  } catch (err) {
    console.error(`[EsperanzaKonva] Could not create projects directory:`, err);
  }
  return projDir;
}

function createWindow() {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "EsperanzaKonva Forge by FlaskArchitect",
    backgroundColor: "#07090E",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Ensure projects directory is ready on app startup
app.whenReady().then(() => {
  const projDir = ensureProjectsDirectory();

  // IPC Handlers
  ipcMain.handle("get-projects-path", () => {
    return ensureProjectsDirectory();
  });

  ipcMain.handle("open-projects-folder", async () => {
    const dir = ensureProjectsDirectory();
    await shell.openPath(dir);
    return true;
  });

  ipcMain.handle("save-project-file", async (event, { filename, content, isBinary }) => {
    try {
      const dir = ensureProjectsDirectory();
      const filePath = path.join(dir, filename);
      if (isBinary) {
        const buffer = Buffer.from(content);
        fs.writeFileSync(filePath, buffer);
      } else {
        fs.writeFileSync(filePath, content, "utf8");
      }
      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle("list-projects", async () => {
    try {
      const dir = ensureProjectsDirectory();
      const files = fs.readdirSync(dir);
      return { success: true, files, directory: dir };
    } catch (err) {
      return { success: false, error: String(err), files: [] };
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
