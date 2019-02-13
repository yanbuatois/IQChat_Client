/* global displayMessageAlert */
/* global hideAlert */
/* global setAllDisabled */
const {remote, ipcRenderer} = require('electron');
const APItranslation = remote.require('./util/APItranslation');

window.addEventListener('load', () => {
  const form = document.getElementById('invited-form');
  const alert = document.getElementById('alert');
  const alertRow = document.getElementById('alert-row');
  const invitationField = document.getElementById('invitation');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const code = invitationField.value;
    if(!code) {
      displayMessageAlert(alertRow, alert, 'Veuillez saisir le code de l\'invitation.');
      return;
    }

    hideAlert(alertRow, alert);
    setAllDisabled(true);

    ipcRenderer.send('invited-submit', code);
  });

  ipcRenderer.on('invited-error', (event, arg) => {
    const message = (arg.hasOwnProperty('_id')
    ? `L'invitation est utilisée pour rejoindre le serveur "${arg.name}" auquel vous appartenez déjà.`
    : APItranslation[arg]);
    displayMessageAlert(alertRow, alert, message);
    setAllDisabled(false);
  });
});