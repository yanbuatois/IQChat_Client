const axios = require('axios');
const {setupCache} = require('axios-cache-adapter');

/**
 * Classe qui gère l'API.
 * @typedef {Object} Credentials
 * @property {String} email Adresse mail
 * @property {String} password Mot de passe
 */
module.exports = class API {

  /**
   * Constructeur de la classe
   * @param {String} baseURL URL de base.
   * @param {Object} headers En-tête des requêtes.
   * @param {Number} timeout Temps avant l'expiration de la requête.
   */
  constructor(baseURL, headers = {'Content-Type': 'application/json'}, timeout = 2500) {
    this.headers = headers;
    const cache = setupCache({
      maxAge: 15*60*1000,
    });
  
    this.api = axios.create({
      baseURL,
      headers,
      timeout,
      adapter: cache.adapter,
    });
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
    * @param {Credentials} param0 Informations de connexion de l'utilisateur.
    */
  login({email, password}) {
    return new Promise((resolve, reject) => {
      this.api.post('/users/signin', {
        email,
        password,
      }, {
        headers: this.headers,
      })
        .then(({data}) => {
          this.token = data.token;
          resolve(data.token);
        })
        .catch(err => {
          if(err.response && err.response.data && err.response.data.code) {
            reject(new Error(err.response.data.code));
          }
          else {
            reject(err);
          }
        });
    });
  }
};