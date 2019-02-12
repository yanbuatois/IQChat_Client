class UserInfos {

  /**
   * Permet de récupérer un serveur à partir de son id.
   * @param {String} id Identifiant du serveur que l'on veut récupérer.
   * @return {Object|undefined} Serveur demandé.
   */
  getServerFromId(id) {
    const serverArray = this.servers.filter(elt => elt.server.id === id);
    const servUnique = serverArray[0];
    return servUnique
    ? servUnique.server
    : undefined;
  }
}

module.exports = UserInfos;