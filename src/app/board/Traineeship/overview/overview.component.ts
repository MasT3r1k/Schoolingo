import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { IconsModule } from '@Schoolingo/icons';
import { Permission } from '@Schoolingo/permission';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';
import { DiaryWeek, Traineeship, TraineeshipData } from '@Schoolingo/traineeship';
import { Locale } from '@Schoolingo/locale';

type Box = {
  icon: string;
}

@Component({
  standalone: true,
  imports: [RouterLink, writeDairyComponent, IconsModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  public l = inject(Locale);
  private listeners: Subscription[] = [];
  public traineeship = inject(Traineeship);
  Utils = Utils;
  public perms = inject(Permission);

  constructor() {}

  public boxes: Record<string, Box> = {
    companies: {
      icon: "building"
    },
    company_waiting: {
      icon: "home-cancel"
    },
    weeks: {
      icon: "calendar-week"
    },
    scopes: {
      icon: "school"
    },
  }

  ngOnInit(): void {
    // this.schoolingo.socketService.emit('traineeship:getOverview');
    // this.listeners.push(
    //   this.schoolingo.socketService.addFunction("connect").subscribe(() => {
    //     this.schoolingo.socketService.emit('traineeship:getOverview');
    //   })
    // )
    // this.listeners.push(
    //   this.schoolingo.socketService.addFunction("traineeship:getOverview").subscribe((data: TraineeshipData[]) => {
    //     this.traineeship.boxData = data;
    //   })
    // );

  }

  ngOnDestroy(): void {
    this.traineeship.selectDay(null);
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public getNearestDiary(): DiaryWeek {
    let nearestWeek: DiaryWeek;
    this.traineeship.diaryWeeks.getValue().forEach((week: DiaryWeek) => {
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

  public getDaysOfDairy(week: DiaryWeek): moment.Moment[] {
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
