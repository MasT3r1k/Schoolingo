import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-homework',
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './homework.component.html',
  styleUrl: './homework.component.css'
})
export class HomeworkComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public homework: any[] = [];
  public isLoading = true;

  ngOnInit(): void {
    this.loadHomework();
  }

  public loadHomework(): void {
    this.http.get(
      `${Config.API_URL}/v1/homework?limit=5`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if ('homework' in data) {
          this.homework = data.homework;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public formatDate(date: string | Date): string {
    if (!date) return '';
    return moment(date).format('D. M.');
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
