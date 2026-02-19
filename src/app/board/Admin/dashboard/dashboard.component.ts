import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { TabsComponent } from '@Components/Tabs';
import { BehaviorSubject } from 'rxjs';

enum ViewSelector {
  overview,
  classes,
  subjects,
  teachers,
  risks
}

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
  group_name: string;
  group_num: string;
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
interface ClassInfo {
  classId: number;
  className: string;
  studentCount: number;
  absence: {
    currentMonth: number;
    lastMonth: number;
    trend: number;
  };
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, TabsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  ViewSelector = ViewSelector;
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
  public classStats: ClassStats[] = [];

  // Subject statistics
  public subjectStats: SubjectStats[] = [];

  // Teacher statistics
  public teacherStats: TeacherStats[] = [];

  // Absence heatmap data
  public absenceHeatmap: AbsenceHeatmap[] = [];
  
  // Class info
  public classInfo: ClassInfo | null = null;
  
  // Selected Class Detail
  public detailedClass: any | null = null;
  public viewClassDetail = false;

  public selectedView = new BehaviorSubject<ViewSelector>(0);

  public openClassDetail(classId: number): void {
    this.http.get(
        `${Config.API_URL}/v1/admin/management/class/${classId}`,
        { withCredentials: true }
    ).subscribe((data: any) => {
        this.detailedClass = data;
        this.viewClassDetail = true;
    });
  }

  public closeClassDetail(): void {
      this.detailedClass = null;
      this.viewClassDetail = false;
  }

  ngOnInit(): void {
    this.http.get(
      `${Config.API_URL}/v1/admin/management`,
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
      if ('classStats' in data) {
        this.classStats = data.classStats;
      }
      if ('subjectStats' in data) {
        this.subjectStats = data.subjectStats;
      }
      if ('teacherStats' in data) {
        this.teacherStats = data.teacherStats;
      }
      if ('absenceHeatmap' in data) {
        this.absenceHeatmap = data.absenceHeatmap;
      }
      if ('classInfo' in data) {
        this.classInfo = data.classInfo;
      }
    })
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
