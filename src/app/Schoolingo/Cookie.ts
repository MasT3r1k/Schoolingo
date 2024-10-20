import { Injectable } from '@angular/core';

@Injectable()
export class CookieService {
  constructor() {}
  public getCookie(name: string): string {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName: string = `${name}=`;
    let c: string;

    for (let i = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

  public deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }

  public setCookie(name: string, value: string, expireDays: number): void {
    let d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    let expires: string = 'expires=' + d.toUTCString();
    let cookie: string =
      name +
      '=' +
      value +
      '; ' +
      expires +
      '; path=/;' +
      ' Secure; SameSite=Lax; ';
    document.cookie = cookie;
  }
}
