import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../../Styles/card.css']
})
export class TimetableComponent {



  constructor(public schoolingo: Schoolingo) {
  }

  ngOnInit(): void {
  }

}
