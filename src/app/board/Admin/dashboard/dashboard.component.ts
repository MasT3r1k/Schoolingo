import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';

interface StudentRisk {
  student_id: number;
  full_name: string;
  class_name: string;
  risk_score: number;
  risk_factor: 'absence' | 'grades' | 'discipline' | 'combined';
  absence_rate: number;
  grade_average: number;
  disciplinary_issues: number;
}

interface ClassStats {
  class_id: number;
  class_name: string;
  student_count: number;
  average_grade: number;
  absence_rate: number;
  trend: 'up' | 'down' | 'stable';
}

interface SubjectStats {
  subject_id: number;
  subject_name: string;
  average_grade: number;
  teacher_count: number;
  student_count: number;
  difficulty_rating: number;
}

interface TeacherStats {
  teacher_id: number;
  full_name: string;
  subject: string;
  class_average: number;
  student_count: number;
  absence_in_classes: number;
}

interface AbsenceHeatmap {
  day: number; // 1-5 (Po-Pá)
  hour: number; // 1-10
  count: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public Utils = Utils

  // Overall school stats
  public schoolStats = {
    totalStudents: 0,
    limitStudents: 0,
    averageGrade: 1.00,
    absenceRate: 0,
    disciplinaryIssues: 0,
    atRiskStudents: 0
  };

  // Risk students
  public riskStudents: StudentRisk[] = [];

  // Class statistics
  public classStats: ClassStats[] = [
    { class_id: 1, class_name: 'B1.A', student_count: 28, average_grade: 2.1, absence_rate: 5.2, trend: 'up' },
    { class_id: 2, class_name: 'B1.B', student_count: 26, average_grade: 2.3, absence_rate: 6.8, trend: 'stable' },
    { class_id: 3, class_name: 'B2.A', student_count: 29, average_grade: 2.4, absence_rate: 7.1, trend: 'down' },
    { class_id: 4, class_name: 'B2.B', student_count: 27, average_grade: 2.2, absence_rate: 6.5, trend: 'up' },
    { class_id: 5, class_name: 'B2.C', student_count: 25, average_grade: 2.6, absence_rate: 8.9, trend: 'down' },
    { class_id: 6, class_name: 'B3.A', student_count: 30, average_grade: 2.5, absence_rate: 9.2, trend: 'stable' },
    { class_id: 7, class_name: 'B3.B', student_count: 28, average_grade: 2.7, absence_rate: 10.1, trend: 'down' },
    { class_id: 8, class_name: 'B4.A', student_count: 31, average_grade: 2.3, absence_rate: 8.7, trend: 'up' },
    { class_id: 9, class_name: 'B4.B', student_count: 29, average_grade: 2.5, absence_rate: 9.4, trend: 'stable' }
  ];

  // Subject statistics
  public subjectStats: SubjectStats[] = [
    { subject_id: 1, subject_name: 'Matematika', average_grade: 2.8, teacher_count: 3, student_count: 245, difficulty_rating: 7.5 },
    { subject_id: 2, subject_name: 'Český jazyk', average_grade: 2.4, teacher_count: 4, student_count: 245, difficulty_rating: 5.2 },
    { subject_id: 3, subject_name: 'Anglický jazyk', average_grade: 2.1, teacher_count: 3, student_count: 245, difficulty_rating: 4.8 },
    { subject_id: 4, subject_name: 'Fyzika', average_grade: 2.9, teacher_count: 2, student_count: 182, difficulty_rating: 8.1 },
    { subject_id: 5, subject_name: 'Chemie', average_grade: 2.7, teacher_count: 2, student_count: 182, difficulty_rating: 7.3 },
    { subject_id: 6, subject_name: 'Dějepis', average_grade: 2.2, teacher_count: 2, student_count: 245, difficulty_rating: 4.5 },
    { subject_id: 7, subject_name: 'Zeměpis', average_grade: 2.0, teacher_count: 2, student_count: 245, difficulty_rating: 3.9 },
    { subject_id: 8, subject_name: 'Tělesná výchova', average_grade: 1.8, teacher_count: 3, student_count: 245, difficulty_rating: 2.1 }
  ];

  // Teacher statistics
  public teacherStats: TeacherStats[] = [
    { teacher_id: 1, full_name: 'Mgr. Jan Novotný', subject: 'Matematika', class_average: 2.6, student_count: 89, absence_in_classes: 6.8 },
    { teacher_id: 2, full_name: 'Mgr. Eva Svobodová', subject: 'Český jazyk', class_average: 2.3, student_count: 95, absence_in_classes: 7.2 },
    { teacher_id: 3, full_name: 'Mgr. Petr Dvořák', subject: 'Anglický jazyk', class_average: 2.0, student_count: 102, absence_in_classes: 5.9 },
    { teacher_id: 4, full_name: 'RNDr. Marie Černá', subject: 'Fyzika', class_average: 2.8, student_count: 78, absence_in_classes: 8.4 },
    { teacher_id: 5, full_name: 'Mgr. Tomáš Procházka', subject: 'Dějepis', class_average: 2.1, student_count: 112, absence_in_classes: 6.5 }
  ];

  // Absence heatmap data
  public absenceHeatmap: AbsenceHeatmap[] = [];

  public selectedView: 'overview' | 'classes' | 'subjects' | 'teachers' | 'risks' = 'overview';

  ngOnInit(): void {
    this.generateAbsenceHeatmap();
    this.http.get(
      `${Config.API_URL}/v1/dashboard/admin`,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      console.log(data)
      if ('schoolStats' in data) {
        this.schoolStats = data.schoolStats;
      }
      if ('riskStudents' in data) {
        this.riskStudents = data.riskStudents;
      }
    })
  }

  private generateAbsenceHeatmap(): void {
    // Generate heatmap data (days 1-5, hours 1-10)
    for (let day = 1; day <= 5; day++) {
      for (let hour = 1; hour <= 10; hour++) {
        // Simulate: more absences on Monday/Friday, during first and last hours
        let count = Math.floor(Math.random() * 15) + 5;
        if (day === 1 || day === 5) count += 5; // Monday/Friday
        if (hour === 1 || hour === 8 || hour === 9 || hour === 10) count += 3; // First/last hours
        
        this.absenceHeatmap.push({ day, hour, count });
      }
    }
  }

  public getHeatmapValue(day: number, hour: number): number {
    const cell = this.absenceHeatmap.find(h => h.day === day && h.hour === hour);
    return cell ? cell.count : 0;
  }

  public getHeatmapIntensity(count: number): string {
    if (count < 10) return 'low';
    if (count < 20) return 'medium';
    return 'high';
  }

  public getRiskColor(score: number): string {
    if (score >= 80) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  public getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'minus';
  }

  public sortClassesByGrade(): void {
    this.classStats.sort((a, b) => a.average_grade - b.average_grade);
  }

  public sortClassesByAbsence(): void {
    this.classStats.sort((a, b) => b.absence_rate - a.absence_rate);
  }

  public sortSubjectsByDifficulty(): void {
    this.subjectStats.sort((a, b) => b.difficulty_rating - a.difficulty_rating);
  }
}
