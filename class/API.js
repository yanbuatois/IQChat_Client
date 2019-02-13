/**
 * Classe qui gère l'API.
 * @typedef {Object} Credentials Identifiants envoyés à la connexion.
 * @property {String} email Adresse mail
 * @property {String} password Mot de passe
 */

 /**
  * @typedef {Object} SignupCredentials Identifiants envoyées à l'inscription.
  * @property {String} email Adresse mail
  * @property {String} username Nom d'utilisateur
  * @property {String} password Mot de passe
  */

  /**
   * @typedef {Object} NewServerInfos Informations d'un serveur nouvellement créé.
   * @property {String} servername Nom du serveur
   * @property {String} description Description du serveur
   */
module.exports = class API {

  /**
   * Constructeur de la classe
   * @param {SocketIO} socket Socket.io
   * @param {Number} [timeout=2500] Temps avant l'expiration de la requête.
   */
  constructor(socket, timeout = 2500) {
    this.timeout = timeout;
    this.socket = socket;
  }

  /**
   * Permet de déconnecter l'utilisateur.
   * @return {undefined}
   */
  logout() {
    Reflect.deleteProperty(this, 'token');
  }

  /**
   * Permet de créer une invitation pour le serveur en cours d'édition.
   * @param {InviteParams} infos Informations sur l'invitation
   * @return {Promise<String>} Identifiant de l'invitation ainsi créée.
   */
  createInvite(infos) {
    console.log(this.serverToInvite);
    const send = infos;
    send.server = this.serverToInvite;

    return this.promisifyQuery('create-invitation', 'create-invitation-success', 'create-invitation-error', send);
  }

   /**
    * @return {Promise<String>} Promesse résolue avec le token de l'utilisateur.
    * @param {Credentials} credentials Informations de connexion de l'utilisateur.
    */
  async login(credentials) {
    this.token = await this.promisifyQuery('credentials-login', 'credentials-login-success', 'credentials-login-error', credentials);
    this.logMode();
    return this.token;
  }

  /**
   * Inscrit l'utilisateur et renvoie éventuellement son token.
   * @param {SignupCredentials} credentials Informations de connexion de l'utilisateur.
   * @return {Promise<String>} Token de l'utilisateur.
   */
  async signup(credentials) {
    this.token = await this.promisifyQuery('signup', 'signup-success', 'signup-error', credentials);
    this.logMode();
    return this.token;
  }

  /**
   * Permet de créer un nouveau serveur.
   * @param {NewServerInfos} infos Informations du serveur à créer.
   * @return {Promise<Array<Object>>} Liste de serveurs
   */
  createServer(infos) {
    return this.promisifyQuery('create-server', 'create-server-success', 'create-server-error', infos);
  }

  /**
   * Permet d'activer une invitation.
   * @param {String} code Code de l'invitation.
   * @return {Promise<Object>} Serveur joint.
   */
  redeemInvite(code) {
    return this.promisifyQuery('invited', 'invited-success', 'invited-error', code);
  }

  /**
   * Passe en mode connecté et répond au serveur en conséquence. Doit avoir un token pour fonctionner.
   * @return {undefined}
   */
  logMode() {
    this.socket.on('connected', () => {
      console.log('une demande !');
      if(this.token) {
        console.log('on a un token');
        this.socket.emit('login', this.token);
        // TODO : Traitement des cas où la connexion fonctionne et échoue.
      }
    });
  }

  /**
   * Permet d'encapsuler un échange socket.io dans une promesse.
   * @param {String} channelIn Channel où on envoie la requête.
   * @param {String} channelSuccess Channel où, si on reçoit une requête, tout s'est bien passé.
   * @param {String} [channelError=undefined] Channel où, si on reçoit une requête, il y a eu un problème.
   * @param {*} [args=undefined] Arguments à transmettre au socket.
   * @param {Number} [timeout=2500] Expiration en millisecondes de la requête.
   * @return {Promise<Any>} Le résultat de la requête.
   */
  promisifyQuery(channelIn, channelSuccess, channelError = undefined, args = undefined, timeout = 2500) {
    return new Promise((resolve, reject) => {
      this.socket.emit(channelIn, args);
      this.socket.on(channelSuccess, (...retour) => {
        resolve(retour.length === 1
          ? retour[0]
          : retour);
      });
      if(channelError) {
        this.socket.on(channelError, (...retour) => {
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
};