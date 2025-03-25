const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const remote = require('@electron/remote/main');
const { enable } = require('@electron/remote/main');

// Initialize remote module
remote.initialize();
require('./src/services/store');

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  import('electron-debug').then(({ default: debug }) => debug({ showDevTools: true }));
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'src/preload.js')
    },
    backgroundColor: '#1E1F22'
  });

  // Remove remote module
  if (isDev) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"]
        }
      });
    });
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
    require('./src/utils/devUtils').installDevTools();
  } else {
    mainWindow.loadFile('index.html');
  }

  // Handle window control events
  ipcMain.on('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow.close();
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
