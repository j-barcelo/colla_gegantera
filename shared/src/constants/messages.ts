export const VALIDATION_MESSAGES = {
  required: 'Aquest camp és obligatori',
  nameRequired: "Has d'especificar el teu nom",
  surnameRequired: "Has d'especificar els teus cognoms",
  userRequired: 'No has especificat cap usuari',
  emailRequired: "Has d'especificar un correu electrònic",
  emailInvalid: 'El format del correu no és vàlid',
  phoneInvalid: 'El format del telèfon no és vàlid',
  passwordRequired: 'No has especificat cap contrasenya',
  currentPasswordRequired: "Has d'introduir la contrasenya actual",
  passwordMinLength: 'La contrasenya ha de tenir com a mínim 8 caràcters',
  passwordConfirmRequired: 'Confirma la contrasenya',
  newPasswordConfirmRequired: 'Confirma la nova contrasenya',
  passwordMismatch: 'Les contrasenyes no coincideixen',
} as const;

export const FORM_MESSAGES = {
  genericError: "S'ha produït un error.",
  connectionError: "No s'ha pogut connectar amb el servidor.",
  invalidCredentials: 'Les credencials introduïdes no són correctes.',
  registerFallback: 'Error en completar el registre.',
  profileUpdateFallback: "No s'han pogut actualitzar les dades personals.",
  profileUpdateSuccess: 'Dades personals actualitzades correctament.',
  passwordUpdateFallback: "No s'ha pogut actualitzar la contrasenya.",
  passwordUpdateSuccess: "La contrasenya s'ha canviat correctament.",
} as const;
