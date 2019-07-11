// Node libs
import * as url from 'url';
import * as path from 'path';

// Local imports
import { downloadManager } from './assets/electron/download-manager';

// IPC handlers
import * as IPCs from './assets/electron/ipc';
const ipcHandlers = Object.values(IPCs).filter(item => typeof item === 'function');

// Libraries
import { app, BrowserWindow, ipcMain } from 'electron';

// Define a main window
let mainWindow: BrowserWindow;

// Handle second instance creation
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// CLI commands
const commands = {
  dev: process.argv.indexOf('-dev') !== -1
};

// Create main window on ready
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 910,
    minHeight: 500,
    frame: false,
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      textAreasAreResizable: false,
    },
    show: false,
    title: 'bridge',
    simpleFullscreen: true,
    fullscreenable: false
  });

  // Determine load settings
  const loadUrl = {
    pathname: commands.dev ? '//localhost:1234/' : path.join(__dirname, 'index.html'),
    protocol: commands.dev ? 'http:' : 'file:',
    slashes: true
  };

  // Configure download manager with an IPC callback message
  downloadManager.onUpdateCallback = currentDownloads => mainWindow.webContents.send('downloads-updated', currentDownloads);

  ipcHandlers.forEach((Handler: any) => {
    const handler = new Handler(mainWindow);
    ipcMain.addListener(Handler.prototype._options.event, (event, ...data) => handler.action(event, ...data));
  });

  // Load browser content
  mainWindow.loadURL( url.format(loadUrl) );

  // Open the DevTools.
  if (commands.dev) mainWindow.webContents.openDevTools();

  // Don't use a system menu
  mainWindow.setMenu(null);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());
