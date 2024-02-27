import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../board.css', '../../../input.css']
})
export class SettingsComponent {
  constructor(
    public locale: Locale
  ) {}
}
