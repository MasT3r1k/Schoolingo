import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';

export type ReportType = 'student_list' | 'student_marks' | 'class_marks' | 'grade_overview' | null;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private sanitizer = inject(DomSanitizer);
  public Utils = Utils;
  public moment = moment;

  public activeReport: ReportType = null;
  public isLoading = false;
  
  // Selection data
  public classes: any[] = [];
  public students: any[] = [];
  
  // Selected parameters
  public selection = {
    classId: null as number | null,
    studentId: null as number | null
  };

  // Report data
  public reportData: any = null;

  ngOnInit() {
    this.loadClasses();
  }

  public loadClasses() {
    this.http.get<any>(`${Config.API_URL}/v1/school/classes`, { withCredentials: true })
      .subscribe((res) => {
        this.classes = res.data || res;
      });
  }

  public onClassChange() {
    if (this.selection.classId) {
      this.loadStudents(this.selection.classId);
    } else {
      this.students = [];
      this.selection.studentId = null;
    }
  }

  public loadStudents(classId: number) {
    this.http.get<any>(`${Config.API_URL}/v1/students?classId=${classId}`, { withCredentials: true })
      .subscribe((res) => {
        this.students = res.data || res;
      });
  }

  public selectReport(type: ReportType) {
    this.activeReport = type;
    this.reportData = null;
    this.selection.classId = null;
    this.selection.studentId = null;
  }

  public pdfUrl: any = null;
  public rawBlob: Blob | null = null;

  public generateReport() {
    this.isLoading = true;
    this.reportData = null;
    this.pdfUrl = null;
    this.rawBlob = null;

    // First fetch report data (or let backend do it, but here we provide it)
    let fetchUrl = '';
    let fetchParams: any = {};

    switch(this.activeReport) {
      case 'student_list':
        fetchUrl = `${Config.API_URL}/v1/students`;
        fetchParams.classId = this.selection.classId;
        break;
      case 'student_marks':
        fetchUrl = `${Config.API_URL}/v1/marks/interm`;
        fetchParams.studentId = this.selection.studentId;
        break;
      case 'class_marks':
        fetchUrl = `${Config.API_URL}/v1/marks/interm`;
        fetchParams.classId = this.selection.classId;
        break;
      case 'grade_overview':
        fetchUrl = `${Config.API_URL}/v1/marks/midterm`;
        fetchParams.studentId = this.selection.studentId;
        break;
    }

    this.http.get<any>(fetchUrl, { params: fetchParams, withCredentials: true })
      .subscribe({
        next: (res) => {
          this.reportData = res.data || res;
          this.generatePdfPreview();
        },
        error: (err) => {
          console.error('Error fetching report data:', err);
          this.isLoading = false;
        }
      });
  }

  public generatePdfPreview() {
    const payload = {
      type: this.activeReport,
      reportData: this.reportData,
      className: this.getSelectedClassName(),
      studentName: this.getSelectedStudentName(),
      genDate: this.Utils.formatDateShort(this.moment())
    };

    this.http.post(`${Config.API_URL}/documents/generate`, payload, { 
      responseType: 'blob',
      withCredentials: true 
    }).subscribe({
      next: (blob: Blob) => {
        this.rawBlob = blob;
        const url = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating PDF:', err);
        this.isLoading = false;
      }
    });
  }

  public downloadPdf() {
    if (!this.rawBlob) return;
    const url = window.URL.createObjectURL(this.rawBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.activeReport}_${this.Utils.formatDateShort(this.moment())}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  public printPdf() {
    if (!this.pdfUrl) return;
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  }

  public getSelectedClassName(): string {
    const cls = this.classes.find(c => (c.id || c.class_id) == this.selection.classId);
    return cls?.name || cls?.class_name || '';
  }

  public getSelectedStudentName(): string {
    const student = this.students.find(s => (s.id || s.student_id) == this.selection.studentId);
    if (!student) return '';
    return `${student.last_name} ${student.first_name}`;
  }

  public reset() {
    this.pdfUrl = null;
    this.activeReport = null;
    this.reportData = null;
    this.selection.classId = null;
    this.selection.studentId = null;
    this.rawBlob = null;
  }
}
