import { NgClass, KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { TabsComponent } from '../../../Components/Tabs';
import { absence } from '@Schoolingo/absence';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [NgClass, IconsModule, KeyValuePipe, TabsComponent],
  templateUrl: './topics.component.html',
  styleUrl: './topics.component.css'
})
export class TopicsComponent implements OnInit, OnDestroy {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public u = inject(Authentication);

  public groupedTopics: Record<string, any[]> = {};
  public subjectTopics: Record<string, any[]> = {};
  public absenceConfig = absence;
  public loading = true;
  private subscriptions: Subscription[] = [];

  public selectedTab = new BehaviorSubject<number>(0);
  public selectedSubject = new BehaviorSubject<string>('');
  public expandedTopics = new Set<number>();

  public schoolYears = new BehaviorSubject<any[]>([]);
  public selectedSchoolYear = new BehaviorSubject<number>(0);

  public toggleTopic(id: number): void {
    if (this.expandedTopics.has(id)) {
      this.expandedTopics.delete(id);
    } else {
      this.expandedTopics.add(id);
    }
  }

  ngOnInit(): void {
    this.loadSchoolYears();

    this.subscriptions.push(
      this.u.getAuthState().subscribe((logged) => {
        if (logged) {
          this.loadTopics();
        }
      })
    );

    this.subscriptions.push(
      this.u.selectedChild.subscribe(() => {
        if (this.u.getAuthStateValue()) {
          this.loadTopics();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadSchoolYears(): void {
    this.http.get<any[]>(`${Config.API_URL}/v1/system/school-years`, { withCredentials: true }).subscribe({
      next: (data) => {
        this.schoolYears.next(data);
        if (data.length > 0) {
          // Find current school year by date
          const now = moment().format('YYYY-MM-DD');
          const current = data.find(sy => sy.start <= now && sy.end >= now);
          if (current) {
            this.selectedSchoolYear.next(current.sy_id);
          } else {
            this.selectedSchoolYear.next(data[0].sy_id);
          }
        }
      }
    });

    this.subscriptions.push(
      this.selectedSchoolYear.subscribe((syId) => {
        if (syId > 0 && this.u.getAuthStateValue()) {
          this.loadTopics();
        }
      })
    );
  }

  public loadTopics(): void {
    const syId = this.selectedSchoolYear.getValue();
    if (syId === 0) return;

    this.loading = true;
    this.http.get<Record<string, any[]>>(
      `${Config.API_URL}/v1/student/${this.u.getId()}/topics?syId=${syId}`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.groupedTopics = data;
        this.processSubjectTopics(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public onSubjectChange(event: any): void {
    this.selectedSubject.next(event.target.value);
  }

  private processSubjectTopics(data: Record<string, any[]>): void {
    const subjects: Record<string, any[]> = {};
    Object.values(data).forEach(dayTopics => {
      dayTopics.forEach(topic => {
        const subjectName = topic.subject_name;
        if (!subjects[subjectName]) subjects[subjectName] = [];
        subjects[subjectName].push(topic);
      });
    });

    // Sort topics within subjects by date (oldest first for numbering)
    Object.keys(subjects).forEach(sub => {
      subjects[sub].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.day_hour - b.day_hour;
      });

      // Show newest first for the user
      subjects[sub].reverse();
    });

    this.subjectTopics = subjects;
    if (this.selectedSubject.getValue() === '' && Object.keys(subjects).length > 0) {
      this.selectedSubject.next(this.getSortedSubjects()[0]);
    }
  }

  public formatDate(dateStr: string): string {
    const m = moment(dateStr);
    return m.format('D. M. YYYY');
  }

  public getDayName(dateStr: string): string {
    const m = moment(dateStr);
    return this.l.s('days.' + m.day());
  }

  public getSortedDates(): string[] {
    return Object.keys(this.groupedTopics).sort((a, b) => b.localeCompare(a));
  }

  public getSortedSubjects(): string[] {
    return Object.keys(this.subjectTopics).sort((a, b) => a.localeCompare(b, 'cs'));
  }

  public getSchoolYearLabel(sy: any): string {
    const start = moment(sy.start).year();
    const end = moment(sy.end).year();
    return start === end ? start.toString() : `${start}/${end}`;
  }

  public onSyChange(event: any): void {
    this.selectedSchoolYear.next(Number(event.target.value));
  }
}
