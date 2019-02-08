const electron = require('electron');
const {BrowserWindow, app} = electron;

let mainWindow;

/**
 * Permet de créer la fenêtre.
 * @return {undefined}
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1020,
    height: 800,
  });

  mainWindow.loadFile('./html/login.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);