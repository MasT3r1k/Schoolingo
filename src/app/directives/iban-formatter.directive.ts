import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appIbanFormatter]',
  standalone: true
})
export class IbanFormatterDirective {

  constructor(private ngControl: NgControl) {}

@HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    let trimmed = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    let formatted = trimmed.match(/.{1,4}/g)?.join(' ') || trimmed;

    if (this.ngControl.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: false });
    }
  }
  @HostListener('keydown.space', ['$event'])
  onSpaceKeyDown(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
  }

}
