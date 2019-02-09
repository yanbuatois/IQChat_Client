const codes = {
  'invalid_request': "Votre requête est invalide. Si le problème se reproduit, contactez l'administrateur.",
  'internal_error': "Une erreur interne est survenue. Si le problème se reproduit, contactez l'administrateur.",
  'bad_credentials': "Vos identifiants sont invalides.",
  'not_admin': "Vous n'êtes pas administrateur. Vous ne pouvez donc pas effectuer cette action.",
  'banned': "Vous êtes banni. Vous ne pouvez donc pas vous connecter.",
  'invalid_token': "Votre token est invalide. Essayez de vous reconnecter.",
  'user_not_found': "L'utilisateur n'a pas été trouvé.",
  'invalid_email': "Votre adresse mail n'est pas valide.",
  'invalid_password': "Votre mot de passe doit comporter 3 caractères au minimum.",
  'invalid_username': "Votre nom d'utilisateur doit comporter 3 caractères au minimum.",
  'used_username': "Votre nom d'utilisateur est déjà utilisé.",
  'used_email': "Votre adresse email est déjà utilisée.",
  'unknown_issue': "Un problème inconnu est survenu. Si le problème se reproduit, contactez l'administrateur.",
};

module.exports = new Proxy(codes, {
  get: (obj, prop) => (prop in obj
    ? obj[prop]
    : prop),
});