const pkg = require('./package.json');

const { app, BrowserWindow, ipcMain } = require('electron');

const fs = require('fs');
const url = require('url');
const path = require('path');

const dataPath = app.getPath('userData');
const settingsPath = path.join(dataPath, 'settings.json');

const initialSettings = {
  browseSortType: 0,
  browseViewMode: 'details'
};

// Define a main window
let mainWindow;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  return;
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

/**
 * Create the main application window
 */
function createWindow () {
  // Parse CLI args
  let args = parseCommandLineArgs();

  // CLI commands
  let commands = {
    dev: args['dev'] // Load from Angular CLI IP
  }

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

  let loadUrl = {};

  // Determine load settings
  if (!!commands.dev) {
    loadUrl = {
      pathname: '//localhost:1234/',
      protocol: 'http:'
    };
  } else {
    loadUrl = {
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:'
    };
  }

  // Use slashes
  loadUrl.slashes = true;

  // Load
  mainWindow.loadURL( url.format(loadUrl) );

  // Open the DevTools.
  if (!!commands.dev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  });

  mainWindow.setMenu(null);
}

/**
 * Returns an object containing parsed CLI args
 */
function parseCommandLineArgs() {
  let result = {};

  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].indexOf('-') === 0) {
      let regEx = /^([-]*)/g;
      let command = process.argv[i].replace(regEx, '');
      let value = true;
      if ((i + 1 < process.argv.length) && (process.argv[i + 1].indexOf('-') !== 0)) {
        value = process.argv[i + 1];
      }
      result[command] = value;
    }
  }

  return result;
}

// Create main window on ready
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
});

// Load settings on launch
ipcMain.on('request-initial-load', e => {
  const responseChannel = 'request-initial-load-response';

  try {
    const dataPathExists = fs.existsSync(dataPath);
    if (!dataPathExists) fs.mkdirSync(dataPath);
  
    const settingsExists = fs.existsSync(settingsPath);
    if (!settingsExists) {
      const contents = JSON.stringify(initialSettings, null, 2);
      fs.writeFileSync(settingsPath, contents, 'utf8');
      e.sender.send(responseChannel, contents);
    } else {
      const contents = fs.readFileSync(settingsPath, 'utf8');
      e.sender.send(responseChannel, contents);
    }
  } catch (e) {
    console.log(e);
    e.sender.send(responseChannel, '{ error: true }');
  }
});

ipcMain.on('save-settings', (e, settings) => {
  try {
    const contents = JSON.stringify(settings, null, 2);
    fs.writeFileSync(settingsPath, contents, 'utf8');
  } catch (e) {
    console.log(e);
  }

  e.returnValue = true;
});

ipcMain.on('request-version', e => e.returnValue = pkg.version);
