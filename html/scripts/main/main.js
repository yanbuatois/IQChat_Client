const {ipcRenderer} = require('electron');

window.addEventListener('load', () => {
  const newServerButton = document.getElementById('new-server-button');
  ipcRenderer.send('main-ready');
  newServerButton.addEventListener('click', event => {
    event.preventDefault();
    ipcRenderer.send('new-server-button-clicked');
  });
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
    newLink.textContent = elt.name;
    newLink.title = elt.description;
    newLink.href = '#';
    newRow.append(newLink);
    liste.append(newRow);
  });
}

ipcRenderer.on('first-infos', (event, arg) => {
  refreshServer(arg);
});

ipcRenderer.on('refresh-servers', (event, arg) => {
  console.log(arg);
  refreshServer(arg);
});