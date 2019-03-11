const {Notification, app} = require('electron');

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

   /**
    * @typedef {Object} ServerInfos Informations d'un serveur auquel on accède.
    * @property {Array<Object>} messages Messages du serveur
    * @property {Array<Object>} loggedUsers Utilisateurs connectés au serveur
    * @property {Array<Object>} otherUsers Utilisateurs non-connectés membres du serveur
    */
module.exports = class API {

  /**
   * Constructeur de la classe
   * @param {SocketIO} socket Socket.io
   * @param {Config} config Configuration du client
   * @param {Number} [timeout=2500] Temps avant l'expiration de la requête.
   */
  constructor(socket, config, timeout = 2500) {
    this.timeout = timeout;
    this.socket = socket;
    this.config = config;

    /**
     * Contient la liste des informations par serveur.
     * @type {Object}
     * @private
     */
    this._serverDatas = {};

    // this._messagesServer = {};
  }

  /**
   * Permet de déconnecter l'utilisateur.
   * @return {undefined}
   */
  logout() {
    Reflect.deleteProperty(this, '_servers');
    Reflect.deleteProperty(this, 'token');
    Reflect.deleteProperty(this, 'user');
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
   * Permet à l'utilisateur connecté de quitter un serveur.
   * @param {String} id Identifiant du serveur à quitter.
   * @return {Promise<Array<Object>>} Résolue quand l'utilisateur a quitté le serveur. Contient la liste des serveurs auxquels appartient maintenant l'utilisateur.
   */
  leaveServer(id) {
    return this.promisifyQuery('leave-server', 'leave-server-success', 'leave-server-error', id);
  }

  /**
   * Permet à l'utilisateur de supprimer un serveur dont il est propriétaire.
   * @param {String} id Identifiant du serveur à détruire.
   * @return {Promise<Array<Object>>} Résolue quand le serveur a été détruit.
   */
  deleteServer(id) {
    return this.promisifyQuery('delete-server', 'delete-server-success', 'delete-server-error', id);
  }

   /**
    * @return {Promise<String>} Promesse résolue avec le token de l'utilisateur.
    * @param {Credentials} credentials Informations de connexion de l'utilisateur.
    */
  async login({email, password, remember}) {
    this.token = await this.promisifyQuery('credentials-login', 'credentials-login-success', 'credentials-login-error', {
      email,
      password
    });
    if(remember) {
      console.log('remember');
      this.config.settings.token = this.token;
      await this.config.save();
    }
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

  async loadConf() {
    await this.config.load();
    this.token = this.config.settings.token;
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
      if(this.token) {
        this.socket.emit('login', this.token);
        // TODO : Traitement des cas où la connexion fonctionne et échoue.
      }
    });
  }

  async remind() {
    if(this.token) {
      await this.promisifyQuery('login', 'welcome', 'login-error', this.token);
    }
    else {
      throw new Error();
    }
  }

  /**
   * Permet de se déconnecter en demandant au serveur d'oublier l'utilisateur.
   * @return {Promise<undefined>} Promesse résolue quand tout est bien déconnecté.
   */
  async serverLogout() {
    this.token = undefined;
    this.socket.emit('logout');
    if(this.config.settings.token) {
      await this.config.logout();
    }
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

  get servers() {
    return this._servers;
  }

  set servers(value) {
    if(value !== undefined) {
      this._servers = value;
    }
  }

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

  /**
   * Permet de récupérer la liste des infos d'un serveur.
   * @param {String} id Identifiant du serveur
   * @return {ServerInfos} Liste de messages et utilisateurs du serveur
   */
  async getServerInfos(id) {
    if(!this._serverDatas.hasOwnProperty(id)) {
      this._serverDatas[id] = await this.promisifyQuery('get-server-infos', 'get-server-infos-success', 'get-server-infos-error', id);
    }

    return this._serverDatas[id];
  }

  /**
   * Permet de définir le serveur courant comme celui dont on passe l'id
   * @param {String} id Identifiant du serveur
   * @return {ServerInfos} Liste des messages et utilisateurs du serveur
   */
  async selectServer(id) {
    const msgs = await this.getServerInfos(id);
    this.selectedServer = id;
    console.log(msgs);
    return msgs;
  }

  /**
   * Permet d'envoyer un message au serveur en cours.
   * @param {String} message Message à envoyer.
   * @return {Promise<Object>} Le message envoyé.
   */
  sendMessage(message) {
    return this.promisifyQuery('send-message', 'send-message-success', 'send-message-error', {
      message,
      server: this.selectedServer,
    });
  }

  /**
   * Permet de traiter le message reçu.
   * @param {Message} message Message reçu
   * @param {BrowserWindow} mainWindow Fenêtre principale.
   * @return {undefined}
   */
  receiveMessage(message, mainWindow) {
    if(this._serverDatas.hasOwnProperty(message.server)) {
      this._serverDatas[message.server].messages.push(message);
      if(this.selectedServer === message.server) {
        mainWindow.webContents.send('new-message', message);
      }
    }
    if(!this.user._id !== message.author._id) {
      const notif = new Notification({
        title: message.author.username,
        subtitle: this.getServerFromId(message.server).name,
        body: message.content,
        icon: message.author.avatar,
      });
      notif.show();
    }
  }
};