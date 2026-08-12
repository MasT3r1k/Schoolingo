import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isbn',
  standalone: true
})
export class IsbnPipe implements PipeTransform {
  transform(text: string): string {
    text = text.replace(/-/g, '')

    let formatted = '';
    if (text.length > 0) {
      const parts = [];
      if (text.length > 0) parts.push(text.substring(0, 3));
      if (text.length > 3) parts.push(text.substring(3, 5));
      if (text.length > 5) parts.push(text.substring(5, 8));
      if (text.length > 8) parts.push(text.substring(8, 12));
      if (text.length > 12) parts.push(text.substring(12, 13));
      
      formatted = parts.join('-');
    }
    return formatted
  }
}