import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
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
  public calendarDate: Date = this.schoolingo.getToday();
  public tabName: string = 'TridniKniha_TABS';

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    private DatePipe: DatePipe,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.calendar.setValue(this.DatePipe.transform(this.calendarDate, 'yyyy-MM-dd'));
    this.calendarEvent = this.calendar.valueChanges.subscribe((value: string | null): void => {
      this.calendarDate = new Date(value as string);
    })
  }

  ngOnDestroy(): void {
    this.calendarEvent.unsubscribe();
  }

}
