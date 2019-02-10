const {ipcRenderer, remote} = require('electron');
const {validate} = require('email-validator');
const APItranslation = remote.require('./util/APItranslation');

window.addEventListener('load', () => {
  const alert = document.getElementById('alert');
  const alertRow = document.getElementById('alert-row');
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  const loginButton = document.getElementById('login-button');

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
      alertRow.classList.add('d-none');
      if(validate(email)) {
        emailField.classList.remove('is-invalid');
      }
      else {
        emailField.classList.add('is-invalid');
        alert.textContent = APItranslation.invalid_email;
        alertRow.classList.remove('d-none');
        return;
      }
      const password = passwordField.value;
      loginButton.disabled = true;
      ipcRenderer.send('login-submit', {
        email,
        password,
      });
    });

  ipcRenderer.on('login-error', (event, arg) => {
    alert.textContent = APItranslation[arg];
    alertRow.classList.remove('d-none');
    loginButton.disabled = false;
  });

  document.getElementById('signup-link')
    .addEventListener('click', () => {
      ipcRenderer.send('signup-clicked');
    });
});