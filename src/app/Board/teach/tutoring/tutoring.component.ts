import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './tutoring.component.html',
  styleUrls: ['./tutoring.component.css', '../../board.css']
})
export class TutoringComponent {
  constructor(
    public locale: Locale
  ) {}

  public creatingNewOne: boolean = false;

}
