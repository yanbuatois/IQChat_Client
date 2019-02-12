/* global dependCb */

window.addEventListener('load', () => {
  const form = document.getElementById('invitation-form');
  const nbUsesCb = document.getElementById('uses-number-cb');
  const nbUsesField = document.getElementById('uses-number');
  const dateCb = document.getElementById('date-cb');
  const dateField = document.getElementById('date');

  form.addEventListener('submit', event => {
    event.preventDefault();
  });

  dependCb(nbUsesCb, nbUsesField);
  dependCb(dateCb, dateField);
});