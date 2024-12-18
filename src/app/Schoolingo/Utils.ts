import country from "country-state-city/lib/country";
import moment from "moment";

export namespace Utils {
/**
 * Adds zeros in front of number based on length
 * @param number number where you want change length
 * @param len length of number
 * @returns number 128 to length 5 is set to 00128
 */
  export function addZeros(num: number, len: number = 2): string {
    if (num.toString().length >= len) {
      return num.toString();
    }
    return (
      new Array(len - num.toString().length).fill('0').join('') + num.toString()
    );
}

export function isOdd(num: number): boolean {
  return num % 2 == 0;
}

export function randomstring(length: number, numbers: boolean = true): string {

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

  // Date and Time
  export function getDayOfWeek(week: number, day: number = 0): moment.Moment {
    return moment().isoWeek(week).startOf('isoWeek').add(day + 1, 'd');
  }

  export function formatDate(date: Date): string {
    return moment(date).format('hh:mm:ss DD. MM. YYYY');
  }

  export function formatPhone(phone: string): string {
    return ((phone || "").match(/.{1,3}/g) || [])?.join(' ');
  }

  export function formatAddress(address: { code2: string, street: string, houseNumber: string, city: string, postcode: string }): string | null {
    if (address.city == null) return null;
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
}