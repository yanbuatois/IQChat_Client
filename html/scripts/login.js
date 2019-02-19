/* global setAllDisabled */
/* global hideAlert */
/* global displayMessageAlert */
const {ipcRenderer, remote} = require('electron');
const {validate} = require('email-validator');
const APItranslation = remote.require('./util/APItranslation');

window.addEventListener('load', () => {
  const alert = document.getElementById('alert');
  const alertRow = document.getElementById('alert-row');
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  const loginButton = document.getElementById('login-button');
  const rememberCb = document.getElementById('remember');

  /**
   * Permet de savoir si on attend une réponse de l'API, auquel cas on ne renvoie pas de requête.
   * @return {Boolean} Vrai si on attend toujours.
   */
  function sendWaiting() {
    return loginButton.disabled;
  }

  document.getElementById('loginform')
    .addEventListener('submit', event => {
      event.preventDefault();
      if(sendWaiting()) {
        return;
      }
      const email = emailField.value;
      const remember = rememberCb.checked;
      hideAlert(alertRow, alert);
      if(validate(email)) {
        emailField.classList.remove('is-invalid');
      }
      else {
        emailField.classList.add('is-invalid');
        displayMessageAlert(alertRow, alert, APItranslation.invalid_email);
        return;
      }
      const password = passwordField.value;
      setAllDisabled(true);
      ipcRenderer.send('login-submit', {
        email,
        password,
        remember,
      });
    });

  ipcRenderer.on('login-error', (event, arg) => {
    displayMessageAlert(alertRow, alert, APItranslation[arg]);
    setAllDisabled(false);
  });

  document.getElementById('signup-link')
    .addEventListener('click', () => {
      ipcRenderer.send('signup-clicked');
    });
});