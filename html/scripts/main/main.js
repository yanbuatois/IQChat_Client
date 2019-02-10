const {ipcRenderer} = require('electron');

window.addEventListener('load', () => {
  ipcRenderer.send('main-ready');
});

ipcRenderer.on('first-infos', (event, arg) => {
  // TODO : Stuff with servers
});