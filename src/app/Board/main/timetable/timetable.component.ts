import { Tabs } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';

@Component({
  selector: 'module-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../module.css', '../../board.css']
})
export class TimetableComponent {

  constructor(
    public locale: Locale,
    public board: Schoolingo,
    public tabs: Tabs
  ) {}

  public tabName: string = 'Main_Module_Timetable';
  public selectedDay = this.board.getToday();

  // public selectLastDay(): void {
  //   if (this.selectedDay.getHours() != 4) {
  //     this.selectedDay.setHours(4);
  //   }
  //   let last = this.board.getLastStudyDay(this.selectedDay);
  //   last.setHours(4);
  //   this.selectedDay = last;
  // }

  // public selectNextDay(): void {
  //   if (this.selectedDay.getHours() != 20) {
  //     this.selectedDay.setHours(20);
  //   }
  //   let next = this.board.getNextStudyDay(this.selectedDay);
  //   next.setHours(20);
  //   this.selectedDay = next;
  // }

}
