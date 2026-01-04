import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '@Components/Tabs';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

interface Homework {
  homework_id: number;
  subjectName: string;
  subjectColor?: string;
  headline: string;
  homework: string;
  assigned_at: Date;
  due_to: Date;
  type: number; // 0 = todo, 1 = in_progress, 2 = done
  attachments?: any[];
}

@Component({
  standalone: true,
  imports: [TabsComponent, IconsModule, CommonModule],
  templateUrl: './homework.component.html',
  styleUrl: './homework.component.css'
})
export class HomeworkComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public Utils = Utils;
  public u = inject(Authentication);

  // View mode
  public viewMode: 'kanban' | 'list' = 'kanban';

  // Tabs
  public selectedTab = new BehaviorSubject(0);
  public options = ['homework.active', 'homework.all'];

  public homework: Homework[] = [];
  public loading = false;

  ngOnInit(): void {
    this.loadHomework();
  }

  private loadHomework(): void {
    this.loading = true;
    this.http.get<any[]>(
      `${Config.API_URL}/v1/homework?student_id=${this.u.getId()}`,
      { withCredentials: true }
    )
    .subscribe({
      next: (data) => {
        this.homework = data.map(hw => ({
          ...hw,
          priority: this.calculatePriority(hw.due_to)
        }));
        this.loading = false;
        console.log(data);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public calculatePriority(dueDate: Date): 'low' | 'medium' | 'high' {
    const daysUntilDue = this.getDaysUntilDue(dueDate);
    if (daysUntilDue <= 1) return 'high';
    if (daysUntilDue <= 3) return 'medium';
    return 'low';
  }

  public getStatusClass(type: number): string {
    switch (type) {
      case 0: return 'todo';
      case 1: return 'in-progress';
      case 2: return 'done';
      default: return 'todo';
    }
  }


  public getHomeworkByStatus(status: number): Homework[] {
    return this.homework.filter(hw => hw.type === status);
  }

  public getTodoHomework(): Homework[] {
    return this.getHomeworkByStatus(0);
  }

  public getInProgressHomework(): Homework[] {
    return this.getHomeworkByStatus(1);
  }

  public getDoneHomework(): Homework[] {
    return this.getHomeworkByStatus(2);
  }

  public moveToInProgress(homework: Homework): void {
    homework.type = 1;
    this.updateHomeworkStatus(homework);
  }

  public moveToDone(homework: Homework): void {
    homework.type = 2;
    this.updateHomeworkStatus(homework);
  }

  public moveToTodo(homework: Homework): void {
    homework.type = 0;
    this.updateHomeworkStatus(homework);
  }

  private updateHomeworkStatus(homework: Homework): void {
    this.http.put(
      `${Config.API_URL}/v1/homework/${homework.homework_id}/status`,
      { type: homework.type },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        console.log('Homework status updated');
      },
      error: () => {
        // Revert on error
        this.loadHomework();
      }
    });
  }

  public getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'high': return '#ff5757';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#4aa3ff';
    }
  }

  public getPriorityLabel(priority?: string): string {
    switch (priority) {
      case 'high': return 'Vysoká';
      case 'medium': return 'Střední';
      case 'low': return 'Nízká';
      default: return '';
    }
  }

  public getDaysUntilDue(dueDate: Date): number {
    const now = moment();
    const due = moment(dueDate);
    return now.diff(due, 'days');
  }

  public toggleViewMode(): void {
    this.viewMode = this.viewMode === 'kanban' ? 'list' : 'kanban';
  }
}
