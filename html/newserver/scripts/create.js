/* global displayMessageAlert */
/* global hideAlert */
/* global setAllDisabled */
/* global promisifyIpc */

const {ipcRenderer, remote} = require('electron');
const APItranslation = remote.require('./util/APItranslation');

window.addEventListener('load', () => {
  const alert = document.getElementById('alert');
  const alertRow = document.getElementById('alert-row');
  const createForm = document.getElementById('createform');
  const servernameField = document.getElementById('servername');
  const serverdescriptionField = document.getElementById('serverdescription');

  createForm.addEventListener('submit', event => {
    event.preventDefault();
    const servername = servernameField.value;
    if(!servername) {
      displayMessageAlert(alertRow, alert, 'Le nom doit obligatoirement être saisi.');
      servernameField.classList.add('is-invalid');
      return;
    }
    hideAlert(alertRow, alert);
    setAllDisabled(true);
    ipcRenderer.send('create-server-submit', {
      servername,
      description: serverdescriptionField.value,
    });
    ipcRenderer.on('create-server-error', err => {
      displayMessageAlert(alertRow, alert, APItranslation[err]);
      setAllDisabled(false);
    });

  });

  servernameField.addEventListener('change', () => {
    if(servernameField.value) {
      servernameField.classList.add('is-valid');
    }
    else {
      servernameField.classList.remove('is-invalid');
      servernameField.classList.remove('is-valid');
    }
  });
});