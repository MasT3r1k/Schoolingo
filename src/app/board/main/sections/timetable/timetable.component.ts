import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { TimetableHours, TimetableLesson } from '../../../Teach/timetable/timetable.component';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';

interface TimetableAPI {
  day: number;
  hour: number;
  type: number;
  room: string;
  free: boolean;
  end: boolean;
  subjectId: number;
  subjectName: string;
  subjectShortcut: string;
  lastName: string;
  teacher: string;
}

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
  public timetable: TimetableAPI[] = [];
  public hours: TimetableHours[] = [];
  public max_hours = 0;

  public getSelectedDateLessons(): TimetableAPI[] {
    const day = this.selected_date.getValue().isoWeekday();
    // Hodiny pro daný den
    const lessons = this.timetable
      .filter((lesson: any) => lesson.day === day && (lesson.type == 0 || (lesson.type == 1 && this.selected_date.getValue().isoWeek() % 2) || (lesson.type == 2 && this.selected_date.getValue().isoWeek() % 2 == 0)));

    if (!lessons.length) return [];

    // Získáme seznam existujících hodin, např. [1, 2, 4, 5]
    const existingHours = lessons.map(l => l.hour);
    const maxHour = Math.max(...existingHours);

    const fullList: TimetableAPI[] = [];
    

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

  public getLessonSubjectName(lesson: TimetableAPI): string {
    if (lesson.end) {
      return this.l.s('timetable.end_class');
    }

    if (lesson.free) {
      return this.l.s('timetable.free_time');
    }

    return lesson.subjectName;
  }

  public getLessonTime(lesson: TimetableAPI): string {
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
      if ('timetable' in data) {
        this.timetable = data.timetable.map((lesson: TimetableAPI) => ({...lesson, free: false}));
        const existingHours = this.timetable.map(l => l.hour);
        this.max_hours = Math.max(...existingHours);

        let schoolConfig = this.school.config.getValue();
        let time = moment()
        .set('hours', schoolConfig?.startHour!)
        .set('minutes', schoolConfig?.startMinute!);

        for(let i = 1;i <= this.max_hours;i++) {
          let startHour = time.clone();
          time.add(schoolConfig?.lessonHour, 'minutes');
          this.hours.push(
            {
              startMoment: startHour.clone(),
              start: startHour.format('HH:mm'),
              endMoment: time.clone(),
              end: time.format('HH:mm')
            }
          );
          let customBreak = schoolConfig?.breaks.filter((_) => _.hour == i + 1)[0]?.minutes;
          time.add(customBreak || schoolConfig?.breakTime, 'minutes');
        }
      }
      console.log(data)
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
