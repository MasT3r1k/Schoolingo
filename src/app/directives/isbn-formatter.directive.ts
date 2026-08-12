import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appIsbnFormatter]',
  standalone: true
})
export class IsbnFormatterDirective {

  constructor(private ngControl: NgControl) {}

  transform(text: string) {
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

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    let cleaned = value.toUpperCase().replace(/[^0-9X]/g, '');
    
    cleaned = cleaned.substring(0, 13);

    let formatted = this.transform(cleaned);

    if (this.ngControl.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: false });
    }
  }

  @HostListener('keydown.space', ['$event'])
  onSpaceKeyDown(event: Event) {
    event.preventDefault();
  }
}