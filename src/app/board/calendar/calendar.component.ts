import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css', '../../Styles/card.css']
})
export class CalendarComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
