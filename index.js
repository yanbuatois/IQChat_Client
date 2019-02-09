const electron = require('electron');
const {BrowserWindow, app, ipcMain} = electron;
const API = require('./class/API');
const config = require('./config');
const io = require('socket.io-client');

let mainWindow;
const iqApi = new API(`${config.apiUrl}:${config.apiPort}`);
const socket = io(`${config.apiUrl}:${config.apiPort}`);

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

ipcMain.on('login-submit', async (event, arg) => {
  try {
    const token = await iqApi.login(arg);
    socket.emit('login', token);
  }
  catch(err) {
    event.sender.send('login-error', (err.message));
  }
});