/* eslint-disable no-unused-vars */
const {validate} = require('email-validator');

/**
 * Rend un élément valide.
 * @param {Element} element Element que l'on veut rendre valide.
 * @return {Element} élément rendu valide.
 */
function setValid(element) {
  element.classList.remove('is-invalid');
  element.classList.add('is-valid');
  return element;
}

/**
 * Rend un élément invalide.
 * @param {Element} element Élément que l'on veut rendre invalide.
 * @return {Element} Élément rendu valide.
 */
function setInvalid(element) {
  element.classList.remove('is-valid');
  element.classList.add('is-invalid');
  return element;
}

/**
 * Retire les classes de validité à un élément.
 * @param {Element} element Élément dont on veut retirer les classes.
 * @return {Element} Élément sans les classes.
 */
function setNoValid(element) {
  element.classList.remove('is-valid', 'is-invalid');
  return element;
}

/**
 * Définit la validité d'un élément en fonction d'un booléen.
 * @param {Element} element Élément à traiter.
 * @param {Boolean} condition Si vrai, le champ est validé. Si faux, il est invalidé.
 * @return {Element} Élément (in)validé.
 */
function setBoolValid(element, condition) {
  return condition
  ? setValid(element)
  : setInvalid(element);
}

/**
 * Vérifie la validité d'un nom d'utilisateur.
 * @param {String} username Nom d'utilisateur.
 * @return {Boolean} Vrai si le nom d'utilisateur est valide.
 */
function validUsername(username) {
  return username.length >= 3;
}

/**
 * Vérifie la validité de l'adresse mail.
 * @param {String} email Adresse mail.
 * @return {Boolean} Vrai si l'adresse mail est correcte.
 */
function validEmail(email) {
  return validate(email);
}

/**
 * Vérifie si le mot de passe est valide
 * @param {String} password Mot de passe.
 * @return {Boolean} Vrai si le mot de passe est correct.
 */
function validPassword(password) {
  return password.length >= 3;
}

/**
 * Vérifie si les mots de passe correspondent.
 * @param {String} password Mot de passe.
 * @param {String} confirmation Confirmation du mot de passe.
 * @return {Boolean} Vrai si les mots de passe correspondent.
 */
function validConfirmation(password, confirmation) {
  return password === confirmation;
}