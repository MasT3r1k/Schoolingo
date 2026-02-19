import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { IconsModule } from '@Schoolingo/icons';
import { Permission } from '@Schoolingo/permission';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';
import { DiaryWeek, Traineeship, TraineeshipData, StudentTraineeshipStatus } from '@Schoolingo/traineeship';
import { Locale } from '@Schoolingo/locale';
import { NgClass } from '@angular/common';

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

  // Admin dashboard data
  public adminStats = {
    totalTraineeships: 0,
    activeTraineeships: 0,
    studentsWithContract: 0,
    studentsWithoutContract: 0,
    completedStudents: 0,
    pendingStudents: 0
  };

  public recentStudents: StudentTraineeshipStatus[] = [];

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
    this.traineeship.fetchStudents().subscribe((students) => {
        this.traineeship.students.next(students);
        this.loadAdminStats();
        this.loadRecentStudents();
    });
  }

  ngOnDestroy(): void {
    this.traineeship.selectDay(null);
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  private loadAdminStats(): void {
    const weeks = this.traineeship.diaryWeeks.getValue();
    this.adminStats.totalTraineeships = weeks.length;
    this.adminStats.activeTraineeships = weeks.filter(w => 
      this.traineeship.getStateOfTraineeship(w) === 'ongoing'
    ).length;

    const allStudents = this.getAllStudents();
    this.adminStats.studentsWithContract = allStudents.filter(s => s.hasContract).length;
    this.adminStats.studentsWithoutContract = allStudents.filter(s => !s.hasContract).length;
    this.adminStats.completedStudents = allStudents.filter(s => s.isProcessed).length;
    this.adminStats.pendingStudents = allStudents.filter(s => !s.isProcessed).length;
  }

  private loadRecentStudents(): void {
    this.recentStudents = this.getAllStudents();
  }

  private getAllStudents(): StudentTraineeshipStatus[] {
    // Mock - aggregate students from all traineeships
    return this.traineeship.getStudentsForTraineeship(0);
  }

  public getActiveTraineeships(): DiaryWeek[] {
    return this.traineeship.diaryWeeks.getValue().filter(w => 
      this.traineeship.getStateOfTraineeship(w) === 'ongoing'
    );
  }

  public getUpcomingTraineeships(): DiaryWeek[] {
    return this.traineeship.diaryWeeks.getValue().filter(w => 
      this.traineeship.getStateOfTraineeship(w) === 'planned'
    ).slice(0, 5);
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
