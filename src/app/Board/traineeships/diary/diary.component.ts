import { Component } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css', '../../board.css', '../../../input.css']
})
export class DiaryComponent {
  constructor(
    public locale: Locale
  ) {}
}
