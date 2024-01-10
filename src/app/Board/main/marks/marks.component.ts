import { grade } from '@Schoolingo/Board.d';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';

@Component({
  selector: 'module-marks',
  templateUrl: './marks.component.html',
  styleUrls: ['./marks.component.css', '../module.css', '../../board.css', '../timetable/timetable.component.css']
})
export class MarksComponent {
  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo
  ) {}

  public grades = this.schoolingo.getGrades().sort((a: grade, b: grade) => {
    return +b.date - +a.date;
  }).slice(0, 10);

}
