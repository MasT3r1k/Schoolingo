export const name = 'Schoolingo';
export const version = '2.0';

// NO DEV: /api/
export const api = (window.location.hostname == "localhost") ? 'http://localhost:8888/api/' : '/api/';
export const socketIP = (window.location.hostname == "localhost") ? 'http://localhost:8888' : window.location.host;
export const localeURL = '/locales/';