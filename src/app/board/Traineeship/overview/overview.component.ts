import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Schoolingo } from '@Schoolingo';
import { DiaryWeek } from '@Schoolingo/Traineeship';
import { Utils } from '@Schoolingo/Utils';
import moment from 'moment';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';

@Component({
  standalone: true,
  imports: [RouterLink, writeDairyComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class OverviewComponent implements OnInit {
  Utils = Utils;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.schoolingo.traineeship.selectDay(null);

  }

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
    let days: moment.Moment[] = [];
    if (!week) return days;
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
