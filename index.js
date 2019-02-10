const electron = require('electron');
const {BrowserWindow, app, ipcMain} = electron;
const API = require('./class/API');
const config = require('./config');
const io = require('socket.io-client');

/**
 * @type {BrowserWindow}
 */
let loginWindow, mainWindow;

const iqApi = new API(`${config.apiUrl}:${config.apiPort}`);
const socket = io(`${config.apiUrl}:${config.apiPort}`);

const userInfos = {};

/**
 * Permet de créer la fenêtre.
 * @return {undefined}
 */
function createWindow() {
  loginWindow = new BrowserWindow({
    width: 1020,
    height: 800,
  });

  loginWindow.loadFile('./html/login.html');

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

/**
 * Permet de créer la fenêtre principale.
 * @return {undefined}
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  mainWindow.loadFile('./html/main.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

ipcMain.on('login-submit', async (event, arg) => {
  try {
    const token = await iqApi.login(arg);
    socket.emit('login', token);
    socket.on('welcome', serversUser => {
      const servers = serversUser.map(elt => elt.server);
      if(loginWindow) {
        createMainWindow();
        loginWindow.close();
      }
      userInfos.servers = servers;
    });
  }
  catch(err) {
    event.sender.send('login-error', (err.message));
  }
});

ipcMain.on('main-ready', async event => {
  event.sender.send('first-infos', userInfos.servers);
});