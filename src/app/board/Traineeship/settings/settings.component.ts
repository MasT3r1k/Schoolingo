import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [NgClass],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class SettingsComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public checked: boolean = false;
}
