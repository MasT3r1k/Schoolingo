import country from "country-state-city/lib/country";
import moment from "moment";

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
    return (moment.isMoment(week) ? week : moment().isoWeek(week)).startOf('isoWeek').add(day + 1, 'd');
  }

  export function formatDate(date: Date | moment.Moment): string {
    return (moment.isMoment(date) ? date : moment(date)).format('HH:mm:ss DD. MM. YYYY');
  }

  export function getNow(): moment.Moment {
    return moment();
  }

  export function formatPhone(phone: string): string {
    return ((phone || "").match(/.{1,3}/g) || []).join(' ');
  }

  export function formatAddress(address: { code2: string, street: string, houseNumber: string, city: string, postcode: string }): string | null {
    if (!address.city) return '';
    return `${(country.getCountryByCode(address.code2)?.flag || "")} ${address.street} ${address.houseNumber}, ${address.city} ${address.postcode}`
  }

  export function openURL(url: string): void {
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
    var OSName = "Unknown";
    if (userAgent.includes("Win"))      OSName = "Windows";
    if (userAgent.includes("Mac"))      OSName = "Macintosh";
    if (userAgent.includes("Linux"))    OSName = "Linux";
    if (userAgent.includes("Android"))  OSName = "Android";
    if (userAgent.includes("like Mac")) OSName = "iOS";
    return OSName;
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
      browser = "Mozilla";
    } else if ((userAgent.includes("MSIE")) || (!!(document as any).documentMode == true)) {
      browser = 'IE';
    }
    return browser;
  }
}