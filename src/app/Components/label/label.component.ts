import { Component, inject, Input, OnInit } from '@angular/core';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'schoolingo-label',
  imports: [],
  templateUrl: './label.component.html',
  styleUrl: './label.component.css'
})
export class LabelComponent {
  public l = inject(Locale)

  @Input() id = '';
  @Input() text = '';
  @Input() error = '';
  @Input() error_args = {};
  @Input() error_prefix = '';

  public isError(): boolean {
    return this.error != '' && this.error != undefined;
  }
}
