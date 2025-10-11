import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { Data, DatalistComponent } from '@Components/Datalist/Datalist';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Mark, Schoolingo } from '@Schoolingo';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';

type Page = {
  page: number;
  max: number;
}

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, NgStyle, DatalistComponent],
  templateUrl: './interm.component.html',
  styleUrls: ['./interm.component.css', '../../../Styles/input.css', '../../../Styles/card.css']
})
export class IntermComponent implements OnInit {
  public showSelect: 'selectSubject' | 'selectGrade' | 'selectWeight' | null = null;
  public selectedSubject = new BehaviorSubject<number>(0);
  public selectedGrade = 0;
  public allowedGrades: string[] = ['1+', '1', '1-', '2+', '2', '2-', '3+', '3', '3-', '4+', '4', '4-', '5+', '5'];
  public selectedWeight: number = 0;

  public grades: Mark[] = [];
  public predictGrades: Mark[] = [];
  public addPredictGrade(): void {
    this.predictGrades.push({ mark: this.allowedGrades[this.selectedGrade], weight: this.selectedWeight + 1, subject: -1, teacher: -1, topic: '<Predictor>', description: '', type: 0, created: moment() })
  }

  public getGradesToListInPredictor(): Mark[] {
    let list = JSON.parse(JSON.stringify(this.grades));
    list.unshift(...this.predictGrades.reverse());
    return list;
  }

  public selectedTab = new BehaviorSubject<number>(0);
  public gradeWidth = 0;
  public pages: Page[] = [];

  public listeners: Subscription[] = [];

  public holdPages: { id: number, page: number }[] = [];

  constructor(
    public schoolingo: Schoolingo,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.refreshGrades();
    }, 250)

    this.renderer.listen("window", 'resize', () => {
      this.refreshGrades();
    });

    setInterval(() => {
      this.holdPages.forEach((data: { id: number, page: number }) => {
        this.setPage(data.id, data.page);
      });
      if (this.pages.length === 0 && this.schoolingo.marks.length > 0) {
        for(let i = 0;i < this.schoolingo.getSubjects().length;i++) {
          this.pages[i] = {
            page: 0,
            max: 0 
          }
        }
        this.refreshGrades();
      }
    }, 100);

    this.listeners.push(this.schoolingo.socketService.addFunction("grades:getGrades").subscribe((data: Mark[]) => {
      this.selectedSubject.next(this.selectedSubject.getValue());
    }));

    this.listeners.push(this.selectedSubject.subscribe((subject: number) => {
      this.predictGrades = [];
      this.grades = this.getGradesBySubjectId(
        this.getSubjectIdByName(
          this.schoolingo.getSubjects()[subject]
        )
      );
    }));
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public refreshGrades(): void {
    document.querySelectorAll(".list-grades").forEach((val: Element, index: number) => {
      this.gradeWidth = val.clientWidth;
      if (!this.pages[index]) {
        this.pages[index] = {
          page: 0,
          max: 0
        }
      }
      this.pages[index].max = this.getGradesBySubjectId(this.getSubjectIdByName(this.schoolingo.getSubjects()[index])).length / Math.floor(this.gradeWidth / 56 / 2) - 1;
    });
  }

  public getSubjectIdByName(subjectName: string): number {
    let id = -1;
    Object.entries(this.schoolingo.subjects).forEach((data: [string, string[]]) => {
      if (data[1][0] === subjectName) {
        id = parseInt(data[0]);
      }
    })
    return id;
  }

  public getPage(id: number): number {
    if (!this.pages[id]) {
      return 0;
    }
    return this.pages[id].page;
  }

  public setPage(id: number, page: number): void {
    if (this.getPage(id) + page < 0) return;
    if (!this.pages[id]) {
      this.pages[id] = {
        page: 0,
        max: 0
      }
    }
    this.pages[id].page = this.getPage(id) + page;
  }

  public setHoldPage(id: number, page: number): void {
    this.holdPages.push({ id, page });
  }

  public setUnholdPage(id: number, page: number): void {
    this.holdPages.splice(this.holdPages.indexOf({ id, page }), 1);
  }

  public getTranslateX(id: number): number {
    return this.getPage(id) * Math.floor(this.gradeWidth / 56 / 2) * -56;
  }

  public getGradesBySubjectId(subjectId: number): typeof this.schoolingo.marks {
    return this.schoolingo.marks.filter((mark: Mark) => mark.subject == subjectId);
  }

  public getAverageBySubjectId(subject: number, addGrades: Mark[] = []): string {
    let grades = this.getGradesBySubjectId(subject);
    let total = 0;
    let total_devide = 0;

    if (addGrades.length > 0) {
      grades.push(...addGrades);
    }

    grades.forEach((grade: Mark) => {
      if (!this.allowedGrades.includes(grade.mark.toString())) return;
      if (grade.type === 0) {
        let mark = parseInt(grade.mark);

        if (!mark) { return; }
        if (String(grade.mark).endsWith("+")) {
          total -= 0.25 * (grade.weight + 1);
        }
        if (String(grade.mark).endsWith("-")) {
          total += 0.5 * (grade.weight + 1);
        }

        total += mark * (grade.weight + 1);
        total_devide += (grade.weight + 1);
      }
    });

    if (!total_devide) return '1.00';
    let average = Number(total / total_devide);
    return (average < 1) ? '1.00' : average.toFixed(2).replace('.', ',');
  }

  public getMarks(): BehaviorSubject<Data[][]> {
    let data: Data[][] = [];
    let marks = this.schoolingo.marks;
    marks.forEach((mark: Mark) => {
      data.push([
        { value: this.schoolingo.subjects[mark.subject][0], isLocale: false},
        { value: mark.mark, isLocale: false },
        { value: mark.topic, isLocale: false },
        { value: mark.weight.toString(), isLocale: false },
        { value: mark.created.format('DD.MM.YYYY'), isLocale: false }
      ]);
    });
    return new BehaviorSubject(data);
  }

}
