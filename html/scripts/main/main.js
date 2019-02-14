/* global MainClass */
/* global ipcRenderer */

const main = new MainClass();

window.addEventListener('load', () => {
  const newServerButton = document.getElementById('new-server-button');
  const logoutButton = document.getElementById('logout-button');
  ipcRenderer.send('main-ready');
  logoutButton.addEventListener('click', event => {
    event.preventDefault();
    ipcRenderer.send('logout');
  });

  newServerButton.addEventListener('click', event => {
    event.preventDefault();
    ipcRenderer.send('new-server-button-clicked');
  });
});

ipcRenderer.on('first-infos', (event, arg) => {
  main.serversList = arg;
});

ipcRenderer.on('refresh-servers', (event, arg) => {
  console.log(arg);
  main.serversList = arg;
});