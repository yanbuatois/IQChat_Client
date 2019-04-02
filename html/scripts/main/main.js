/* global MainClass */
/* global ipcRenderer */
/* global _ */

// const {remote} = require('electron');
// const _ = require('underscore');
const Markdown = require('markdown-it');
const emojis = require('emojis');

const markdown = new Markdown();

window.addEventListener('load', () => {
  const main = new MainClass();

  const newServerButton = document.getElementById('new-server-button');
  const logoutButton = document.getElementById('logout-button');
  const sendForm = document.getElementById('send-message-form');
  const sendInput = document.getElementById('send-message-input');
  const msgField = document.getElementById('messages');

  /**
   * Permet d'afficher un message.
   * @param {String} message Message reçu
   * @return {Element} Élément créé.
   */
  function displayMessage(message) {
    const msg = document.createElement('div');
    msg.classList.add('message');
    msg.id = message._id;
    const author = document.createElement('span');
    author.classList.add('author');
    author.name = message.author._id;
    author.innerText = `${message.author.username} : `;
    msg.append(author);
    const contenu = document.createElement('span');
    contenu.classList.add('content');
    contenu.innerHTML = markdown.renderInline(_.escape(emojis.unicode(message.content)));
    msg.append(contenu);
    msgField.append(msg);

    return msg;
  }

  ipcRenderer.send('main-ready');
  logoutButton.addEventListener('click', event => {
    event.preventDefault();
    ipcRenderer.send('logout');
  });

  ipcRenderer.on('server-messages', (event, arg) => {
    // C const roleClass = ['user', 'moderator', 'admin', 'foundator'];
    console.log(arg);
    for(const message of arg) {
      displayMessage(message);
    }
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
    ipcRenderer.send('send-message', message);
    sendInput.value = '';
  });

  ipcRenderer.on('first-infos', (event, arg) => {
    main.serversList = arg;
  });
  
  ipcRenderer.on('refresh-servers', (event, arg) => {
    console.log(arg);
    main.serversList = arg;
  });

  ipcRenderer.on('new-message', (event, arg) => {
    console.log(arg);
    displayMessage(arg);
  });
});