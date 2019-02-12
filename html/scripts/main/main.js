/* global MainClass */
/* global ipcRenderer */

const main = new MainClass();

window.addEventListener('load', () => {
  const newServerButton = document.getElementById('new-server-button');
  ipcRenderer.send('main-ready');
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