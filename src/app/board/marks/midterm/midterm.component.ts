import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-midterm',
  imports: [TabsComponent],
  templateUrl: './midterm.component.html',
  styleUrl: './midterm.component.css'
})
export class MidtermComponent implements OnInit {
  private http = inject(HttpClient);
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
    if (this.u.getUser().children.length) {
      return this.u.getUser().children[this.u.selectedChild.getValue()].classes[0].scopeYears;
    } else {
      return this.u.getUser().classes[0].scopeYears;
    }
  }

  public getYearText(year: number): string {
    return this.l.s(
      'marks.midterm.year',
      {
        year: (this.l.s('marks.midterm.years.' + year) != "[`marks.midterm.years.${$index}`]")
            ? this.l.s('marks.midterm.years.' + year)
            : year
      }
    );
  }

  ngOnInit(): void {
    this.http.get(
      `${Config.API_URL}/v1/marks/midterm?student_id=${this.u.getId()}`,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      let mandatorySubjects = data.subjects.filter((subject: any) => subject.is_mandatory == 1);
      this.midterm_grades['mandatory'] = mandatorySubjects.map((subject: any) => {
        let semesters = [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ];
        
        return {
          subjectName: subject.subjectName,
          semesters
        }
      });
      console.log(data)
    })
  }
}
