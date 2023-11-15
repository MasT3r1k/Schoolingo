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

  public a: [number, [number]][] = [];

  ngOnInit(): void {
    this.a = this.getSubjectsWithTeachers();
  }


  public getSubjectsWithTeachers(): [number, [number]][] {

    let subjects: [number, [number]][] = [];

    let _ = this.schoolingo.getTimetableLessons();
    for(let i = 0;i < _.length;i++) {
      _[i].filter((__) => __.subject != -1).forEach((___) => {
        if (___.subject == -1) return;
        let fs = subjects.filter((a) => a[0] == ___.subject);
        if (fs.length > 0 && fs[0][1].includes(___.teacher)) return;
        if (fs.length > 0) {
          if (!fs[0][1].includes(___.teacher)) {
            let is = subjects.indexOf(fs[0]);
            subjects[is][1].push(___.teacher);
          }
          return;
        }
        subjects.push([___.subject, [___.teacher]]);
      })
    }

    return subjects;
  }

}
