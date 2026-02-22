import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { SupervisionBuilder } from '@Schoolingo/supervision_builder';
import { CdkDrag, CdkDropList, CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { DropdownManager } from '@Schoolingo/dropdown';
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';

@Component({
  selector: 'app-supervision-builder',
  standalone: true,
  imports: [IconsModule, FormsModule, ReactiveFormsModule, CdkDrag, CdkDropList, CdkDropListGroup, CalendarComponent],
  templateUrl: './supervision-builder.component.html',
  styleUrl: './supervision-builder.component.css',
  providers: [SupervisionBuilder]
})
export class SupervisionBuilderComponent implements OnInit {
  public l = inject(Locale);
  public supervisionBuilder = inject(SupervisionBuilder);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public calendarManager = inject(CalendarManager);
  public Utils = Utils;
  public selected_date: moment.Moment = moment();

  ngOnInit(): void {
    this.supervisionBuilder.isScheduleLoading = false;

    // Load Teachers
    this.http.get<any[]>(
      `${Config.API_URL}/v1/teachers`,
      { withCredentials: true }
    )
    .subscribe((data) => {
        // Teachers usually returned as list
        this.supervisionBuilder.teachers = data.sort((a: any, b: any) => {
            return (a.lastName + ' ' + a.firstName).localeCompare(b.lastName + ' ' + b.firstName);
        });
        this.supervisionBuilder.isTeachersLoading = false;
    });

    // Load Places
    this.http.get(
      `${Config.API_URL}/v1/supervision/places`,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      if ('places' in data) {
        this.supervisionBuilder.places = data.places;
      }
    });

    this.supervisionBuilder.selectedPlace.subscribe((data) => {
      if (!data) return;
      this.refreshLoad();
    })
  }

  ngAfterViewInit(): void {
  }

  public selectWeek(n: number): void {
    this.selected_date = this.selected_date.clone().add(n, 'week');
    this.refreshLoad();
  }

  public drop(event: CdkDragDrop<any[]>, dayIndex?: number, hourIndex?: number): void {
    if (event.previousContainer === event.container) return;

    if (dayIndex !== undefined && hourIndex !== undefined && event.item.data) {
        const teacher = event.item.data;
        const placeId = this.supervisionBuilder.selectedPlace.getValue();
        
        // Directly create supervision for now (or open modal if description needed)
        // I'll do direct create to start, can add modal later
        this.http.post(
            `${Config.API_URL}/v1/supervision/manage`,
            {
                action: 'create',
                day: dayIndex,
                hour: hourIndex,
                teacherId: teacher.teacherId,
                placeId: placeId,
                description: ''
            },
            { withCredentials: true }
        ).subscribe((res: any) => {
            if (res.success) {
                this.refreshLoad();
            }
        });
    }
  }

  public deleteSupervision(supervisionId: number): void {
      if (!supervisionId) return;
      this.http.post(
          `${Config.API_URL}/v1/supervision/manage`,
          {
              action: 'delete',
              supervisionId: supervisionId
          },
          { withCredentials: true }
      ).subscribe((res: any) => {
          if (res.success) {
              this.refreshLoad();
          }
      });
  }

  public selectPlace(placeId: number): void {
    this.supervisionBuilder.selectedPlace.next(placeId);
  }

  public refreshLoad(): void {
    const placeId = this.supervisionBuilder.selectedPlace.getValue();
    if (!placeId) return;
    
    this.supervisionBuilder.isScheduleLoading = true;
    
    this.http.get(
      `${Config.API_URL}/v1/supervision/schedule?placeId=${placeId}`,
      { withCredentials: true })
    .subscribe((data: any) => {
      let scheduleBuild: any[][][] = [];
        // Initialize empty schedule
        for (let i = 0; i < 5; i++) {
            scheduleBuild[i] = [];
            for (let j = 0; j < this.supervisionBuilder.hours.length; j++) {
                scheduleBuild[i][j] = [];
            }
        }

      if (data.supervisions) {
         data.supervisions.forEach((item: any) => {
             if (item.day >= 0 && item.day < 5 && item.hour >= 0 && item.hour < this.supervisionBuilder.hours.length) {
                 scheduleBuild[item.day][item.hour].push(item);
             }
         });
      }

      this.supervisionBuilder.schedule = scheduleBuild;
      this.supervisionBuilder.isScheduleLoading = false;
    });
  }

  public getLessonClasses(index: number, index2: number, supervision: any): string[] {
    let classes = ['sub-lesson-hour'];
    // Add logic for styling if needed
    return classes;
  }
}
