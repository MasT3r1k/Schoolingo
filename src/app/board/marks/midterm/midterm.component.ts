import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject } from 'rxjs';
import { IconsModule } from '@Schoolingo/icons';

interface ReportSummary {
  year: number;
  semester: number;
  averageGrade: string;
  absenceTotal: number;
  absenceExcused: number;
  absenceUnexcused: number;
  evaluationType: 'standard' | 'honors' | 'failed' | 'not_evaluated';
  issueDate: string;
}

@Component({
  selector: 'app-midterm',
  imports: [TabsComponent, IconsModule],
  templateUrl: './midterm.component.html',
  styleUrl: './midterm.component.css'
})
export class MidtermComponent implements OnInit {
  private http = inject(HttpClient);
  private u = inject(Authentication);
  public l = inject(Locale);
  public selectedTab = new BehaviorSubject(0);
  public options = ['marks.midterm.tabs.marks', 'marks.midterm.tabs.reports'];
  
  // Year Reports Data - souhrny pro každý ročník
  public yearReports: ReportSummary[] = [
    {
      year: 1,
      semester: 1,
      averageGrade: '1.45',
      absenceTotal: 12,
      absenceExcused: 12,
      absenceUnexcused: 0,
      evaluationType: 'honors',
      issueDate: '31. 1. 2024'
    },
    {
      year: 1,
      semester: 2,
      averageGrade: '1.52',
      absenceTotal: 18,
      absenceExcused: 18,
      absenceUnexcused: 0,
      evaluationType: 'honors',
      issueDate: '30. 6. 2024'
    },
    {
      year: 2,
      semester: 1,
      averageGrade: '1.78',
      absenceTotal: 32,
      absenceExcused: 30,
      absenceUnexcused: 2,
      evaluationType: 'standard',
      issueDate: '31. 1. 2025'
    },
    {
      year: 2,
      semester: 2,
      averageGrade: '1.62',
      absenceTotal: 28,
      absenceExcused: 28,
      absenceUnexcused: 0,
      evaluationType: 'honors',
      issueDate: '30. 6. 2025'
    },
    {
      year: 3,
      semester: 1,
      averageGrade: '1.67',
      absenceTotal: 24,
      absenceExcused: 22,
      absenceUnexcused: 2,
      evaluationType: 'honors',
      issueDate: '31. 1. 2026'
    },
    {
      year: 3,
      semester: 2,
      averageGrade: '-',
      absenceTotal: 0,
      absenceExcused: 0,
      absenceUnexcused: 0,
      evaluationType: 'not_evaluated',
      issueDate: '-'
    }
  ];

  // Seskupení ročníků pro zobrazení
  public getGroupedYears(): { year: number; semesters: ReportSummary[] }[] {
    const grouped: { [key: number]: ReportSummary[] } = {};
    
    for (const report of this.yearReports) {
      if (!grouped[report.year]) {
        grouped[report.year] = [];
      }
      grouped[report.year].push(report);
    }
    
    return Object.keys(grouped)
      .map(year => ({
        year: parseInt(year),
        semesters: grouped[parseInt(year)].sort((a, b) => a.semester - b.semester)
      }))
      .sort((a, b) => b.year - a.year); // Nejnovější ročník první
  }

  public midterm_grades: {[ key: ('mandatory' | 'optional' | string) ]: any[]} = {
    null: [
      {
        subject_name: "Chování",
        semesters: [1, 1, 1, 1, 1, 1, null, null],
      }
    ],
    mandatory: [],
    optional: []
  };

  public getYears(): number {
    if (this.u.getUser().children.length) {
      return this.u.getUser().children[this.u.selectedChild.getValue()].classes[0].scope_years;
    } else {
      return this.u.getUser().classes[0].scope_years;
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

  public getAverageClass(average: string): string {
    const avgNum = parseFloat(average);
    if (avgNum <= 1.5) return 'stat--success';
    if (avgNum <= 2.5) return 'stat--primary';
    if (avgNum <= 3.5) return 'stat--warning';
    return 'stat--danger';
  }

  public getEvaluationClass(type: ReportSummary['evaluationType']): string {
    switch (type) {
      case 'honors': return 'evaluation--honors';
      case 'standard': return 'evaluation--standard';
      case 'failed': return 'evaluation--failed';
      default: return 'evaluation--neutral';
    }
  }

  public getEvaluationIcon(type: ReportSummary['evaluationType']): string {
    switch (type) {
      case 'honors': return 'trophy';
      case 'standard': return 'check';
      case 'failed': return 'x';
      default: return 'help';
    }
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
          subject_name: subject.subject_name,
          semesters
        }
      });
      console.log(data)
    })
  }
}
