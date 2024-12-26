import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Schoolingo } from '@Schoolingo';
import { DiaryWeek, TraineeshipData } from '@Schoolingo/Traineeship';
import { Utils } from '@Schoolingo/Utils';
import moment from 'moment';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';
import { Permission } from '@Schoolingo/Permissions';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

type Box = {
  icon: string;
}

@Component({
  standalone: true,
  imports: [RouterLink, writeDairyComponent, NgClass],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class OverviewComponent implements OnInit {
  private listeners: Subscription[] = [];
  Utils = Utils;

  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ) {}

  public boxes: Record<string, Box> = {
    companies: {
      icon: "buildings"
    },
    weeks: {
      icon: "calendar-week"
    },
    scopes: {
      icon: "school"
    },
    diary: {
      icon: "chalkboard"
    }
  }

  ngOnInit(): void {
    this.schoolingo.socketService.emit('traineeship:getOverview');
    this.listeners.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit('traineeship:getOverview');
    }))
    this.listeners.push(this.schoolingo.socketService.addFunction("traineeship:getOverview").subscribe((data: TraineeshipData[]) => {
      this.schoolingo.traineeship.boxData = data;
    }));

  }

  ngOnDestroy(): void {
    this.schoolingo.traineeship.selectDay(null);
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
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
