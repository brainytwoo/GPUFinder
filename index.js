const { app, BrowserView, BrowserWindow } = require('electron');
const ipcMain = require('electron').ipcMain;
const windowStateKeeper = require('electron-window-state');
const path = require('path');

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// SET ENV
process.env.NODE_ENV = 'development';

let mainWindow = null;

function createWindow(source) {

  // Load the previous state with fallback to defaults
  let windowState = windowStateKeeper({
    defaultWidth: 1366,
    defaultHeight: 768,
  });

  // Create the browser window.
  let newWindow = new BrowserWindow({
    // icon: 'src/icons/icon.ico',
    show: false,
    frame: false,
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  });

  windowState.manage(newWindow);

  newWindow.loadURL(source);

  if (process.env.NODE_ENV == 'development')
    newWindow.webContents.openDevTools();

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  return newWindow;
}

app.userAgentFallback = app.userAgentFallback.replace('Electron/' + process.versions.electron, '');

app.whenReady().then(() => {
  mainWindow = createWindow(`file://${__dirname}/src/index.html`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow(`file://${__dirname}/src/index.html`);
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

ipcMain.on('xpath', function (event, xpath) {
  console.log(xpath);
});

ipcMain.handle('loadURL', (event, source) => {
  if (mainWindow) {
    const view = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, 'src/js/preload.js')
      }
    });
    mainWindow.setBrowserView(view)
    view.setBounds({ x: 200, y: 100, width: 992, height: 992 })
    view.webContents.loadURL(source)
    view.webContents.openDevTools();
  }
});
