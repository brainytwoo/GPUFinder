const { app, BrowserWindow } = require('electron');
const ipcMain = require('electron').ipcMain;
const windowStateKeeper = require('electron-window-state');
const path = require('path');

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// SET ENV
process.env.NODE_ENV = 'development';

let mainWindow = null;

function createWindow() {

  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1366,
    defaultHeight: 768,
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    // icon: 'src/icons/icon.ico',
    show: false,
    frame: false,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  });

  mainWindowState.manage(mainWindow);

  mainWindow.loadURL(`file://${__dirname}/src/index.html`);

  if (process.env.NODE_ENV == 'development')
    mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.userAgentFallback = app.userAgentFallback.replace('Electron/' + process.versions.electron, '');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('windowAction', (event, action) => {
  if (mainWindow) {
    switch (action) {
      case 1:
          mainWindow.minimize();
        break;
      case 2:
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
        break;
      case 3:
        mainWindow.close();
        break;
      default:
        break;
    }
  }
})
