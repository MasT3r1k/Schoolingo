import { inject, Injectable } from "@angular/core";
import { Theme, themes } from "@Schoolingo/theme";
import country from "country-state-city/lib/country";
import moment from "moment";

Injectable()
export namespace Utils {
/**
 * Adds zeros in front of number based on length
 * @param number number where you want change length
 * @param len length of number
 * @returns number 128 to length 5 is set to 00128
 */
  export function addZeros(num: number, len = 2): string {
    if (num.toString().length >= len) {
      return num.toString();
    }
    return (
      new Array(len - num.toString().length).fill('0').join('') + num.toString()
    );
  }

  export function isOdd(num: number): boolean {
    return num % 2 == 1;
  }

  export function randomstring(length: number, numbers = true): string {

    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) {
      chars += "0123456789";
    }

    let text = '';
    for (let i = 0; i < length; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return text;
  }

  export function makeMoment(date: string): moment.Moment {
    return moment(date);
  }

  // Date and Time
  export function getDayOfWeek(week: number | moment.Moment, day = 0): moment.Moment {
    return (moment.isMoment(week) ? week : moment().isoWeek(week)).startOf('isoWeek').add(day - 1, 'd');
  }

  export function formatDate(date: Date | moment.Moment): string {
    return (moment.isMoment(date) ? date : moment(date)).format('H:mm:ss DD. MM. YYYY');
  }

  export function formatDateShort(date: Date | moment.Moment): string {
    return (moment.isMoment(date) ? date : moment(date)).format('DD. MM. YYYY');
  }

  export function getNow(): moment.Moment {
    return moment();
  }

  export function blurIPAddress(ip: string, blur = true): string {
    let parts = ip.split('.');
    if (blur) {
      for(let i = 1; i < parts.length; i++) {
        parts[i] = parts[i].replace(/\d/g, "X")
      }
    }
    return parts.join('.');
  }

  export function webProtocol(web: string): 'http' | 'https' {
    if (web.startsWith('http://')) {
      return 'http';
    }
    return 'https';
  }

  export function formatNumber(number: string | number, decimals: number = 0): string {
    if (isNaN(Number(number))) return '';
    return Number(number).toFixed(decimals)
  }

  export function formatAsNumber(number: string | number): number {
    return parseFloat(number.toString())
  }

  export function formatWeb(web: string, hideProtocol: boolean = false): string {
    if (web.startsWith('http://') || web.startsWith('https://')) {
      if (hideProtocol) {
        if (web.startsWith('http://')) {
          web = web.slice(7);
        } else {
          web = web.slice(8)
        }
      }
      return web;
    }

    return ((!hideProtocol) ? 'https://' : '') + web;
  }

  export function formatPhone(phone: string): string {
    if (!phone) return '';

    // Odstraníme mezery a jiné znaky kromě "+"
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Pokud nezačíná "+" ani "00", doplníme české předčíslí
    if (!cleaned.startsWith('+') && !cleaned.startsWith('00')) {
      // Odstraníme případnou počáteční nulu
      if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
      cleaned = '+420' + cleaned;
    }

    // Pokud začíná "00", změníme na "+"
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.slice(2);
    }

    // Rozparsujeme prefix a číslo
    const match = cleaned.match(/^(\+\d{1,3})(\d+)$/);
    if (!match) return cleaned;
    let [, prefix, number] = match;

    console.log(prefix, number)

    // Odstraníme počáteční nulu po předčíslí (např. +4200 → +420)
    if ((prefix === '+420' || prefix === '+421') && number.startsWith('0')) {
      number = number.slice(1);
    }

    // Naformátuj po trojicích
    const formattedNumber = number.match(/.{1,3}/g)?.join(' ') ?? number;

    return `${prefix} ${formattedNumber}`.trim();
  }


  export function formatAddress(address: { code2: string, street: string, houseNumber: string, city: string, postcode: string }): string | null {
    if (!address.city) return '';
    return `${(country.getCountryByCode(address.code2)?.flag || "")} ${address.street} ${address.houseNumber}, ${address.city} ${address.postcode}`
  }

  export function openURL(url: string): void {
    if (url.startsWith('mailto:')) {
      window.open(url, '_top');
      return;
    }
    window.open(url, '_blank');
  }

  export function getAge(date: moment.Moment): number {
    let age = 0;

    let now = moment().subtract(1, 'year');
    while(now.isSameOrAfter(date, 'day')) {
      age++;
      now.subtract(1, 'year');
    }

    return age;
  }

  export function getOS(userAgent: string): string {
    let OSName = "Unknown";

    if (userAgent.includes("Windows NT")) {
      if (userAgent.includes("Windows NT 10.0")) {
        OSName = "Windows"; // 10.0 platí pro Windows 10 i 11
      } else if (userAgent.includes("Windows NT 6.3")) {
        OSName = "Windows 8.1";
      } else if (userAgent.includes("Windows NT 6.2")) {
        OSName = "Windows 8";
      } else if (userAgent.includes("Windows NT 6.1")) {
        OSName = "Windows 7";
      } else if (userAgent.includes("Windows NT 6.0")) {
        OSName = "Windows Vista";
      } else if (userAgent.includes("Windows NT 5.1")) {
        OSName = "Windows XP";
      } else {
        OSName = "Windows";
      }
    } else if (userAgent.includes("Mac")) {
      OSName = "Macintosh";
    } else if (userAgent.includes("Linux")) {
      OSName = "Linux";
    } else if (userAgent.includes("Android")) {
      OSName = "Android";
    } else if (userAgent.includes("like Mac")) {
      OSName = "iOS";
    }

    return OSName;
  }

  export function getOSIcon(userAgent: string): string {
    let OSName = "device-unknown";

    if (userAgent.includes("Windows NT")) {
      OSName = "brand-windows";
    } else if (userAgent.includes("Mac")) {
      OSName = "brand-apple";
    } else if (userAgent.includes("Linux")) {
      OSName = "brand-ubuntu";
    } else if (userAgent.includes("Android")) {
      OSName = "brand-android";
    }

    return OSName;
  }

  export function getLoginTypeIcon(type: string): string {
    let loginType = '';
    switch (type) {
      case 'password':
        loginType = 'icon-login-password';
        break;
      case 'passkey':
        loginType = 'icon-login-passkey';
        break;
      case 'qrcode':
        loginType = 'icon-login-qrcode';
        break;
      default:
        loginType = 'icon-login-unknown';
    }
    return loginType;
  }

  export function getOwnUserAgent(): typeof window.navigator.userAgent {
    return window.navigator.userAgent;
  }
  
  export function getFlagFromCountry(countryCode: string): string {
    return country.getCountryByCode(countryCode)?.flag || "";
  }

  export function getMobile(userAgent: string): boolean {
    return /Mobi|Fennec|mini|Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|iP(ad|od|hone)/i.test(userAgent);
  }

  export function getBrowser(userAgent: string): string {
    let browser = 'Unknown';
    if (userAgent.includes("Opera") || userAgent.includes('OPR')) {
      browser = "Opera";
    } else if (userAgent.includes("Edg")) {
      browser = "Edge";
    } else if (userAgent.includes("Chrome")) {
      browser = "Chrome";
    } else if (userAgent.includes("Safari")) {
      browser = "Safari";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if ((userAgent.includes("MSIE")) || (!!(document as any).documentMode == true)) {
      browser = 'IE';
    }
    return browser;
  }

  export function getBrowserIcon(userAgent: string): string {
    let browser = '';
    if (userAgent.includes("Opera") || userAgent.includes('OPR')) {
      browser = "opera.svg";
    } else if (userAgent.includes("Edg")) {
      browser = "edge.svg";
    } else if (userAgent.includes("Chrome")) {
      browser = "chrome.svg";
    } else if (userAgent.includes("Safari")) {
      browser = "safari.svg";
    } else if (userAgent.includes("Firefox")) {
      browser = "firefox.svg";
    } else if ((userAgent.includes("MSIE")) || (!!(document as any).documentMode == true)) {
      browser = 'IE.svg';
    }
    return browser;
  }

  export function MathMin(numbers: number[]): number {
    return Math.min(...numbers)
  }

  export function copyTextToClipboard(text: string): void {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Nepodařilo se zkopírovat text:', err);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Záložní kopírování selhalo:', err);
      }

      document.body.removeChild(textArea);
    }
  }

  export function removeSecondsFromTime(time: string): string {
    return time ? time.slice(0, 5) : '';
  }

  export function getInitials(name: string): string {
    // Remove all degrees
    const name_wo_degree = name.split(' ').filter((word) => !word.includes('.'))
    return name_wo_degree.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (!Number.isFinite(bytes)) return '—';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);

    return `${value.toFixed(2)} ${sizes[i]}`;
  }
}