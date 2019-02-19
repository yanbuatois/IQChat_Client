const electron = require('electron');
const {BrowserWindow, app, ipcMain, dialog, clipboard, Tray} = electron;
const API = require('./class/API');
const Config = require('./class/Config');
const config = require('./config');
const io = require('socket.io-client');
const APItranslation = require('./util/APItranslation');

/**
 * @type {BrowserWindow}
 */
let inviteWindow, loginWindow, mainWindow, newServerWindow, signupWindow;
let tray;

const socket = io(`${config.apiUrl}:${config.apiPort}`);

const configManager = new Config();
const iqApi = new API(socket, configManager);

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
 * Permet d'initialiser le tray.
 * @return {undefined}
 */
function initTray() {
  tray = new Tray('./assets/logo.png');
  tray.setToolTip('IQChat');
}

/**
 * Fonction appelée uniquement au lancement du programme.
 * @return {undefined}
 */
async function firstLaunch() {
  initTray();
  app.setAppUserModelId('iqchat_client');
  await iqApi.loadConf();
  try {
    await iqApi.remind();
  }
  catch(err) {
    createLoginWindow();
  }
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
 * Permet de créer la fenêtre d'invitation.
 * @return {undefined}
 */
function createInviteWindow() {
  inviteWindow = new BrowserWindow({
    width: 600,
    height: 480,
    modal: true,
    parent: mainWindow,
  });

  inviteWindow.loadFile('./html/invite.html');

  inviteWindow.on('closed', () => (signupWindow = null));
}


socket.on('welcome', user => {
  if(!mainWindow) {
    createMainWindow();
  }
  if(loginWindow) {
    if(signupWindow) {
      signupWindow.close();
    }
    if(loginWindow) {
      loginWindow.close();
    }
  }
  const {servers} = user;

  iqApi.servers = servers || [];
  iqApi.user = user;
});

socket.on('new-message', message => {
  iqApi.receiveMessage(message, mainWindow);
});

ipcMain.on('login-submit', async (event, arg) => {
  try {
    await iqApi.login(arg);
  }
  catch(err) {
    event.sender.send('login-error', (err));
  }
});

ipcMain.on('choosen-server', async (event, arg) => {
  try {
    event.sender.send('server-messages', await iqApi.selectServer(arg));
  }
  catch(err) {
    dialog.showMessageBox(mainWindow, {
      title: 'Une erreur est survenue',
      message: `Une erreur est survenue au cours de la récupération des messages :\n${err}`,
      type: 'error',
    }, () => undefined);
  }
});

ipcMain.on('send-message', async (event, arg) => {
  try {
    await iqApi.sendMessage(arg);
  }
  catch(err) {
    dialog.showMessageBox(mainWindow, {
      title: 'Une erreur est survenue',
      message: `Une erreur est survenue au cours de l'envoi du message :\n${err}`,
      type: 'error',
    }, () => undefined);
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
    iqApi.servers = servers;
    newServerWindow.close();
    mainWindow.webContents.send('refresh-servers', iqApi.servers);
  }
  catch(err) {
    event.sender.send('create-server-error', (err));
  }
});

ipcMain.on('signup-clicked', () => {
  createSignupWindow();
});

ipcMain.on('main-ready', event => {
  event.sender.send('first-infos', iqApi.servers);
});

ipcMain.on('new-server-button-clicked', () => {
  createNewServerWindow();
});

ipcMain.on('leave-server', (event, id) => {
  const server = iqApi.getServerFromId(id);
  dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'Quitter un serveur',
    message: `Êtes-vous sûr de vouloir quitter ${server.name} ? Il vous faudra de nouveau une invitation si vous souhaitez y retourner.`,
    buttons: ['Non', 'Oui'],
    defaultId: 0,
    cancelId: 0,
  }, async reponse => {
    if(reponse === 1) {
      try {
        const servers = await iqApi.leaveServer(id);
        iqApi.servers = servers;
        event.sender.send('refresh-servers', iqApi.servers);
      }
      catch(err) {
        // On passe un faux callback pour éviter de rendre le dialogue bloquant.
        dialog.showMessageBox(mainWindow, {
          type: 'error',
          title: 'Une erreur est survenue',
          message: `Une erreur est survenue quand vous avez tenté de quitter le serveur :\n${APItranslation[err]}`,
        }, () => undefined);
      }
    }
  });
});

socket.on('servers-changed', () => {
  socket.emit('refresh-servers');
});

socket.on('refresh-servers', servers => {
  iqApi.servers = servers;
  mainWindow.webContents.send('refresh-servers', iqApi.server);
});

socket.on('refresh-servers-error', err => {
  if(mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Une erreur est survenue',
      message: `Une erreur est survenue pendant que nous rafraichissions les serveurs :\n${APItranslation[err]}`,
    }, () => undefined);
  }
});

ipcMain.on('delete-server', (event, id) => {
  const server = iqApi.getServerFromId(id);
  dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'Détruire un serveur',
    message: `Êtes-vous sûr de vouloir détruire ${server.name} ? Tous les messages seront définitivement supprimés.`,
    buttons: ['Non', 'Oui'],
    defaultId: 0,
    cancelId: 0,
  }, async reponse => {
    if(reponse === 1) {
      try {
        const servers = await iqApi.deleteServer(id);
        iqApi.servers = servers;
        event.sender.send('refresh-servers', iqApi.servers);
      }
      catch(err) {
        dialog.showMessageBox(mainWindow, {
          type: 'error',
          title: 'Une erreur est survenue',
          message: `Une erreur est survenue quand vous avez tenté de supprimer le serveur :\n${APItranslation[err]}`,
        }, () => undefined);
      }
    }
  });
});

ipcMain.on('invitation-creation', (event, arg) => {
  createInviteWindow();
  iqApi.serverToInvite = arg; 
});

ipcMain.on('invitation-creation-submit', async (event, arg) => {
  try {
    const invitation = await iqApi.createInvite(arg);
    dialog.showMessageBox(inviteWindow, {
      type: 'info',
      title: "L'invitation a été créée",
      message: `L'invitation a été créée avec le code suivant :\n${invitation}`,
      buttons: ['Ok', 'Copier'],
    }, reponse => {
      if(reponse === 1) {
        clipboard.writeText(invitation);
      }
      inviteWindow.close();
    });
  }
  catch(err) {
    event.sender.send('invitation-creation-error', err);
  }
});

ipcMain.on('invited-submit', async (event, arg) => {
  try {
    const [server, servers] = await iqApi.redeemInvite(arg);
    iqApi.servers = servers;
    mainWindow.webContents.send('refresh-servers', iqApi.servers);
    dialog.showMessageBox(newServerWindow, {
      type: 'info',
      title: 'Le serveur a été rejoint',
      message: `Vous avez bien rejoint le serveur "${server.name}" !`,
    }, () => {
      newServerWindow.close();
    });
  }
  catch(err) {
    console.log(err);
    event.sender.send('invited-error', err);
  }
});

ipcMain.on('logout', async () => {
  await iqApi.serverLogout();
  createLoginWindow();
  mainWindow.close();
});

app.on('ready', firstLaunch);