import { Component, OnInit } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { user } from '@Schoolingo/User';
import moment from 'moment';

@Component({
  host: {'module': 'timetable'},
  standalone: true,
  imports: [],
  templateUrl: './Timetable.html',
  styleUrl: './Timetable.css'
})
export class TimetableComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public day: moment.Moment = moment().add(1, 'day');

  ngOnInit(): void {

    // Get timetable
    let user: user | null = this.schoolingo.userService.getUser();
    let userId = user?.id;

    if (user && user.type == 'parent') {
      userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;
    }
    this.schoolingo.socketService.emit('timetable:getLessons', { userId, week: this.day.isoWeek(), year: this.day.year() });

    console.log(this.day.day())
  }

}
