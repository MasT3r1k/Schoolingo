export namespace AuthConfig {
    export const username_min = 3;
    export const username_max = 24;
    export const username_regex = /[a-zA-Z0-9]*/
    export const password_min = 5;
    export const password_max = 64;
    export const token_length = 6;

    export const ignored_redirect = ['/'];
}