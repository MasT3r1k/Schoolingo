import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'settings-change-language',
  standalone: true,
  imports: [NgClass],
  templateUrl: './language.component.html',
  styleUrls: ['../settings.component.css', './language.component.css']
})
export class LanguageComponent {
  public l = inject(Locale);
}
