const electron = require('electron');
const {BrowserWindow, app, ipcMain} = electron;
const API = require('./class/API');
const config = require('./config');
const io = require('socket.io-client');

/**
 * @type {BrowserWindow}
 */
let loginWindow, mainWindow, newServerWindow, signupWindow;

const socket = io(`${config.apiUrl}:${config.apiPort}`);

const iqApi = new API(socket);
const userInfos = {};

/**
 * Permet de créer la fenêtre.
 * @return {undefined}
 */
function createLoginWindow() {
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

/**
 * Permet de créer la fenêtre de nouveau serveur.
 * @return {undefined}
 */
function createNewServerWindow() {
  newServerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: true,
  });

  newServerWindow.loadFile('./html/newserver/index.html');

  newServerWindow.on('closed', () => {
    newServerWindow = null;
  });
}

/**
 * Permet de créer la fenêtre d'inscription.
 * @return {undefined}
 */
function createSignupWindow() {
  signupWindow = new BrowserWindow({
    width: 1020,
    height: 800,
    parent: loginWindow,
    modal: true,
  });

  signupWindow.loadFile('./html/signup.html');
  
  signupWindow.on('closed', () => {
    signupWindow = null;
  });
}

/**
 * Initie la connexion avec le socket lorsque l'utilisateur est connecté.
 * @param {String} token Token de l'utilisateur
 * @return {undefined}
 */
function initSocket(token) {
  socket.emit('login', token);
}

socket.on('welcome', serversUser => {
  // const servers = serversUser.map(elt => elt.server);
  if(loginWindow) {
    createMainWindow();
    if(signupWindow) {
      signupWindow.close();
    }
    if(loginWindow) {
      loginWindow.close();
    }
  }
  console.log(serversUser);
  userInfos.servers = serversUser;
});

app.on('ready', createLoginWindow);

ipcMain.on('login-submit', async (event, arg) => {
  try {
    await iqApi.login(arg);
  }
  catch(err) {
    event.sender.send('login-error', (err));
  }
});

ipcMain.on('signup-submit', async (event, arg) => {
  try {
    await iqApi.signup(arg);
  }
  catch(err) {
    event.sender.send('signup-error', (err));
  }
});

ipcMain.on('create-server-submit', async (event, infos) => {
  try {
    const servers = await iqApi.createServer(infos);
    newServerWindow.close();
    mainWindow.webContents.send('refresh-servers', servers);
  }
  catch(err) {
    event.sender.send('create-server-error', (err));
  }
});

ipcMain.on('signup-clicked', () => {
  createSignupWindow();
});

ipcMain.on('main-ready', event => {
  event.sender.send('first-infos', userInfos.servers);
});

ipcMain.on('new-server-button-clicked', () => {
  createNewServerWindow();
});