/* eslint-disable no-unused-vars */
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