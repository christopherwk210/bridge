// Imports
const { app, BrowserWindow } = require('electron');

const url = require('url');
const path = require('path');

// Define a main window
let mainWindow;

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
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      allowRunningInsecureContent: false
    }
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
  })
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
