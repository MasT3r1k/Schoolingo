import { AppType } from "./app_types";
export * from "./school-types";

export namespace Config {
    // Routes
    export const ELYSIA_URL = "http://localhost:8888";
    export const API_URL = `${ELYSIA_URL}/api`;
    export const WS_URL = ELYSIA_URL.replaceAll('http://', 'ws://') + '/ws'
    export const LOCALE_URL = ELYSIA_URL + '/locales/';

    // App Config
    export const APP_NAME = "Schoolingo";
    export let APP_VERSION = "";
    export const APP_CREDITS = "Made by Josef Kosík with 💙"
    export const APP_TYPE: AppType = "DEV";

    // App settings
    export const LOGGER_LEVEL = "INFO";
    export const SHOW_DOWNLOAD_BUTTON = false;
    export const ALLOW_LEVEL_SYSTEM = false;
    export const ALLOW_AVATARS = true;
    export const ALLOWED_AVATAR_STYLES: string | string[] = ['thumbs'];
    export const ALLOW_ACHIEVEMENTS = false;
}