import { Tabs } from '@Components/Tabs/Tabs';
import { Calendar } from '@Components/calendar/calendar';
import { CalendarComponent, CalendarOptions } from '@Components/calendar/calendar.component';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './classbook.component.html',
  styleUrls: ['./classbook.component.css', '../../board.css', '../../../Components/Tabs/tabs.component.css']
})
export class ClassbookComponent {
  public tabName: string = 'TridniKniha_TABS';
  public declare calendarEl: CalendarComponent;

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public tabs: Tabs,
    public socketService: SocketService,
    public calendarService: Calendar
  ) {}

  public selectedLesson: number | undefined = undefined;
  lessonNumber = new FormControl('');
  lessonTopic = new FormControl('');
  lessonNote = new FormControl('');
  public calendarName: string = 'Calendar_Classbook';
  public calendarOptions: CalendarOptions = {  };

  public selectLesson(lesson: number): void {
    if (!this.calendarEl) return;
    if (
      this.selectedLesson == lesson ||
      this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1].lessons[lesson][0].isEmpty == true
      ) return;

    this.selectedLesson = lesson;
    this.tabs.setTabValue(this.tabName, 0);
  }

  ngOnInit(): void {
    let i = 0;
    do {
      this.selectLesson(i);
      i++;
    } while (this.selectedLesson == undefined && i < 16);

    setTimeout(() => {
      this.calendarEl = this.calendarService.getCalendar(this.calendarName);
      if (this.calendarEl) {
        this.calendarEl.customPickFunction = (value: string | null): void => {
          this.schoolingo.refreshTimetable();
          let i = 0;
          this.selectedLesson = undefined;
          do {
            this.selectLesson(i);
            i++;
          } while (this.selectedLesson == undefined);
        };
      }
    });
  }

}
