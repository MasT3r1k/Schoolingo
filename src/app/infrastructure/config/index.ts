import { AppType } from "./app_types";

export namespace Config {
    // Routes
    export const ELYSIA_URL = "http://localhost:3000";
    export const API_URL = "http://localhost:3000/api";
    export const LOCALE_URL = ELYSIA_URL + '/locales/';

    // App Config
    export const APP_NAME = "Schoolingo";
    export const APP_VERSION = "2.0.1";
    export const APP_CREDITS = "Made by Josef Kosík with 💙"
    export const APP_TYPE: AppType = "DEV";

    // App settings
    export const LOGGER_LEVEL = "INFO";
    export const SHOW_DOWNLOAD_BUTTON = false;
    export const ALLOW_LEVEL_SYSTEM = false;
    export const ALLOW_AVATARS = false;
    export const ALLOW_ACHIEVEMENTS = false;
}