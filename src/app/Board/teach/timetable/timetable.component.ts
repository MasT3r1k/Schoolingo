import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Dropdowns } from '@Components/Dropdown/Dropdown';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../board.css']
})
export class TimetableComponent {
  constructor(
    public schoolingo: Schoolingo,
    public locale: Locale,
    public dropdown: Dropdowns
  ) {}

  public tabName: string = 'timeTable';

}
