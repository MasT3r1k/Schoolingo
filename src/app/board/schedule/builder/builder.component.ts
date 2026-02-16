import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { ScheduleBuilder } from '@Schoolingo/schedule_builder';
import { AddEventComponent } from '../add-event/add-event.component';
import { CdkDrag, CdkDropList, CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import moment from 'moment';
import { TimetableLesson } from '../../Teach/timetable/timetable.component';
import { NgClass } from '@angular/common';
import { DropdownManager } from '@Schoolingo/dropdown';
import { EditLessonComponent } from '../edit-lesson/edit-lesson.component';
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import { Utils } from '@Schoolingo/utils';

@Component({
  selector: 'app-builder',
  imports: [IconsModule, FormsModule, ReactiveFormsModule, CdkDrag, CdkDropList, CdkDropListGroup, NgClass, CalendarComponent],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.css'
})
export class BuilderComponent implements OnInit {
  public alerts: any = {};
  public l = inject(Locale);
  public scheduleBuilder = inject(ScheduleBuilder);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public calendarManager = inject(CalendarManager);
  public Utils = Utils;
  public selected_date: moment.Moment = moment();

  ngOnInit(): void {
    this.scheduleBuilder.isTimetableLoading = false;

    this.modalManager.addModal(
      'schedule_add_event',
      {
        title: 'schedule.builder.add_event',
        closeable: true,
        items: [
          {
            type: 'component',
            component: AddEventComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'schedule_edit_lesson',
      {
        title: 'schedule.builder.edit_lesson',
        closeable: true,
        items: [
          {
            type: 'component',
            component: EditLessonComponent
          }
        ]
      }
    )

    this.http.get(
      `${Config.API_URL}/v1/schedule/all_subjects`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('subjects' in data) {
        this.scheduleBuilder.all_subjects = (data.subjects as any[])
        .sort((a, b) => {
          return ('' + a.subjectName).localeCompare(b.subjectName);
        });
      }
      if ('teachers' in data) {
        this.scheduleBuilder.teachers = data.teachers as any;
      }
    });

    this.scheduleBuilder.selectedClass.subscribe((data) => {
      if (!data) return;
      // Load class subjects
      this.http.get(
        `${Config.API_URL}/v1/schedule/subjects?classId=${this.scheduleBuilder.selectedClass.getValue()}`,
        { withCredentials: true }
      )
      .subscribe((data) => {
        console.log(data)
        if ('subjects' in data) {
          this.scheduleBuilder.subjects = data.subjects as any[];
          this.scheduleBuilder.isTimetableLoading = false;
          this.scheduleBuilder.isSubjectsLoading = false;
        }
      })
      // Load timetable
      this.refreshLoad();
    })

    this.http.get(
      `${Config.API_URL}/v1/schedule/classes`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('classes' in data) {
        this.scheduleBuilder.classes = data.classes as any[];
        console.log(this.scheduleBuilder.classes)
      }
      console.log(data)
    })
  }

  ngAfterViewInit(): void {
    this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].subscribe((new_date) => {
      this.selected_date = new_date.clone();
      this.refreshLoad();
    })
  }

  public timetable_types: any = {
    teaching: {
      name: 'Výuka',
      color: '#3498db'
    },
    substitution: {
      name: 'Suplování',
      color: 'hsla(353deg, 85%, 53%, .16)'
    },
    cancelled_hour: {
      name: 'Zrušená hodina',
      color: '#e74c3c'
    },
    trip: {
      name: 'Výlet',
      color: '#2ecc71'
    },
    holiday: {
      name: 'Prázdniny',
      color: '#61B0FF'
    },
    tutoring: {
      name: 'Doučování',
      color: '#8e44ad'
    },
    advice: {
      name: 'Porada',
      color: '#1abc9c'
    },
    school_event: {
      name: 'Školní akce',
      color: '#f39c12'
    },
    class_meeting: {
      name: 'Třídní schůzka',
      color: '#d35400'
    },
    class_lesson: {
      name: 'Třídní hodina',
      color: '#4A90E2'
    },
    exam: {
      name: 'Zkouška',
      color: '#c0392b'
    }
  }

  public selectWeek(n: number): void {
    const selectedWeek = this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].getValue().add(n, 'week');
    this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].next(selectedWeek);
    this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[1].next(selectedWeek);
  }

  public clearTimetable(): void {
    this.scheduleBuilder.subjects = [];
    this.scheduleBuilder.isTimetableLoading = false;
    this.scheduleBuilder.isSubjectsLoading = false;
  }

  public openSettings(): void {
    this.modalManager.openModal('schedule_settings');
  }

    public drop(event: CdkDragDrop<any[]>, dayIndex?: number, hourIndex?: number): void {
    if (event.previousContainer === event.container && event.currentIndex === event.previousIndex) return;

    if (dayIndex !== undefined && hourIndex !== undefined && event.item.data) {
        const data = event.item.data;
        let newLesson: any;

        if ('lessonId' in data && data.lessonId) {
            // Existing lesson being moved
            newLesson = {
                ...data,
                day: dayIndex,
                hour: hourIndex
            };
        } else {
            // New subject from sidebar
            newLesson = {
                lessonId: null,
                day: dayIndex,
                hour: hourIndex,
                subjectId: data.subjectId,
                subjectName: data.subjectName,
                subjectShortcut: data.subjectShortcut,
                teacherId: null,
                room: '',
                groupId: this.scheduleBuilder.classes.find(c => c.classId == this.scheduleBuilder.selectedClass.getValue())?.groupId || 0,
                type: 0,
                week: 'both',
                empty: false
            };
        }
        this.openEditLessonModal(newLesson);
    }
  }

  public selectClass(class_id: number): void {
    this.scheduleBuilder.selectedClass.next(class_id);
  }

  public refreshLoad(): void {
    if (!this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].getValue()) return;
    const currentWeekStart = this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].getValue().clone().startOf('isoWeek');

    this.scheduleBuilder.isTimetableLoading = true;
    this.http.get<any[]>(
      Config.API_URL + '/v1/teachers',
      { withCredentials: true }
    )
    .subscribe((teachers: any[]) => {
      teachers.forEach((teacher) => {
        this.scheduleBuilder.teachers[teacher.teacherId] = teacher;
      }); 
    })

    this.http.post(
      Config.API_URL + '/v1/timetable',
      {
        type: 'class',
        id: this.scheduleBuilder.selectedClass.getValue(),
        time: this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].getValue().format("YYYY-MM-DD")
      },
      { withCredentials: true })
    .subscribe((data: any) => {
      
      // Initialize 5 days, 8 hours (or dynamic)
      // We'll use 0-4 as indices for the view.
      let timetableBuild: any[][][] = Array.from({ length: 5 }, () => []); 

      // Helper to ensure hour slot exists
      const ensureSlot = (d: number, h: number) => {
         if (!timetableBuild[d]) timetableBuild[d] = []; // Should exist from init, but safety
         if (!timetableBuild[d][h]) timetableBuild[d][h] = [];
      };

      // 1. Fill with regular timetable lessons
      if (data.timetable) {
          Object.values(data.timetable).forEach((item: any) => {
            // Assume DB day is 1-based (Monday=1). View is 0-based.
            const dayIndex = item.day - 1; 
            const hourIndex = item.hour - 1;

            if (dayIndex < 0 || dayIndex > 4) return; // Skip weekends or invalid

            ensureSlot(dayIndex, hourIndex);

            timetableBuild[dayIndex][hourIndex].push({
                ...item,
                color: "",
                all_day: false,
                hour: hourIndex,     // Store 0-based hour
                day: dayIndex,       // Store 0-based day
                subjectName: item.subjectName,
                subjectShortcut: item.subjectShortcut,
                empty: false
            });
          });
      }

      // 2. Apply Substitutions
      if (data.substitution) {
          data.substitution.forEach((sub: any) => {
            const subMoment = moment(sub.start_date);
            
            const dayIndex = subMoment.isoWeekday() - 1;
            
            if (dayIndex < 0 || dayIndex > 4) return;

            // Determine Start/End Hour (0-based)
            const startHour = sub.start_hour - 1;
            const endHour = sub.end_hour - 1;

            for (let h = startHour; h <= endHour; h++) {
                if (h < 0) continue;
                ensureSlot(dayIndex, h);
                const existingIndex = timetableBuild[dayIndex][h].findIndex(l => l.groupId === sub.groupId);
                let item = timetableBuild[dayIndex][h][existingIndex];

                const subLesson = {
                    lessonId: null,
                    ...sub,
                    type: 0,
                    subjectName: sub.subjectName,
                    subjectShortcut: sub.subjectShortcut,
                    all_day: (sub.start_hour == -1 || sub.end_hour == -1),
                    teacher: sub.teacherId,
                    lastName: sub.lastName,
                    room: sub.room,
                    oldTeacher: item.teacher,
                    oldSubject: item.subjectShortcut,
                    className: sub.className,
                    group: { id: sub.groupId || -1, text: sub.groupName || '', num: sub.groupNum || '' },
                    day: dayIndex,
                    hour: h,
                    empty: false,
                    isSubstitution: true // Marker
                };
                
                if (existingIndex !== -1) {
                  timetableBuild[dayIndex][h][existingIndex] = {
                    ...timetableBuild[dayIndex][h][existingIndex],
                    ...subLesson,
                    type: 0
                  };
                } else {
                    timetableBuild[dayIndex][h].push(subLesson);
                }
            } 
          });
      }

      this.scheduleBuilder.timetable = timetableBuild;
      this.scheduleBuilder.isTimetableLoading = false;
    }, (err) => {
      this.scheduleBuilder.isTimetableLoading = true;
      this.scheduleBuilder.timetable = [];
    });
  }

  public countUsedSubjectLesson(subject_id: number): number {
    let used = 0;
    this.scheduleBuilder.timetable.forEach((day) => {
        day.forEach((hour) => {
          for(let i = 0;i < hour.length;i++) {
            if (hour[i].subjectId == subject_id) {
              used += hour[i].type == 0 ? 1 : 0.5;
            }
          }
        })
    })
    return used;
  }

  public countSubstitutionLesson(): number {
    let used = 0;
    this.scheduleBuilder.timetable.forEach((day) => {
        day.forEach((hour) => {
          for(let i = 0;i < hour.length;i++) {
            if (hour[i].isSubstitution == true) {
              used += 1;
            }
          }
        })
    })
    return used;
  }

  public formatGroupName(lesson: TimetableLesson): string {
    let group = "";
    if (lesson.groupName == null) {
      group = lesson.className;
    } else {
      group = lesson.groupName;
    }
    if (lesson.groupNum == null) {
      group += " celá";
    } else {
      group += " " + lesson.groupNum;
    }
    return group;
  }

  public getLessonClasses(index: number, index2: number, lesson: TimetableLesson): string[] {
  let classes = ['sub-lesson-hour', 'lesson-count-' + this.scheduleBuilder.timetable?.[index]?.[index2]?.length];
  if (lesson.empty) {
    classes.push('empty');
  }

  // if (this.schoolingo.isClassbook(index - 1, index2)) {
  //   classes.push('classbook');
  // }

  // let day = thissubstitution[Utils.getDayOfWeek(this.timetableSelectedWeek.getValue()!, index - 1).format('YYYY-MM-DD')];

  if (lesson.isSubstitution) {
    classes.push('substitution');
  }

  return classes;
}

  public openAddEventModal(): void {
    this.modalManager.openModal('schedule_add_event');
  }

  public openEditLessonModal(lesson: TimetableLesson | null, day?: number, hour?: number): void {
    if (!lesson && day !== undefined && hour !== undefined) {
        lesson = {
            lessonId: null,
            day: day,
            hour: hour,
            subjectId: 0,
            subjectName: '',
            subjectShortcut: '',
            teacherId: 0,
            room: '',
            groupId: this.scheduleBuilder.classes.find(c => c.classId == this.scheduleBuilder.selectedClass.getValue())?.groupId || 0,
            type: 0,
            week: 'both',
            empty: false
        } as unknown as TimetableLesson;
    }
    this.scheduleBuilder.activeLesson = lesson;
    this.modalManager.openModal('schedule_edit_lesson');
  }
}
