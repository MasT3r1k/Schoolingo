import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './homeworks.component.html',
  styleUrls: ['./homeworks.component.css', '../../board.css']
})
export class HomeworksComponent {
  constructor(
    public locale: Locale
  ) {}
}
