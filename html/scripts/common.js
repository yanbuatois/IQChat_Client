/* eslint-disable no-unused-vars */
const ipcRendererCommon = require('electron').ipcRenderer;

/**
 * Affiche un message d'erreur dans la box alert.
 * @param {Element} row Ligne de la boîte de dialogue.
 * @param {Element} alert Boîte de dialogue d'alerte.
 * @param {String} message Message à afficher
 * @return {undefined}
 */
function displayMessageAlert(row, alert, message) {
  row.classList.remove('d-none');
  alert.textContent = message;
}

/**
 * Cache une alert et vide éventuellement son message.
 * @param {Element} row Ligne à cacher.
 * @param {Element} [alert=undefined] Alerte dont on veut retirer le message. Par défaut, aucun retrait de message.
 * @return {undefined}
 */
function hideAlert(row, alert = undefined) {
  row.classList.add('d-none');
  if(alert) {
    alert.textContent = '';
  }
}

/**
 * Définit tous les éléments avec la classe "disablable" comme désactivés, ou activés.
 * @param {Boolean} [disabled=true] Vrai si on veut désactiver.
 * @return {undefined}
 */
function setAllDisabled(disabled = true) {
  document.querySelectorAll('.disablable')
    .forEach(elt => {
      elt.disabled = disabled;
    });
}

/**
 * Permet de transformer en promesse un échange via IPC.
 * @param {String} send Channel où on veut envoyer un message.
 * @param {String} success Channel d'où on reçoit un message de succès.
 * @param {String} [error=undefined] Channel d'où on reçoit un message d'erreur.
 * @param {Object} [args=undefined] Argument que l'on veut envoyer avec le message.
 * @param {Number} [timeout=5000] Temps avant l'expiration de la demande.
 * @return {Promise<Any>} Élément envoyé lors du succès.
 */
function promisifyIpc(send, success, error = undefined, args = undefined, timeout = 5000) {
  return new Promise((resolve, reject) => {
    ipcRendererCommon.send(send, args);
    ipcRendererCommon.on(success, (...retour) => {
      resolve(retour.length === 1
        ? retour[0]
        : retour);
    });
    if(error) {
      ipcRendererCommon.on(error, (...retour) => {
        reject(retour.length === 1
          ? retour[0]
          : retour);
      });
    }
    if(timeout >= 0) {
      setTimeout(() => {
        reject('timeout');
      }, timeout);
    }
  });
}