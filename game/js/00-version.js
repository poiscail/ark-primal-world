const ARK_VERSION="0.16.0",SAVE_FORMAT=1;
/* Plateforme : forcée par la version construite (PC / Téléphone), sinon détectée */
const ARK_PLATFORM=window.ARK_PLATFORM_FORCED||(matchMedia("(pointer: coarse)").matches?"phone":"pc");
