import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '@Components/Alert';
import { Alert, AlertManager } from '@Schoolingo/alert';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { MarksManager } from '@Schoolingo/marks';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './edit-midterm.component.html',
  styleUrl: './edit-midterm.component.css'
})
export class EditMidtermComponent implements OnInit {
  public alert: Alert | null = null;
  public alertManager = inject(AlertManager);
  public marksManager = inject(MarksManager);
  public modalManager = inject(ModalManager);
  public l = inject(Locale);
  private http = inject(HttpClient);

  public isLoading = false;
  public action: 'edit' | 'create' = 'create';
  public selectedGrade: number | null = null;
  public selectedQuarter: number = 1;
  public errors: { [key: string]: string } = {};

  // Available grades (1-5)
  public grades: number[] = [1, 2, 3, 4, 5];
  
  // Quarters with date ranges (based on school year)
  public quarters: { id: number; label: string; months: string; isCurrent: boolean; grade: number | null }[] = [];
  public currentQuarter: number = 1;
  public isLoadingGrades = false;

  ngOnInit(): void {
    // Determine current quarter based on date
    this.currentQuarter = this.getCurrentQuarter();
    this.selectedQuarter = this.currentQuarter;

    // Build quarters with current detection
    this.quarters = [
      { id: 1, label: '1. čtvrtletí', months: 'Září - Listopad', isCurrent: this.currentQuarter === 1, grade: null },
      { id: 2, label: '1. pololetí', months: 'Září - Leden', isCurrent: this.currentQuarter === 2, grade: null },
      { id: 3, label: '3. čtvrtletí', months: 'Únor - Duben', isCurrent: this.currentQuarter === 3, grade: null },
      { id: 4, label: '2. pololetí', months: 'Únor - Červen', isCurrent: this.currentQuarter === 4, grade: null }
    ];

    // Load existing grades for all quarters
    this.loadQuarterGrades();

    // Get current midterm grade if editing
    const currentMark = this.marksManager.getMark();
    if (currentMark) {
      this.selectedGrade = parseInt(currentMark);
      this.action = 'edit';
    } else {
      this.action = 'create';
    }
  }

  private loadQuarterGrades(): void {
    this.isLoadingGrades = true;
    
    this.http.get<{ success: boolean; grades?: { quarter: number; grade: number }[] }>(
      `${Config.API_URL}/v1/marks/midterm/student`,
      {
        params: {
          student_id: this.marksManager.getSelectedStudentId(),
          subject_id: this.marksManager.getSubjectId(),
          group_id: this.marksManager.getGroupId()
        },
        withCredentials: true
      }
    ).subscribe({
      next: (response) => {
        this.isLoadingGrades = false;
        if (response.success && response.grades) {
          response.grades.forEach(g => {
            const quarter = this.quarters.find(q => q.id === g.quarter);
            if (quarter) {
              quarter.grade = g.grade;
            }
          });
          // If current quarter has a grade, set it as selected
          const currentQuarterData = this.quarters.find(q => q.isCurrent);
          if (currentQuarterData?.grade) {
            this.selectedGrade = currentQuarterData.grade;
            this.action = 'edit';
          }
        }
      },
      error: () => {
        this.isLoadingGrades = false;
      }
    });
  }

  /**
   * Determines current quarter based on school year calendar
   * School year: September - June
   * Q1: Sept-Nov (months 9-11)
   * Q2/Semester 1: Sept-Jan (end of semester 1)
   * Q3: Feb-Apr (months 2-4)
   * Q4/Semester 2: Feb-Jun (end of semester 2)
   */
  private getCurrentQuarter(): number {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // September - November = Q1
    if (month >= 9 && month <= 11) {
      return 1;
    }
    // December - January = End of Q2 (semester 1)
    if (month === 12 || month === 1) {
      return 2;
    }
    // February - April = Q3
    if (month >= 2 && month <= 4) {
      return 3;
    }
    // May - June = End of Q4 (semester 2)
    if (month >= 5 && month <= 6) {
      return 4;
    }
    // July - August = Summer break, default to Q4 (last completed)
    return 4;
  }

  public selectGrade(grade: number): void {
    this.selectedGrade = grade;
  }

  public isButtonActivated(): boolean {
    return this.selectedGrade !== null;
  }

  public parseFloat(value: string): number {
    return parseFloat(value);
  }

  public getGradeLabel(grade: number): string {
    const labels: { [key: number]: string } = {
      1: this.l.s('marks.marks_text.0'),
      2: this.l.s('marks.marks_text.1'),
      3: this.l.s('marks.marks_text.2'),
      4: this.l.s('marks.marks_text.3'),
      5: this.l.s('marks.marks_text.4')
    };
    return labels[grade] || '';
  }

  public saveMidterm(): void {
    this.alert = null;
    this.errors = {};

    // Validation
    if (this.selectedGrade === null) {
      this.errors['grade'] = this.l.s('form.required');
      return;
    }

    if (!this.marksManager.getSelectedStudent()) {
      this.errors['student'] = this.l.s('form.invalid');
      return;
    }

    this.isLoading = true;

    this.http.post(
      `${Config.API_URL}/v1/marks/midterm`,
      { 
        student_id: this.marksManager.getSelectedStudentId(),
        subject_id: this.marksManager.getSubjectId(),
        group_id: this.marksManager.getGroupId(),
        quarter: this.selectedQuarter,
        grade: this.selectedGrade
      },
      { withCredentials: true }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.alert = this.alertManager.alert('success', this.l.s('marks.midterm_saved'));
          // Notify parent to update
          this.marksManager.updateMark$.next({
            type: 'midterm',
            quarter: this.selectedQuarter,
            grade: this.selectedGrade
          });
          // Close modal after short delay
          setTimeout(() => {
            this.modalManager.closeModal('edit_midterm');
          }, 1000);
        } else {
          this.alert = this.alertManager.alert('error', response.error || this.l.s('errors.unknown'));
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.alert = this.alertManager.alert('error', err.error?.error || this.l.s('errors.unknown'));
      }
    });
  }

  public deleteMidterm(): void {
    if (!confirm(this.l.s('marks.confirm_delete_midterm'))) {
      return;
    }

    this.isLoading = true;

    this.http.delete(
      `${Config.API_URL}/v1/marks/midterm`,
      { 
        body: {
          student_id: this.marksManager.getSelectedStudentId(),
          subject_id: this.marksManager.getSubjectId(),
          quarter: this.selectedQuarter
        },
        withCredentials: true 
      }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.marksManager.updateMark$.next({
            type: 'midterm',
            quarter: this.selectedQuarter,
            grade: null
          });
          this.modalManager.closeModal('edit_midterm');
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
