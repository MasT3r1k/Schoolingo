import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Mark, Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

type Page = {
  page: number;
  max: number;
}

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, NgStyle],
  templateUrl: './interm.component.html',
  styleUrls: ['./interm.component.css', '../../../Styles/card.css']
})
export class IntermComponent implements OnInit {

  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  public gradeWidth = 0;
  public pages: Page[] = [];

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
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
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

  public getGradesBySubjectId(subjectId: number): Mark[] {
    return this.schoolingo.marks.filter((mark: Mark) => mark.subject == subjectId);
  }

  public getAverageBySubjectId(subject: number): string {
    let grades = this.getGradesBySubjectId(subject);
    let total = 0;
    let total_devide = 0;
    grades.forEach((_) => {
      if (_.type === 0) {
        total += _.mark * _.weight;
        total_devide += _.weight;
      }
    });

    let average: string = Number(total / total_devide).toFixed(2).replace('.', ',');
    return (average == 'NaN') ? '' : average;
  }

}
