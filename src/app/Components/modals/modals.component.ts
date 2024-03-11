import { Component, Renderer2 } from '@angular/core';
import { Modals } from './modals';
import { Locale } from '@Schoolingo/Locale';
import { FormControl } from '@angular/forms';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { Calendar } from '@Components/calendar/calendar';
import { SocketService } from '@Schoolingo/Socket';
import { Schoolingo } from '@Schoolingo';

@Component({
  selector: 'schoolingo-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css', '../../input.css', '../../Board/board.css']
})
export class ModalsComponent {
  constructor(
    public modals: Modals,
    public locale: Locale,
    public schoolingo: Schoolingo,
    public dropdowns: Dropdowns,
    private calendar: Calendar,
    private socketService: SocketService
  ) {}



/** INPUTS */


/* HOMEWORKS */
  public HOMEWORK_getStudent(student: number): any {
    return this.modals.data.students.filter((st: any) => st.student == student)[0] ?? undefined;
  }

  public HOMEWORK_getStudentID(student: number): number {
    return this.modals.data.students.findIndex((st: any) => st.student == student);
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
        case "service":
          if (this.modals.data.serviceList.length == 0) return;
          this.modals.data.selectedStudents = JSON.parse(JSON.stringify(this.modals.data.serviceList));
          break;
        case "absence":
          if (this.modals.data.absenceList.length == 0) return;
          this.modals.data.selectedStudents = JSON.parse(JSON.stringify(this.modals.data.absenceList));
          break;
        case "nonAbsence":
          if (this.modals.data.nonAbsenceList.length == 0) return;
          this.modals.data.selectedStudents = JSON.parse(JSON.stringify(this.modals.data.nonAbsenceList));
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
  
    if (this.modals.data.homework.value == '' || this.modals.data.selectedStudents.length == 0 || calStart.date == calEnd.date) return false;
    return true;
  }

  public HOMEWORK_save(): void {
    this.modals.formErrors = [];
    let calEnd = this.calendar.getCalendar('HOMEWORK_ENDDATE');
    if (!this.HOMEWORK_canCreate()) {
      let calStart = this.calendar.getCalendar('HOMEWORK_STARTDATE');

      if (this.modals.data.homework.value == '') {
        this.modals.formErrors.push({ input: 'homework', locale: 'required' });
      }
      if (this.modals.data.selectedStudents.length == 0) {
        this.modals.formErrors.push({ input: 'students', locale: 'atleast1student' });
      }
      if (calStart.date == calEnd.date) {
        this.modals.formErrors.push({ input: "endDate", locale: "cannotbesamedate" });
      }
      return;
    }
    this.modals.data.isSaving = true;
    this.socketService.getSocket().Socket?.emit('setHomework',
    {
      text: this.modals.data.homework.value,
      note: this.modals.data.note.value,
      students: this.modals.data.selectedStudents,
      end: calEnd.date,
      type: this.modals.data.type,
      lesson: this.modals.data.lesson
    } 
    );
  }

}
