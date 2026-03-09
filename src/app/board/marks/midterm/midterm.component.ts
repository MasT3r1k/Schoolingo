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
  private cachedData: any = null;
  
  // Year Reports Data - souhrny pro každý ročník
  public yearReports: ReportSummary[] = [];

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

  public getGradeClass(grade: any): string {
    if (grade === null || grade === '-') return '';
    const g = typeof grade === 'number' ? grade : parseInt(grade);
    if (isNaN(g)) return '';
    if (g === 1) return 'grade--success';
    if (g >= 4) return 'grade--danger';
    if (g === 3) return 'grade--warning';
    return 'grade--primary';
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
      if (!data || !data.subjects) return;
      this.cachedData = data;

      // Determine current grade level from class name (e.g. "4.A" -> 4)
      const className = this.u.getUser().classes?.[0]?.class_name || "";
      const currentGradeMatch = className.match(/(\d+)/);
      const currentGrade = currentGradeMatch ? parseInt(currentGradeMatch[1]) : 1;

      // Current school year (start year)
      const now = new Date();
      const currentSystemYear = now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();

      // Calculate start year of the first grade (Theoretical anchor)
      const theoreticalStartYear = currentSystemYear - (currentGrade - 1);

      // Best effort start year selection:
      // 1. If we have class_start, use it
      // 2. If we have min_year from marks, use it
      // 3. Fallback to theoretical based on class name
      let startYear = theoreticalStartYear;
      if (data.class_start) {
        const d = new Date(data.class_start);
        startYear = d.getMonth() < 7 ? d.getFullYear() - 1 : d.getFullYear();
      } else if (data.min_year) {
        startYear = data.min_year;
      }

      const mapGradesToSemesters = (subjectId: number | null) => {
        let semesters = Array(this.getYears() * 2).fill(null);
        data.marks
          .filter((m: any) => m.subject_id == subjectId || (subjectId === null && m.subject_id === null))
          .forEach((m: any) => {
            const relYear = m.year - startYear;
            if (relYear >= 0 && relYear < this.getYears()) {
              if (m.semester === 2) semesters[relYear * 2] = m.grade;
              if (m.semester === 4) semesters[relYear * 2 + 1] = m.grade;
            }
          });

        // Auto behavior calculation (subjectId === null)
        if (subjectId === null) {
          for (let y = 0; y < this.getYears(); y++) {
            const year = startYear + y;
            // Only autofill if year is not in future relative to current semester
            if (year <= currentSystemYear) {
              // Sem 1 (2)
              if (semesters[y * 2] === null) {
                const count = data.education_measures?.filter((m: any) => {
                  const d = new Date(m.issued_at);
                  const mYear = d.getMonth() < 7 ? d.getFullYear() - 1 : d.getFullYear();
                  return mYear === year && (d.getMonth() >= 8 || d.getMonth() <= 0); // Sept (8) to Jan (0)
                }).length || 0;
                // Only fill if it's past or current semester
                if (year < currentSystemYear || (year === currentSystemYear && now.getMonth() >= 0)) {
                  semesters[y * 2] = 1 + count;
                }
              }
              // Sem 2 (4)
              if (semesters[y * 2 + 1] === null) {
                const count = data.education_measures?.filter((m: any) => {
                  const d = new Date(m.issued_at);
                  const mYear = d.getMonth() < 7 ? d.getFullYear() - 1 : d.getFullYear();
                  return mYear === year && (d.getMonth() >= 8 || d.getMonth() <= 5); // Whole year Sept-June
                }).length || 0;
                // Only fill if it's past or we are approaching end of year
                if (year < currentSystemYear || (year === currentSystemYear && now.getMonth() >= 1)) {
                  semesters[y * 2 + 1] = 1 + count;
                }
              }
            }
          }
        }

        return semesters;
      };

      const mapAbsencesToSemesters = (subjectId: number | null) => {
        let semesters = Array(this.getYears() * 2).fill(0);
        data.absences
          ?.filter((a: any) => {
            const aSubId = a.subject_id ? Number(a.subject_id) : null;
            const targetSubId = subjectId ? Number(subjectId) : null;
            return aSubId === targetSubId;
          })
          .forEach((a: any) => {
            const d = new Date(a.date);
            const aYear = d.getMonth() < 7 ? d.getFullYear() - 1 : d.getFullYear();
            const relYear = aYear - startYear;
            // Sem 1: Aug-Jan (7-0), Sem 2: Feb-July (1-6)
            const aSemester = (d.getMonth() >= 1 && d.getMonth() <= 6) ? 2 : 1;
            
            if (relYear >= 0 && relYear < this.getYears()) {
              const semIdx = relYear * 2 + (aSemester - 1);
              semesters[semIdx]++;
            }
          });
        return semesters;
      };

      // Behavior (Chování)
      this.midterm_grades['null'] = [
        {
          subject_name: this.l.s('marks.midterm.behavior'),
          semesters: mapGradesToSemesters(null)
        }
      ];

      // Mandatory
      let mandatorySubjects = data.subjects.filter((subject: any) => subject.is_mandatory);
      this.midterm_grades['mandatory'] = mandatorySubjects.map((subject: any) => ({
        subject_id: subject.subject_id,
        subject_name: subject.subject_name,
        semesters: mapGradesToSemesters(subject.subject_id),
        absences: mapAbsencesToSemesters(subject.subject_id)
      }));

      // Optional
      let optionalSubjects = data.subjects.filter((subject: any) => !subject.is_mandatory);
      this.midterm_grades['optional'] = optionalSubjects.map((subject: any) => ({
        subject_id: subject.subject_id,
        subject_name: subject.subject_name,
        semesters: mapGradesToSemesters(subject.subject_id),
        absences: mapAbsencesToSemesters(subject.subject_id)
      }));

      // Update Year Reports summaries based on real grades
      this.yearReports = [];
      for (let y = 0; y < this.getYears(); y++) {
        for (let s = 1; s <= 2; s++) {
          const dbSemester = s === 1 ? 2 : 4;
          const yearMarks = data.marks.filter((m: any) => m.year === (startYear + y) && m.semester === dbSemester && m.grade !== null);
          
          let avg = '-';
          let evalType: ReportSummary['evaluationType'] = 'not_evaluated';
          
          if (yearMarks.length > 0) {
            const numericMarks = yearMarks.map((m: any) => typeof m.grade === 'number' ? m.grade : parseInt(m.grade)).filter((m: any) => !isNaN(m) && m > 0);
            if (numericMarks.length > 0) {
              const sum = numericMarks.reduce((a: number, b: number) => a + b, 0);
              avg = (sum / numericMarks.length).toFixed(2);
              
              const hasFive = numericMarks.some((m: number) => m === 5);
              const allOneAndTwo = numericMarks.every((m: number) => m <= 2);
              const average = sum / numericMarks.length;

              if (hasFive) evalType = 'failed';
              else if (allOneAndTwo && average <= 1.5) evalType = 'honors';
              else evalType = 'standard';
            }
          }

          // Calculation of absence
          const getAbsence = (type: number | number[]) => {
            const types = Array.isArray(type) ? type : [type];
            return data.absences?.filter((a: any) => {
              const d = new Date(a.date);
              const aYear = d.getMonth() < 7 ? d.getFullYear() - 1 : d.getFullYear();
              const aSemester = (d.getMonth() >= 1 && d.getMonth() <= 6) ? 2 : 1;
              return aYear === (startYear + y) && aSemester === s && types.includes(Number(a.type));
            }).length || 0;
          };

          const excusedAbsence = getAbsence([1]); // EXCUSED
          const unexcusedAbsence = getAbsence([0, 2]); // ABSENCE or UNEXCUSED
          const totalAbsence = getAbsence([0, 1, 2, 3, 4, 5, 6, 7]); // All types

          const rc = data.report_cards?.find((r: any) => r.year === (startYear + y) && r.semester === s);
          let issueDate = '-';
          if (rc && rc.issued_at) {
            const d = new Date(rc.issued_at);
            issueDate = `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
          }

          this.yearReports.push({
            year: y + 1,
            semester: s,
            averageGrade: avg,
            absenceTotal: totalAbsence,
            absenceExcused: excusedAbsence,
            absenceUnexcused: unexcusedAbsence,
            evaluationType: evalType,
            issueDate: issueDate
          });
        }
      }
    });
  }
}
