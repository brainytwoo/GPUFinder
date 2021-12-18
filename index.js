const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const windowStateKeeper = require('electron-window-state');
const path = require('path');
require('electron-window-manager');

// const database = require('./database');

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit',
});

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const BrowserView = electron.BrowserView;

// SET ENV
process.env.NODE_ENV = 'development';

let mainWindow;
let productView;

function createWindow(source) {

  // Load the previous state with fallback to defaults
  let windowState = windowStateKeeper({
    defaultWidth: 1366,
    defaultHeight: 768,
  });

  // Create the browser window.
  let win = new BrowserWindow({
    icon: 'src/media/icon.ico',
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
    }
  });

  windowState.manage(win);

  win.loadURL(source);

  // if (process.env.NODE_ENV == 'development')
  //   win.webContents.openDevTools();

  win.once('ready-to-show', () => {
    win.show();
  });

  return win;
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
    }
  }
})

ipcMain.on('xpath', function (event, xpath, inner) {
  console.log(xpath);
  console.log(inner);
  mainWindow.webContents.send('xpath', xpath, inner);
});

ipcMain.handle('loadURL', (event, source) => {
  console.log(source);

  if (mainWindow) {
    productView = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, 'src/js/preload.js')
      }
    });

    mainWindow.setBrowserView(productView);

    productView.setBounds({ 
      x: 25,
      y: 75,
      width: mainWindow.getBounds().width - 225 - 400,
      height: mainWindow.getBounds().height - 150
    });

    productView.setAutoResize({
      width: true,
      height: true
    });

    productView.webContents.loadURL(source);
  }
});


ipcMain.on('closeProductView', function (event) {
  if (productView) {
    mainWindow.setBrowserView(null);
    productView.webContents.destroy();
  }
});
