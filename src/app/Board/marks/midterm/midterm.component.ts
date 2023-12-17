import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';

@Component({
  templateUrl: './midterm.component.html',
  styleUrls: ['./midterm.component.css', '../../board.css']
})
export class MidtermComponent {

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo
  ) {}
}
