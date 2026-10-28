const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

// Linux GPU stability flags (prevents GPU crash on Wayland/X11)
app.commandLine.appendSwitch("disable-gpu-process-crash-limit");

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

// Determine MP3 audio directory (scans /public/mp3, /mp3, portable dir)
function getMp3Directory() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const portablePublic = path.join(process.env.PORTABLE_EXECUTABLE_DIR, "public", "mp3");
    if (fs.existsSync(portablePublic)) return portablePublic;
    const portableMp3 = path.join(process.env.PORTABLE_EXECUTABLE_DIR, "mp3");
    if (fs.existsSync(portableMp3)) return portableMp3;
  }
  const localPublic = path.join(process.cwd(), "public", "mp3");
  if (fs.existsSync(localPublic)) return localPublic;
  const localMp3 = path.join(process.cwd(), "mp3");
  if (fs.existsSync(localMp3)) return localMp3;
  const distMp3 = path.join(__dirname, "../dist", "mp3");
  if (fs.existsSync(distMp3)) return distMp3;
  const appPublic = path.join(__dirname, "../public", "mp3");
  if (fs.existsSync(appPublic)) return appPublic;
  return localPublic;
}

function ensureMp3Directory() {
  const mp3Dir = getMp3Directory();
  try {
    if (!fs.existsSync(mp3Dir)) {
      fs.mkdirSync(mp3Dir, { recursive: true });
      console.log(`[EsperanzaKonva] Created mp3 directory at: ${mp3Dir}`);
    }
  } catch (err) {
    console.error(`[EsperanzaKonva] Could not create mp3 directory:`, err);
  }
  return mp3Dir;
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

  ipcMain.handle("load-project-file", async (event, filename) => {
    try {
      const dir = ensureProjectsDirectory();
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        return { success: true, content, path: filePath };
      }
      return { success: false, error: "File not found" };
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

  // Dynamic MP3 Sound scanning (gets whatever is put in /public/mp3 or mp3/)
  ipcMain.handle("list-mp3-files", async () => {
    try {
      const dir = ensureMp3Directory();
      if (!fs.existsSync(dir)) {
        return [];
      }
      const files = fs.readdirSync(dir);
      return files
        .filter((f) => f.toLowerCase().endsWith(".mp3"))
        .map((f) => ({
          id: f,
          filename: f,
          title: f.replace(/\.mp3$/i, "").replace(/[-_]/g, " "),
          artist: "Soundtrack",
          url: `./mp3/${encodeURIComponent(f)}`,
        }));
    } catch (err) {
      console.warn("Could not list mp3 files:", err);
      return [];
    }
  });

  ipcMain.handle("open-mp3-folder", async () => {
    const dir = ensureMp3Directory();
    await shell.openPath(dir);
    return true;
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
