import { NgClass, NgIf, AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';
import { DiaryWeek, Traineeship, StudentTraineeshipStatus } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';
import { Config } from '@Schoolingo/config';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [FormsModule, AsyncPipe, IconsModule, CalendarComponent],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent {
  public l = inject(Locale);
  public school = inject(School);
  public traineeship = inject(Traineeship);
  private http = inject(HttpClient);
  public Utils = Utils;
  
  public isCreateModalOpen = false;
  public selectedWeek: DiaryWeek | null = null;
  public students: StudentTraineeshipStatus[] = [];

  public newTraineeship = {
    name: '',
    start: moment() as any,
    end: moment() as any,
    groups: [] as string[],
    ignoredDays: [6, 7] as number[]
  };

  public availableGroups: string[] = ['1.A', '1.B', '1.C', '2.A', '2.B', '2.C', '3.A', '3.B', '3.C', '4.A', '4.B', '4.C'];
  
  public daysOfWeek = [
    { id: 1, label: 'Po' },
    { id: 2, label: 'Út' },
    { id: 3, label: 'St' },
    { id: 4, label: 'Čt' },
    { id: 5, label: 'Pá' },
    { id: 6, label: 'So' },
    { id: 7, label: 'Ne' }
  ];

  constructor() {}

  public selectWeek(week: DiaryWeek): void {
    this.selectedWeek = week;
    this.traineeship.selectDairy(week);
    this.traineeship.fetchStudents(week.traineeship).subscribe((students) => {
        this.students = students;
    });
  }

  public backToList(): void {
    this.selectedWeek = null;
    this.traineeship.selectDairy(null);
    this.students = [];
  }

  public openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  public closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newTraineeship = { name: '', start: moment() as any, end: moment() as any, groups: [], ignoredDays: [6, 7] };
  }

  public toggleGroup(group: string): void {
    const index = this.newTraineeship.groups.indexOf(group);
    if (index > -1) {
      this.newTraineeship.groups.splice(index, 1);
    } else {
      this.newTraineeship.groups.push(group);
    }
  }

  public toggleDay(dayId: number): void {
    const index = this.newTraineeship.ignoredDays.indexOf(dayId);
    if (index > -1) {
      this.newTraineeship.ignoredDays.splice(index, 1);
    } else {
      this.newTraineeship.ignoredDays.push(dayId);
    }
  }

  public createTraineeship(): void {
    if (!this.newTraineeship.name || !this.newTraineeship.start || !this.newTraineeship.end || this.newTraineeship.groups.length === 0) {
      return;
    }

    const start = this.newTraineeship.start;
    const end = this.newTraineeship.end;

    this.http.post(
      Config.API_URL + '/v1/traineeship/new_traineeship',
      {
        name: this.newTraineeship.name,
        start: start.toISOString(),
        end: end.toISOString(),
        groups: this.newTraineeship.groups,
        ignoredDays: this.newTraineeship.ignoredDays
      },
      { withCredentials: true }
    ).subscribe((res: any) => {
      if (res && res.status === 'success') {
        const newWeek: DiaryWeek = {
          companyId: 0,
          name: this.newTraineeship.name,
          companyName: this.newTraineeship.name,
          start: start,
          end: end,
          state: 'planned',
          status: 'planned',
          ignoredDays: this.newTraineeship.ignoredDays.map(String),
          zapsaniStudenti: 0,
          celkemStudentu: 0,
          instructorId: null,
          instructor: null,
          traineeship: Date.now(),
          activity: 'Traineeship',
          start_working_hours: '08:00',
          end_working_hours: '16:00',
          web: '',
          rating: null,
          cityName: ''
        };

        const currentWeeks = this.traineeship.diaryWeeks.getValue();
        this.traineeship.diaryWeeks.next([newWeek, ...currentWeeks]);
        
        this.closeCreateModal();
      }
    });
  }
}
