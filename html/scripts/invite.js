/* global dependCb */
/* global setInvalid */
/* global setBoolValid */
/* global setNoValid */
/* global displayMessageAlert */
/* global setAllDisabled */
/* global hideAlert */
const {remote, ipcRenderer} = require('electron');
const APItranslation = remote.require('./util/APItranslation');

window.addEventListener('load', () => {
  const form = document.getElementById('invitation-form');
  const nbUsesCb = document.getElementById('uses-number-cb');
  const nbUsesField = document.getElementById('uses-number');
  const dateCb = document.getElementById('date-cb');
  const dateField = document.getElementById('date');
  const alertRow = document.getElementById('alert-row');
  const alert = document.getElementById('alert');

  form.addEventListener('submit', event => {
    event.preventDefault();

    const envoi = {};
    if(dateCb.checked) {
      envoi.date = dateField.value; 
      if(new Date(envoi.date) <= Date.now()) {
        setInvalid(dateField);
        displayMessageAlert(alertRow, alert, APItranslation.previous_date);
        return;
      }
    }
    if(nbUsesCb.checked) {
      envoi.nbUses = nbUsesField.value;
    }
    hideAlert(alertRow, alert);
    setAllDisabled(true);
    ipcRenderer.send('invitation-creation-submit', envoi);
  });

  dateField.min = new Date().toISOString();

  dateField.addEventListener('change', event => {
    const dateText = event.target.value;
    const date = new Date(dateText);
    if(!date) {
      setInvalid(event.target);
      return;
    }
    setBoolValid(event.target, (date > Date.now()));
  });

  dateCb.addEventListener('change', ({target}) => {
    if(!target.checked) {
      setNoValid(dateField);
    }
  });

  ipcRenderer.on('invitation-creation-error', (event, arg) => {
    document.querySelectorAll('.disablable').forEach(elt => {
      if(!elt.classList.contains('cb-disabled')) {
        elt.disabled = false;
      }
    });
    displayMessageAlert(alertRow, alert, APItranslation[arg]);
  });

  dependCb(nbUsesCb, nbUsesField);
  dependCb(dateCb, dateField);
});