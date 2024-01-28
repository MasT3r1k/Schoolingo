import { Component } from '@angular/core';
import { Modals } from './modals';
import { Locale } from '@Schoolingo/Locale';
import { FormControl } from '@angular/forms';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { Calendar } from '@Components/calendar/calendar';
import { SocketService } from '@Schoolingo/Socket';

@Component({
  selector: 'schoolingo-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css', '../../input.css', '../../Board/board.css']
})
export class ModalsComponent {
  constructor(
    public modals: Modals,
    public locale: Locale,
    public dropdowns: Dropdowns,
    private calendar: Calendar,
    private socketService: SocketService
  ) {}

/** INPUTS */
  /* HOMEWORKS */
  public HOMEWORK_homework = new FormControl('');
  public HOMEWORK_note = new FormControl('');

  public HOMEWORK_getStudent(student: number): any {
    return this.modals.data.students.filter((st: any) => st.student == student)[0] ?? undefined;
  }

  public HOMEWORK_selectStudents(who: string | number): void {
    if (typeof who == 'string') {
      switch(who) {
        case "all":
          this.modals.data.selectedStudents = [];
          this.modals.data.students.forEach((student: any): void => {
            this.modals.data.selectedStudents.push(student.student);
          });
          break;
        
      }
      return;
    }
    if (typeof who == 'number') {
      if (!this.modals.data.selectedStudents.includes(who)) {
        this.modals.data.selectedStudents.push(who);
        this.modals.data.selectedStudents.sort((a: number, b: number): any => {
          let stA: any = this.HOMEWORK_getStudent(a);
          let stB: any = this.HOMEWORK_getStudent(b);
          if (stA.lastName < stB.lastName) {
            return -1;
          }
          if (stA.lastName > stB.lastName) {
            return 1;
          }
        })
        return;
      }
      this.modals.data.selectedStudents.splice(this.modals.data.selectedStudents.indexOf(who), 1);
      return;
    }
  }

  public HOMEWORK_canCreate(): boolean {
    let calStart = this.calendar.getCalendar('HOMEWORK_STARTDATE');
    let calEnd = this.calendar.getCalendar('HOMEWORK_ENDDATE');
  
    if (this.HOMEWORK_homework.value == '' || this.modals.data.selectedStudents.length == 0 || calStart.date == calEnd.date) return false;
    return true;
  }

  public HOMEWORK_save(): void {
    if (!this.HOMEWORK_canCreate()) return;
    this.socketService.getSocket().Socket?.emit('');
  }

}
