import { AppType } from "./app_types";

export namespace Config {
    export const ELYSIA_URL = "http://localhost:3000";
    export const API_URL = "http://localhost:3000/api";
    export const LOCALE_URL = ELYSIA_URL + '/locales/';
    export const APP_NAME = "Schoolingo";
    export const APP_VERSION = "2.0.1";
    export const LOGGER_LEVEL = "INFO";

    export const APP_TYPE: AppType = "DEV";
}