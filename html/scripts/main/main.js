/* global MainClass */
/* global ipcRenderer */

const main = new MainClass();

window.addEventListener('load', () => {
  const newServerButton = document.getElementById('new-server-button');
  const logoutButton = document.getElementById('logout-button');
  const sendForm = document.getElementById('send-message-form');
  const sendInput = document.getElementById('send-message-input');
  ipcRenderer.send('main-ready');
  logoutButton.addEventListener('click', event => {
    event.preventDefault();
    ipcRenderer.send('logout');
  });

  newServerButton.addEventListener('click', event => {
    event.preventDefault();
    ipcRenderer.send('new-server-button-clicked');
  });

  sendForm.addEventListener('submit', event => {
    event.preventDefault();
    const message = sendInput.value.trimEnd();
    if(!message) {
      return;
    }
    sendInput.value = '';
  });
});

ipcRenderer.on('first-infos', (event, arg) => {
  main.serversList = arg;
});

ipcRenderer.on('refresh-servers', (event, arg) => {
  console.log(arg);
  main.serversList = arg;
});