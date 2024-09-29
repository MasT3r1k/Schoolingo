import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../Styles/card.css']
})
export class SettingsComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
