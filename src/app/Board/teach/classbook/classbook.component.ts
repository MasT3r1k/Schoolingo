import { Tabs } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { DatePipe } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './classbook.component.html',
  styleUrls: ['./classbook.component.css', '../../board.css', '../../../Components/Tabs/tabs.component.css']
})
export class ClassbookComponent {
  calendar = new FormControl('');
  private declare calendarEvent;
  public calendarDate: Date = new Date(2023, 12, 1);
  public tabName: string = 'TridniKniha_TABS';

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    private DatePipe: DatePipe,
    private renderer: Renderer2,
    public tabs: Tabs,
    public socketService: SocketService
  ) {}

  public selectedLesson: number | undefined = undefined;
  lessonNumber = new FormControl('');
  lessonTopic = new FormControl('');
  lessonNote = new FormControl('');

  public selectLesson(lesson: number): void {
    if (
      this.selectedLesson == lesson ||
      this.schoolingo.getTimetable()[this.calendarDate.getDay() - 1].lessons[lesson][0].isEmpty == true
      ) return;

    this.selectedLesson = lesson;
    this.tabs.setTabValue(this.tabName, 0);
  }

  ngOnInit(): void {
    let i = 0;
    do {
      this.selectLesson(i);
      i++;
    } while (this.selectedLesson == undefined);
    this.calendar.setValue(this.DatePipe.transform(this.calendarDate, 'yyyy-MM-dd'));
    this.calendarEvent = this.calendar.valueChanges.subscribe((value: string | null): void => {
      this.calendarDate = new Date(value as string);
      this.schoolingo.selectWeek(this.calendarDate.getWeek());
      this.schoolingo.refreshTimetable();
      let i = 0;
      this.selectedLesson = undefined;
      do {
        this.selectLesson(i);
        i++;
      } while (this.selectedLesson == undefined);
    })

  }

  ngOnDestroy(): void {
    this.calendarEvent.unsubscribe();
  }

}
