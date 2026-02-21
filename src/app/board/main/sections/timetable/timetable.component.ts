import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { TimetableAPI, TimetableHours, TimetableLesson, TimetableLessonAPI } from '../../../Teach/timetable/timetable.component';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';

@Component({
  imports: [IconsModule],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.css'
})
export class TimetableComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private school = inject(School);
  private u = inject(Authentication);
  public selected_date = new BehaviorSubject(moment());
  public timetable: TimetableLessonAPI[] = [];
  public hours: TimetableHours[] = [];
  public max_hours = 0;

  public getSelectedDateLessons(): (TimetableLessonAPI | any)[] {
    const day = this.selected_date.getValue().isoWeekday();
    // Hodiny pro daný den
    const lessons: TimetableLessonAPI[] = this.timetable
      .filter((lesson: any) => lesson.day === day && (lesson.type == 0 || (lesson.type == 1 && this.selected_date.getValue().isoWeek() % 2) || (lesson.type == 2 && this.selected_date.getValue().isoWeek() % 2 == 0)));

    if (!lessons.length) return [];

    // Získáme seznam existujících hodin, např. [1, 2, 4, 5]
    const existingHours = lessons.map((l: TimetableLessonAPI) => l.hour!);
    const maxHour = Math.max(...existingHours);

    const fullList: any[] = [];
    

    for (let h = 1; h <= maxHour; h++) {
      const found = lessons.find((l: any) => l.hour === h);

      if (found) {
        fullList.push(found);
      } else {
        // volná hodina
        fullList.push({
          day,
          hour: h,
          type: 0,
          free: true,
          end: false,
          subjectId: -1,
          subjectName: "",
          subjectShortcut: "",
          teacher: "",
          lastName: "",
          room: ""
        });
      }
    }

      // Konec vyučování
      fullList.push({
        day,
        hour: (fullList[fullList.length - 1].hour || 0) + 1,
        type: 0,
        free: true,
        end: true,
        subjectId: -1,
        subjectName: "",
        subjectShortcut: "",
        teacher: "",
        lastName: "",
        room: ""
      });

    return fullList;
  }

  public getLessonSubjectName(lesson: TimetableLessonAPI | any): string {
    if (lesson.end) {
      return this.l.s('timetable.end_class');
    }

    if (lesson.free) {
      return this.l.s('timetable.free_time');
    }

    return lesson.subject_name;
  }

  public getLessonTime(lesson: TimetableLessonAPI | any): string {
    if (lesson.end == true) return this.hours[lesson.hour - 2].end;
    return `${this.hours[lesson.hour - 1].start} - ${this.hours[lesson.hour - 1].end}`;
  }

  public loadTimetable(): void {
    this.http.post(
      Config.API_URL + '/v1/timetable',
      {
        type: 'person',
        id: this.u.getId(),
        time: this.selected_date.getValue().format("YYYY-MM-DD")
      },
      { withCredentials: true })
    .subscribe((data: any) => {
      const timetableData: TimetableLessonAPI[] = [];

      if ('timetable' in data) {
         data.timetable.forEach((lesson: any) => {
             timetableData.push({ ...lesson, free: false });
         });
      }

      if ('substitution' in data) {
         data.substitution.forEach((sub: any) => {
             const subDate = moment(sub.start_date);
             const subLesson: any = { 
                 day: subDate.isoWeekday(),
                 hour: sub.start_hour, 
                 type: 0,
                 room: sub.room,
                 free: false,
                 end: false,
                 subjectId: sub.subject_id,
                 subjectName: sub.subject_name || sub.event_name || 'Suplování',
                 subjectShortcut: sub.subject_shortcut || 'SUPL',
                 lastName: sub.last_name,
                 teacher: sub.teacher,
                 isSubstitution: true
             };

             for (let h = sub.start_hour; h <= sub.end_hour; h++) {
                 const existingIdx = timetableData.findIndex(l => l.day === subLesson.day && l.hour === h);
                 if (existingIdx !== -1) {
                     timetableData[existingIdx] = { ...timetableData[existingIdx], ...subLesson, hour: h };
                 } else {
                     timetableData.push({ ...subLesson, hour: h });
                 }
             }
         });
      }

      this.timetable = timetableData;

      if (this.timetable.length > 0) {
        const existingHours = this.timetable.map(l => l.hour);
        this.max_hours = Math.max(...existingHours);
        
        // Ensure max_hours includes substitution hours
        // Already done via spread? No, safely recalculate
        if (this.max_hours === -Infinity) this.max_hours = 0;

        let schoolConfig = this.school.config.getValue();
        let time = moment()
        .set('hours', schoolConfig?.start_hour!)
        .set('minutes', schoolConfig?.start_minute!);

        this.hours = []; // Reset hours to avoid duplicates on re-load
        
        for(let i = 1;i <= this.max_hours;i++) {
          let startHour = time.clone();
          time.add(schoolConfig?.lesson_hour, 'minutes');
          this.hours.push(
            {
              startMoment: startHour.clone(),
              start: startHour.format('HH:mm'),
              endMoment: time.clone(),
              end: time.format('HH:mm')
            }
          );
          let customBreak = schoolConfig?.breaks.filter((_) => _.hour == i + 1)[0]?.minutes;
          time.add(customBreak || schoolConfig?.break_time, 'minutes');
        }
      }
    });
  }

  ngOnInit(): void {
    this.u.getAuthState().subscribe((data) => {
      if (data) {
        this.loadTimetable();
      }
    });

    this.selected_date.subscribe(() => {
      // this.loadTimetable();
    })
  }
}
