import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { DiaryWeek } from '@Schoolingo/Traineeship';
import { Utils } from '@Schoolingo/Utils';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class OverviewComponent {
  Utils = Utils;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  public getNearestDiary(): DiaryWeek {
    let nearestWeek: DiaryWeek;
    this.schoolingo.traineeship.diaryWeeks.getValue().forEach((week: DiaryWeek) => {
      if (week.end.isBefore(moment())) return;
      if (!nearestWeek) {
        nearestWeek = week;
        return;
      }
      if (nearestWeek.start.diff(moment(), 'days') > week.start.diff(moment(), 'days')) {
        nearestWeek = week;
      }
    });
    return nearestWeek!;
  }

  public getDaysOfDairy(week: DiaryWeek): any {
    console.log(week);
    let days: moment.Moment[] = [];
    let date = week.start.clone();
    while (date.isSameOrBefore(week.end)) {
      if (!week.ignoredDays.includes(date.isoWeekday().toString())) {
        days.push(date.clone());
      }
      date.add(1, 'day');
    }
    return days;
  }

}
