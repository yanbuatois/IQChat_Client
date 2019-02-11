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
    * @return {Promise<String>} Promesse résolue avec le token de l'utilisateur.
    * @param {Credentials} credentials Informations de connexion de l'utilisateur.
    */
  async login(credentials) {
    this.token = await this.promisifyQuery('credentials-login', 'credentials-login-success', 'credentials-login-error', credentials);
    return this.token;
  }

  /**
   * Inscrit l'utilisateur et renvoie éventuellement son token.
   * @param {SignupCredentials} credentials Informations de connexion de l'utilisateur.
   * @return {Promise<String>} Token de l'utilisateur.
   */
  async signup(credentials) {
    this.token = await this.promisifyQuery('signup', 'signup-success', 'signup-error', credentials);
    return this.token;
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