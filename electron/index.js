const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const url = require('url');

// Configuração para Hot Reload em desenvolvimento
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'build/logo.png')
  });

  if (isDev) {
    // Carrega o servidor de desenvolvimento do Angular (ng serve)
    mainWindow.loadURL('http://localhost:3000');
    // Abre o DevTools automaticamente em desenvolvimento
    mainWindow.webContents.openDevTools();
  } else {
    // Carrega o arquivo index.html estático em produção
    mainWindow.loadFile(path.join(__dirname, 'resources/app/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
