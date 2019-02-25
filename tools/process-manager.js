/**
 * Manages the Angular CLI and Electron processes
 */

const child_process = require('child_process');
const stdin = process.stdin;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// CLI escape sequences
const escapes = {
  redBackground: '\x1b[41m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  reset: '\x1b[0m\n',
  green: '\x1b[32m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  cyanBackground: '\x1b[46m',
  black: '\x1b[30m',
  clear: '\033c'
}

function showHelp() {
  // Clear the terminal
  process.stdout.write(escapes.clear);

  console.log(`${escapes.green}~~ Angular CLI & Electron Process Manager - Chris Anselmo ~~${escapes.reset}`);
  console.log(`${escapes.green}a${escapes.white} - Restart the Angular process${escapes.reset}`
    + `${escapes.green}e${escapes.white} - Restart the Electron process${escapes.reset}`
    + `${escapes.green}h${escapes.white} - Shows this information again${escapes.reset}`);
}

// Initial message
showHelp();

// Prepare process containers
let ng, electron;

function createElectron() {
  console.log(`Launching Electron...${escapes.reset}`);
  
  electron = child_process.spawn('electron', ['./src', '-dev']);

  // Handle Electron outputs
  electron.stdout.on('data', data => console.log(`${escapes.cyan}Electron:\n${escapes.reset}${data}`));
  electron.stderr.on('data', data => console.log(`${escapes.cyanBackground}${escapes.black}Electron error:${escapes.reset}\n${data}`));

  electron.on('close', () => console.log(`${escapes.cyan}Electron process closed!${escapes.reset}`));
}

/**
 * Serves the cwd Angular CLI instance
 * @param {boolean} launchElectron Whether to launch Electron once Angular is ready
 */
function createAngular(launchElectron) {
  let hasElectronLaunched = false;

  console.log(`Launching Angular...${escapes.reset}`);

  ng = child_process.spawn('ng', ['serve', '--port', '1234']);

  // Handle Angular CLI outputs
  ng.stdout.on('data', data => {
    console.log(`${escapes.red}Angular:\n${escapes.reset}${data}`);

    if (launchElectron && !hasElectronLaunched && data.includes('Compiled successfully')) {
      hasElectronLaunched = true;
      createElectron();
    }
  });

  ng.stderr.on('data', data => console.log(`${escapes.redBackground}${escapes.white}Angular error:${escapes.reset}\n${data}`));

  ng.on('close', () => {
    console.log(`${escapes.red}Angular process closed! Restarting...${escapes.reset}`);
    createAngular(false);
  });
}
createAngular(true);

// On key press
stdin.on('data', key => {

  // On Ctrl-C 
  if (key === '\u0003') {
    ng.kill();
    electron.kill();
    process.exit();
  }

  if (key === 'a') ng.kill();
  if (key === 'e') {
    electron.kill();
    createElectron();
  }
  if (key === 'h') showHelp();
});
