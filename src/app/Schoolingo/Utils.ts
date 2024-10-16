import moment from "moment";

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

  let chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) {
    chars += "0123456789";
  }
  let text: string = '';

    for (let i = 0; i < length; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

  return text;
}

    // Date and Time
export function getDayOfWeek(week: number, day: number = 0): moment.Moment {
      return moment().set('weeks', week).startOf('week').add(day + 1, 'days');
  }