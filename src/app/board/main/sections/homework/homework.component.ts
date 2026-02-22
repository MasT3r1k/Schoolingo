import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import moment from 'moment';
import { Authentication } from '@Schoolingo/authentication';
import { Permission } from '@Schoolingo/permission';

@Component({
  selector: 'app-homework',
  standalone: true,
  imports: [IconsModule, NgClass, FormsModule],
  templateUrl: './homework.component.html',
  styleUrl: './homework.component.css'
})
export class HomeworkComponent implements OnInit {
  private http = inject(HttpClient);
  private u = inject(Authentication);
  private perms = inject(Permission);
  public l = inject(Locale);
  public homework: any[] = [];
  public isLoading = true;
  public expandedId: number | null = null;
  public submissionText: string = '';
  public isSubmitting: boolean = false;

  ngOnInit(): void {
    this.loadHomework();
    this.u.getAuthState().subscribe((data) => {
      if (data) {
        this.loadHomework();
      }
    })
  }

  public loadHomework(): void {
    if (!this.perms.checkPermission(['student'])) return;
    this.http.get(
      `${Config.API_URL}/v1/homework?student_id=${this.u.getId()}&limit=5`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        this.homework = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public toggleExpand(id: number): void {
    if (this.expandedId === id) {
      this.expandedId = null;
      this.submissionText = '';
    } else {
      this.expandedId = id;
      this.submissionText = '';
    }
  }

  public submitHomework(hw: any): void {
    if (!this.submissionText.trim()) return;
    
    this.isSubmitting = true;
    this.http.post(
      `${Config.API_URL}/v1/homework/submit`,
      {
        homework_id: hw.id,
        student_id: this.u.getId(),
        content: this.submissionText
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        hw.finished = true;
        this.expandedId = null;
        this.submissionText = '';
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  public formatDate(date: string | Date): string {
    if (!date) return '';
    return moment(date).format('D. M.');
  }

  public formatFullDate(date: string | Date): string {
    if (!date) return '';
    return moment(date).format('D. MMMM YYYY');
  }

  public getDaysLeft(dueDate: string | Date): number {
    if (!dueDate) return 0;
    return moment(dueDate).diff(moment(), 'day');
  }

  public getUrgencyClass(dueDate: string | Date): string {
    const days = this.getDaysLeft(dueDate);
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 2) return 'urgent';
    return 'normal';
  }

  public getDaysLeftText(dueDate: string | Date): string {
    const days = this.getDaysLeft(dueDate);
    if (days < 0) return 'Po termínu';
    if (days === 0) return 'Dnes';
    if (days === 1) return 'Zítra';
    return `${days} dní`;
  }
}
