import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs';
import { Authentication } from '@Schoolingo/authentication';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-midterm',
  imports: [TabsComponent],
  templateUrl: './midterm.component.html',
  styleUrl: './midterm.component.css'
})
export class MidtermComponent implements OnInit {
  private u = inject(Authentication);
  public l = inject(Locale);
  public selectedTab = new BehaviorSubject(0);
  public options = ['marks.midterm.tabs.marks', 'marks.midterm.tabs.reports'];
  
  public midterm_grades: {[ key: ('mandatory' | 'optional' | string) ]: any[]} = {
    null: [
      {
        subjectName: "Chování",
        semesters: [1, 1, 1, 1, 1, 1, null, null],
      }
    ],
    mandatory: [
      {
        subjectName: "Matematika",
        semesters: [2, 3, 2, 2, 1, 2, null, null],
      },
      {
        subjectName: "Český jazyk",
        semesters: [1, 1, 1, 1, 2, 2, null, null],
      },
      {
        subjectName: "Angličtina",
        semesters: [1, 2, 1, 1, 1, 1, null, null],
      }
    ],
    optional: [
      {
        subjectName: "Programování",
        semesters: [1, 1, null, null, null, null, null, null],
      }
    ]
  };

  public getYears(): number {
    return this.u.getUser().classes[0].scopeYears;
  }

  public getYearText(year: number): string {
    return this.l.s('marks.midterm.year')
            .replaceAll(
              '%year%',
              (this.l.s('marks.midterm.years.' + year) != "[`marks.midterm.years.${$index}`]")
              ? this.l.s('marks.midterm.years.' + year)
              : year.toString()
            );
  }

  ngOnInit(): void {
  }
}
