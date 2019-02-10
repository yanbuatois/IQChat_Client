/* global setNoValid */
/* global setBoolValid */
/* global validUsername */
/* global validConfirmation */
/* global validPassword */
/* global validEmail */
/* global hideAlert */
/* global displayMessageAlert */
/* global setAllDisabled */
const {ipcRenderer, remote} = require('electron');
const APItranslation = remote.require('./util/APItranslation');

window.addEventListener('load', () => {
  const usernameField = document.getElementById('username');
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  const confirmationField = document.getElementById('cpassword');
  const alert = document.getElementById('alert');
  const alertRow = document.getElementById('alert-row');
  const signupButton = document.getElementById('signup-button');

  /**
   * Permet de savoir si on attend l'envoi du formulaire.
   * @return {Boolean} Vrai si l'envoi du formulaire est temporairement désactivé.
   */
  function sendWaiting() {
    return signupButton.disabled;
  }
  
  document.getElementById('signupform')
    .addEventListener('submit', event => {
      event.preventDefault();

      if(sendWaiting()) {
        return;
      }
      if(!validUsername(usernameField.value) || !validEmail(emailField.value) || !validPassword(passwordField.value) || !validConfirmation(confirmationField.value, passwordField.value)) {
        displayMessageAlert(alertRow, alert, 'Tous les champs n\'ont pas des valeurs valides.');
        return;
      }
      hideAlert(alertRow, alert);
      setAllDisabled(true);
      ipcRenderer.send('signup-submit', {
        username: usernameField.value,
        email: emailField.value,
        password: passwordField.value,
      });
    });
  
  usernameField.addEventListener('blur', event => {
    const {target} = event;
    if(target.value === '') {
      setNoValid(target);
    }
    else {
      setBoolValid(target, validUsername(target.value));
    }
  });
  
  emailField.addEventListener('blur', event => {
    const {target} = event;
    console.log('emailBlur');
    if(target.value === '') {
      setNoValid(target);
    }
    else {
      setBoolValid(target, validEmail(target.value));
    }
  });

  passwordField.addEventListener('blur', event => {
    const {target} = event;
    if(target.value === '') {
      setNoValid(target);
    }
    else {
      const valid = validPassword(target.value);
      setBoolValid(target, valid);
      if(confirmationField.value !== '') {
        setBoolValid(confirmationField, validConfirmation(target.value, confirmationField.value));
      }
    }
  });

  confirmationField.addEventListener('blur', event => {
    const {target} = event;
    if(target.value === '') {
      setNoValid(target);
    }
    else {
      setBoolValid(target, validConfirmation(passwordField.value, target.value));
    }
  });

  ipcRenderer.on('signup-error', (event, args) => {
    setAllDisabled(false);
    displayMessageAlert(alertRow, alert, APItranslation[args]);
  });
});