import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Authentication } from '../../infrastructure/authentication';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { School } from '@Schoolingo/school';

// Interfaces for student summary data - ready for API integration
interface SubjectGrade {
  name: string;
  teacher: string;
  grade: number;
  feedback: string;
  trend?: 'up' | 'down' | 'stable';
}

interface StudentStats {
  average: number;
  absenceHours: number;
  behavior: string;
  totalGrades: number;
  excellentGrades: number;
  riskScore: number; // 0-100, lower is better
  mostFrequentAbsenceDay: string;
  messagesSent: number;
  schoolEventsAttended: number;
  libraryBooksLoaned: number;
  internshipDays: number;
  systemVisits: number;
  totalSchoolHours: number; // Real hours including breaks
  rewardsReceived: number;
  gradesReceived: number; // Total grades given throughout the year
  disciplinaryActions: number; // Kázeňská opatření
}

interface Highlight {
  icon: string;
  title: string;
  value: string;
  description: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface StudentSummaryData {
  student: {
    className: string;
    schoolYear: string;
  };
  stats: StudentStats;
  topSubjects: SubjectGrade[];
  highlights: Highlight[];
  subjects: SubjectGrade[];
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './student-summary.component.html',
  styleUrls: ['./student-summary.component.css', './leaderboard.css']
})
export class studentSummaryComponent implements OnInit, OnDestroy, AfterViewInit {
  private auth = inject(Authentication);
  private school = inject(School);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private elementRef = inject(ElementRef);
  public l = inject(Locale);

  public getStudentName(): string {
    return this.auth.getUser()?.fullName ?? '';
  }

  public getSchoolName(): string {
    return this.school.config.getValue()?.name ?? '';
  }

  // Show more toggle for highlights
  public showMoreHighlights = false;

  public toggleHighlights(): void {
    this.showMoreHighlights = !this.showMoreHighlights;
  }

  public getVisibleHighlights() {
    return this.showMoreHighlights 
      ? this.summaryData.highlights 
      : this.summaryData.highlights.slice(0, 5);
  }

  // Mock data - will be replaced with API call
  public summaryData: StudentSummaryData = {
    student: {
      className: '4.B',
      schoolYear: '2024/25'
    },
    stats: {
      average: 1.42,
      absenceHours: 12,
      behavior: 'A',
      totalGrades: 87,
      excellentGrades: 62,
      riskScore: 15, // Low risk - good student
      mostFrequentAbsenceDay: 'Pátek',
      messagesSent: 234,
      schoolEventsAttended: 18,
      libraryBooksLoaned: 23,
      internshipDays: 14,
      systemVisits: 1247,
      totalSchoolHours: 892, // ~180 days × ~5 hours
      rewardsReceived: 7,
      gradesReceived: 87, // Total grades throughout year
      disciplinaryActions: 2 // Kázeňská opatření
    },
    topSubjects: [
      { name: 'Matematika', teacher: 'Mgr. Petra Dvořáková', grade: 1, feedback: 'Výborná práce v geometrii. Doporučuji účast v olympiádě.' },
      { name: 'Český jazyk', teacher: 'Mgr. Karel Svoboda', grade: 1, feedback: 'Skvělé slohové práce, výborný přednes.' },
      { name: 'Dějepis', teacher: 'PhDr. Alena Černá', grade: 1, feedback: 'Příkladná orientace v datech.' }
    ],
    highlights: [
      // Original highlights
      { icon: 'trending-up', title: 'Nejlepší měsíc', value: 'Duben', description: 'Průměr 1.2', variant: 'success' },
      { icon: 'rocket', title: 'Největší zlepšení', value: 'Chemie', description: '+2 stupně', variant: 'primary' },
      { icon: 'star', title: 'Nejaktivnější', value: 'Matematika', description: '15 známek', variant: 'info' },
      
      // New comprehensive stats
      { icon: 'shield-check', title: 'Rizikové skóre', value: '15/100', description: 'Nízké riziko', variant: 'success' },
      { icon: 'calendar-event', title: 'Nejčastější absence', value: 'Pátek', description: '5× chybění', variant: 'warning' },
      { icon: 'message-circle', title: 'Napsáno zpráv', value: '234', description: 'Aktivní komunikace', variant: 'primary' },
      { icon: 'confetti', title: 'Školní akce', value: '18', description: 'Účast na akcích', variant: 'success' },
      { icon: 'book', title: 'Vypůjčeno knih', value: '23', description: 'Z knihovny', variant: 'info' },
      { icon: 'briefcase', title: 'Dny na praxích', value: '14', description: 'Získané zkušenosti', variant: 'primary' },
      { icon: 'device-laptop', title: 'Návštěv systému', value: '1 247', description: 'Aktivní přístup', variant: 'info' },
      { icon: 'clock', title: 'Hodin ve škole', value: '892h', description: 'Včetně přestávek', variant: 'primary' },
      { icon: 'trophy', title: 'Obdrženo odměn', value: '7', description: 'Za výkony', variant: 'success' },
      { icon: 'file-certificate', title: 'Obdrženo známek', value: '87', description: 'Za celý rok', variant: 'info' },
      { icon: 'alert-circle', title: 'Kázeňská opatření', value: '2', description: 'Napomenutí', variant: 'warning' }
    ],
    subjects: [
      { name: 'Matematika', teacher: 'Mgr. Petra Dvořáková', grade: 1, feedback: 'Výborná práce v geometrii. Doporučuji účast v olympiádě. Aktivní přístup k řešení složitých úloh.', trend: 'up' },
      { name: 'Český jazyk', teacher: 'Mgr. Karel Svoboda', grade: 1, feedback: 'Skvělé slohové práce, výborný přednes. Gramatika bezchybná.', trend: 'stable' },
      { name: 'Anglický jazyk', teacher: 'John Smith, B.A.', grade: 3, feedback: 'Potřeba zapracovat na nepravidelných slovesech. Konverzace se lepší, ale písemný projev vázne.', trend: 'up' },
      { name: 'Fyzika', teacher: 'Ing. Prokop Buben', grade: 2, feedback: 'Stabilní výsledky, laboratorní protokoly odevzdány včas. Pozor na převody jednotek.', trend: 'stable' },
      { name: 'Chemie', teacher: 'Mgr. Jana Kyselá', grade: 4, feedback: 'Hrozí propadnutí. Nutné doplnit si sešit a doučit se názvosloví solí.', trend: 'down' },
      { name: 'Dějepis', teacher: 'PhDr. Alena Černá', grade: 1, feedback: 'Příkladná orientace v datech. Referát o druhé světové válce byl na vysokoškolské úrovni.', trend: 'up' }
    ]
  };

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    // Future: Load data from API
    // this.loadSummaryData();
  }

  ngAfterViewInit(): void {
    // Setup scroll reveal animations
    this.setupScrollReveal();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Prepare for API integration
  /* 
  private async loadSummaryData(): Promise<void> {
    try {
      const response = await this.http.get<StudentSummaryData>('/api/v1/student/summary').toPromise();
      if (response) {
        this.summaryData = response;
      }
    } catch (error) {
      console.error('Failed to load summary data:', error);
    }
  }
  */

  private setupScrollReveal(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, options);

    // Observe all sections with reveal animation
    const sections = this.elementRef.nativeElement.querySelectorAll('.reveal');
    sections.forEach((section: Element) => {
      this.observer?.observe(section);
    });
  }

  public getGradeClass(grade: number): string {
    return `grade-${grade}`;
  }

  public getTrendIcon(trend?: string): string {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'minus';
    }
  }

  public getExcellencePercentage(): number {
    return Math.round((this.summaryData.stats.excellentGrades / this.summaryData.stats.totalGrades) * 100);
  }

  public getRiskScoreVariant(): 'success' | 'warning' | 'danger' {
    const score = this.summaryData.stats.riskScore;
    if (score < 30) return 'success';
    if (score < 60) return 'warning';
    return 'danger';
  }
}
