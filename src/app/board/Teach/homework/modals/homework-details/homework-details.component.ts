import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import moment from 'moment';

@Component({
  selector: 'app-homework-details',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './homework-details.component.html',
  styleUrl: './homework-details.component.css'
})
export class HomeworkDetailsComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  public homework: any;

  ngOnInit(): void {
    this.homework = this.modalManager.getModalData('homeworks_homework-detail');
  }

  public getDaysUntilDue(dueDate: Date): number {
    const now = moment();
    const due = moment(dueDate);
    return due.diff(now, 'days');
  }

  public getDeadlineText(dueDate: Date): string {
    return moment(dueDate).format('D. M. YYYY v HH:mm');
  }

  public getStatusLabel(type: number): string {
    switch (type) {
      case 0: return 'Neodevzdáno';
      case 1: return 'Rozpracováno';
      case 2: return 'Odevzdáno';
      default: return 'Neznámý stav';
    }
  }

  public getStatusClass(type: number): string {
    switch (type) {
      case 0: return 'badge--warning';
      case 1: return 'badge--primary';
      case 2: return 'badge--success';
      default: return 'badge--secondary';
    }
  }

  public closeModal(): void {
    this.modalManager.closeModal('homeworks_homework-detail');
  }
}
