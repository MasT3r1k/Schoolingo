import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';

@Component({
  selector: 'module-marks',
  templateUrl: './marks.component.html',
  styleUrls: ['./marks.component.css', '../module.css', '../../board.css']
})
export class MarksComponent {
  constructor(
    public locale: Locale
  ) {}

}
