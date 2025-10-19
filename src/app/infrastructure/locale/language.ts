export interface Language {
    iso: string,
    name: string;
    flag: string;
    file: string;
    languages: { [key: string]: string };
}