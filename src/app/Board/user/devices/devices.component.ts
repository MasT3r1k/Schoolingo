import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';

@Component({
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css', '../../board.css']
})
export class DevicesComponent {

  constructor(
    public locale: Locale
  ) {}
}
