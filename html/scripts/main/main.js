const {ipcRenderer} = require('electron');

window.addEventListener('load', () => {
  ipcRenderer.send('main-ready');
});

/**
 * Permet de vider une liste d'éléments
 * @param {Element} element Élément DOM à vider.
 * @return {undefined}
 */
function clearElement(element) {
  while(element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Met à jour l'affichage de la liste des serveurs.
 * @param {Array} listeServeurs Liste des serveurs
 * @return {undefined}
 */
function refreshServer(listeServeurs) {
  const liste = document.getElementById('servers-list');

  clearElement(liste);

  listeServeurs.forEach(elt => {
    const newRow = document.createElement('div');
    newRow.classList.add('row');
    const newLink = document.createElement('a');
    newLink.classList.add('col-md-12');
    newLink.id = `server-${elt._id}`;
    newRow.append(newLink);
    liste.append(newRow);
  });
}

ipcRenderer.on('first-infos', (event, arg) => {
  refreshServer(arg);
});