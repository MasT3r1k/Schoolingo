import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { user } from '@Schoolingo/User';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Component({
  host: {'module': 'timetable'},
  standalone: true,
  imports: [NgClass],
  templateUrl: './Timetable.html',
  styleUrl: './Timetable.css'
})
export class TimetableComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public day: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment());

  ngOnInit(): void {

    this.day.subscribe((val: moment.Moment) => {
      this.schoolingo.timetableSelectedWeek.next(val.isoWeek());
    });

    // Get timetable
    let user: user | null = this.schoolingo.userService.getUser();
    let userId = user?.id;

    if (user && user.type == 'parent') {
      userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;
    }
    this.schoolingo.socketService.emit('timetable:getLessons', { userId, week: this.day.getValue().isoWeek(), year: this.day.getValue().year() });

  }

}
