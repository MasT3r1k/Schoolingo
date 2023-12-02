import { Component, OnInit } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css', '../../board.css']
})
export class SubjectsComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo,
    public locale: Locale
  ) {}


  ngOnInit(): void {
  }


  public getSubjectsWithTeachers(): [number, [number]][] {

    let subjects: [number, [number]][] = [];

    let _ = this.schoolingo.getTimetableLessons();
    for(let i = 0;i < _.length;i++) {
      _[i].filter((__) => __[0].subject != -1).forEach((___) => {
        if (___[0].subject == -1) return;
        let fs = subjects.filter((a) => a[0] == ___[0].subject);
        if (fs.length > 0 && fs[0][1].includes(___[0].teacher)) return;
        if (fs.length > 0) {
          if (!fs[0][1].includes(___[0].teacher)) {
            let is = subjects.indexOf(fs[0]);
            subjects[is][1].push(___[0].teacher);
          }
          return;
        }
        subjects.push([___[0].subject, [___[0].teacher]]);
      })
    }

    return subjects;
  }

}
