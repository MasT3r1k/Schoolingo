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