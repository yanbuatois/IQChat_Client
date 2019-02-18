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
  'timeout': "Le serveur met trop de temps à répondre. Vérifiez votre connexion.",
  'invalid_date': "La date est invalide.",
  'previous_date': "La date est déjà passée.",
  'invalid_uses_number': "Le nombre d'utilisations est invalide. Il doit être supérieur ou égal à 0.",
  'not_logged': "Vous n'êtes pas connecté.",
  'invalid_invitation': "L'invitation n'est pas valide, n'existe pas ou a expiré. Essayez d'en obtenir une autre.",
  'server_not_found': "Le serveur n'existe pas.",
  'permissions_lack': "Vous n'avez pas le droit d'effectuer cette action.",
  'owner': "Vous êtes le propriétaire, vous ne pouvez donc pas faire cette action.",
  'not_member': "Vous n'appartenez pas à ce serveur.",
  'empty_message': "Le message que vous essayez de poster est vide.",
  'server_banned': "Vous avez été banni de ce serveur.",
};

module.exports = new Proxy(codes, {
  get: (obj, prop) => (prop in obj
    ? obj[prop]
    : prop),
});