const {ipcRenderer, remote} = require('electron');
const {validate} = require('email-validator');
const APItranslation = remote.require('./util/APItranslation');

window.addEventListener('onload', () => {
  document.getElementById('signupform')
    .addEventListener('submit', event => {
      event.preventDefault();
    });
});