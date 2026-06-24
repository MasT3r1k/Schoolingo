import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { TabsComponent } from '@Components/Tabs';
import { BehaviorSubject } from 'rxjs';
import { AvatarService } from '../../../infrastructure/utils/avatar.service';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";

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
  absence_score: number;
  absence_rate: number;
  grade_score: number;
  grade_average: number;
  risk_score: number;
  risk_factor: 'absence' | 'grades' | 'discipline' | 'combined';
  disciplinary_issues: number;
  avatar: any;
}

interface ClassStats {
  class_id: number;
  class_name: string;
  student_count: number;
  average_grade: number;
  average_grade_last: number;
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
  avatar: any;
}

interface AbsenceHeatmap {
  day: number; // 1-5 (Po-Pá)
  hour: number; // 1-10
  count: number;
}

interface ClassInfo {
  classId?: number;
  class_id?: number;
  className?: string;
  class_name?: string;
  studentCount?: number;
  student_count?: number;
  absence: {
    currentMonth?: number;
    current_month?: number;
    lastMonth?: number;
    last_month?: number;
    trend: number;
  };
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, TabsComponent, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  ViewSelector = ViewSelector;
  public l = inject(Locale);
  private http = inject(HttpClient);
  public Utils = Utils;
  public avatarService = inject(AvatarService);

  // Loading state
  public loading = true;

  // Overall school stats
  public schoolStats = {
    total_students: 0,
    total_students_last: 0,
    limit_students: 0,
    average_grade: 1.00,
    average_grade_last: 1.00,
    absence_rate: 0,
    absence_rate_last: 0,
    disciplinaryIssues: 0,
    at_risk_students: 0,
    at_risk_students_last: 0
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

  // Class info (for teachers who are also class teachers)
  public classInfo: ClassInfo | null = null;

  // Selected Class Detail
  public detailedClass: any | null = null;
  public viewClassDetail = false;

  public selectedView = new BehaviorSubject<ViewSelector>(0);

  // ============================================================
  // Normalised accessors (backend uses snake_case, component used camelCase)
  // ============================================================
  get classInfoNorm(): { className: string; studentCount: number; absence: { currentMonth: number; trend: number } } | null {
    if (!this.classInfo) return null;
    return {
      className: this.classInfo.className ?? this.classInfo.class_name ?? '',
      studentCount: this.classInfo.studentCount ?? this.classInfo.student_count ?? 0,
      absence: {
        currentMonth: this.classInfo.absence?.currentMonth ?? this.classInfo.absence?.current_month ?? 0,
        trend: this.classInfo.absence?.trend ?? 0
      }
    };
  }

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
      this.loading = false;
      if ('school_stats' in data) {
        this.schoolStats = data.school_stats;
      }
      if ('risk_students' in data) {
        this.riskStudents = data.risk_students;
      }
      if ('class_stats' in data) {
        this.classStats = data.class_stats;
      }
      if ('subject_stats' in data) {
        this.subjectStats = data.subject_stats;
      }
      if ('teacher_stats' in data) {
        this.teacherStats = data.teacher_stats;
      }
      if ('absence_heatmap' in data) {
        this.absenceHeatmap = data.absence_heatmap;
      }
      if ('class_info' in data) {
        this.classInfo = data.class_info;
      }
    });
  }

  public getHeatmapValue(day: number, hour: number): number {
    const cell = this.absenceHeatmap.find(h => h.day === day && h.hour === hour);
    return cell ? cell.count : 0;
  }

  public getHeatmapIntensity(count: number): string {
    if (count === 0) return '';
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

  // ============================================================
  // Generic table sort state
  // ============================================================
  public subjectSort: { col: keyof SubjectStats | null; dir: 'asc' | 'desc' } = { col: null, dir: 'asc' };
  public teacherSort: { col: keyof TeacherStats | null; dir: 'asc' | 'desc' } = { col: null, dir: 'asc' };
  public riskSort:    { col: keyof StudentRisk  | null; dir: 'asc' | 'desc' } = { col: 'risk_score', dir: 'desc' };

  private sortArr<T>(arr: T[], col: keyof T, dir: 'asc' | 'desc'): T[] {
    return [...arr].sort((a, b) => {
      const av = a[col] as unknown as number | string;
      const bv = b[col] as unknown as number | string;
      const r = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return dir === 'asc' ? r : -r;
    });
  }

  public sortSubjects(col: keyof SubjectStats): void {
    if (this.subjectSort.col === col) this.subjectSort.dir = this.subjectSort.dir === 'asc' ? 'desc' : 'asc';
    else { this.subjectSort.col = col; this.subjectSort.dir = 'asc'; }
    this.subjectStats = this.sortArr(this.subjectStats, col, this.subjectSort.dir);
  }

  public sortTeachers(col: keyof TeacherStats): void {
    if (this.teacherSort.col === col) this.teacherSort.dir = this.teacherSort.dir === 'asc' ? 'desc' : 'asc';
    else { this.teacherSort.col = col; this.teacherSort.dir = 'asc'; }
    this.teacherStats = this.sortArr(this.teacherStats, col, this.teacherSort.dir);
  }

  public sortRisks(col: keyof StudentRisk): void {
    if (this.riskSort.col === col) this.riskSort.dir = this.riskSort.dir === 'asc' ? 'desc' : 'asc';
    else { this.riskSort.col = col; this.riskSort.dir = 'desc'; }
    this.riskStudents = this.sortArr(this.riskStudents, col, this.riskSort.dir);
  }

  public subjectSortClass(col: keyof SubjectStats): string {
    if (this.subjectSort.col !== col) return 'sortable';
    return `sortable sort-${this.subjectSort.dir}`;
  }

  public teacherSortClass(col: keyof TeacherStats): string {
    if (this.teacherSort.col !== col) return 'sortable';
    return `sortable sort-${this.teacherSort.dir}`;
  }

  public riskSortClass(col: keyof StudentRisk): string {
    if (this.riskSort.col !== col) return 'sortable';
    return `sortable sort-${this.riskSort.dir}`;
  }

  // Risk count helpers
  public getCriticalRiskCount(): number {
    return this.riskStudents.filter(s => Number(s.risk_score) >= 80).length;
  }

  public getHighRiskCount(): number {
    return this.riskStudents.filter(s => Number(s.risk_score) >= 70).length;
  }
}
