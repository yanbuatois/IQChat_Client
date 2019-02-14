/* eslint-disable no-unused-vars */
/* global notImplemented */
// eslint-disable-next-line id-length
const _ = require('underscore');
const {ipcRenderer, remote} = require('electron');
const {Menu} = remote;

class MainClass {

  /**
   * @param {Array<Object>} value Liste des valeurs.
   * @return {undefined}
   */
  set serversList(value) {
    this._serversList = value;
    this.refreshServers();
  }

  get serversList() {
    return this._serversList;
  }

  get servers() {
    return this._serversList.map(elt => elt.server);
  }

  /**
   * Permet de rafraîchir la liste des serveurs
   * @return {undefined}
   */
  refreshServers() {
    this._refreshServers(this._serversList);
  }

  getRankLevel(id) {
    const valeur = this.serversList.filter(elt => elt.server._id === id);
    return valeur[0].status;
  }

  /**
   * Permet de vider une liste d'éléments
   * @param {Element} element Élément DOM à vider.
   * @return {undefined}
   * @private
   */
  _clearElement(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /**
   * Met à jour l'affichage de la liste des serveurs.
   * @param {Array<Object>} listeServeurs Liste des serveurs
   * @private
   * @return {undefined}
   */
  _refreshServers(listeServeurs) {
    const liste = document.getElementById('servers-list');

    this._clearElement(liste);

    listeServeurs.forEach(elt => {
      const {server} = elt;
      const newRow = document.createElement('div');
      newRow.classList.add('row');
      const newLink = document.createElement('a');
      newLink.classList.add('col-md-12', 'server-link');
      newLink.id = `server-${_.escape(server._id)}`;
      newLink.textContent = _.escape(server.name);
      newLink.title = _.escape(server.description);
      newLink.href = '#';
      newRow.append(newLink);
      liste.append(newRow);
    });

    document.querySelectorAll('.server-link').forEach(elt => {
      elt.addEventListener('contextmenu', event => {
        event.preventDefault();
        const id = elt.id.substr(7);
        const status = this.getRankLevel(id);
        const menu = [];
        if(status > 0) {
          menu.push({
            label: 'Inviter de nouveaux membres',
            click: () => {
              this.inviteForm(id);
            }
          });
        }
        if(status < 3) {
          menu.push({
            label: 'Quitter le serveur',
            click: () => {
              ipcRenderer.send('leave-server', id);
            }
          });
        }
        else {
          menu.push({
            label: 'Supprimer le serveur',
            click: () => {
              notImplemented();
            }
          });
        }
        if(status > 0) {
          menu.push({
            label: 'Gérer le serveur',
            click: () => {
              notImplemented();
            }
          });
        }

        const menuObjet = remote.Menu.buildFromTemplate(menu);
        menuObjet.popup();
      });
    });
  }

  /**
   * Provoque l'affichage de la fenêtre d'invitation.
   * @param {String} id Identifiant du serveur concerné
   * @return {undefined}
   */
  inviteForm(id) {
    ipcRenderer.send('invitation-creation', id);
  }
}