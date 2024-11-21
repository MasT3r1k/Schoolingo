import { Component, OnInit } from '@angular/core';
import { Schoolingo, Absence } from '@Schoolingo';
import { AbsenceType } from '@Schoolingo/Absence';

type alerts = "unexcusedAbsence" | "unreadMessages" | "studentService";

@Component({
  host: {'module': 'Announcements'},
  standalone: true,
  imports: [],
  templateUrl: './Announcements.html',
  styleUrls: ['./Announcements.css', '../Modules.css']
})
export class AnnouncementsComponent implements OnInit {

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
  }

  public getUnexcusedAbsence(): number {
    let count = 0;
    Object.values(this.schoolingo.absence).forEach((day: Absence[]) => {
      day.forEach((absence: Absence) => {
        if (absence.type === AbsenceType.UNEXCUSED) {
          count++;
        }
      })
    })
    return count;
  }

  public getDescription(type: alerts): string {
    switch(type) {
      case "unexcusedAbsence":
        return this.schoolingo.locale.getLocale('annoucementModule/unexcusedAlert')
        .replaceAll('%unexcused%', this.getUnexcusedAbsence().toString());
      case "unreadMessages":
        return this.schoolingo.locale.getLocale('annoucementModule/unreadMessages')
        .replaceAll('%unread%', this.schoolingo.messages.unreadMessage.getValue().toString());
      case "studentService":
        if (this.schoolingo.studentService.status === true) {
          return this.schoolingo.locale.getLocale('annoucementModule/studentService')
            .replaceAll('%start%', this.schoolingo.studentService.start.format('DD.MM.'))
            .replaceAll('%end%', this.schoolingo.studentService.end.format('DD.MM.'));
        }
        return "";
      default:
        return "";
    }
  }
}
