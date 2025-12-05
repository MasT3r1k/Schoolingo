import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-traineeship',
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './traineeship.component.html',
  styleUrl: './traineeship.component.css'
})
export class TraineeshipComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public traineeships: any[] = [];
  public isLoading = true;

  ngOnInit(): void {
    this.loadTraineeships();
  }

  public loadTraineeships(): void {
    this.http.get(
      `${Config.API_URL}/v1/traineeships?limit=3`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if ('traineeships' in data) {
          this.traineeships = data.traineeships;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public formatDateRange(start: string | Date, end: string | Date): string {
    if (!start || !end) return '';
    return `${moment(start).format('D. M.')} - ${moment(end).format('D. M. YYYY')}`;
  }

  public getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'upcoming': return 'status-upcoming';
      default: return 'status-default';
    }
  }

  public getStatusLabel(status: string): string {
    switch(status) {
      case 'active': return 'Probíhá';
      case 'completed': return 'Dokončeno';
      case 'upcoming': return 'Nadcházející';
      default: return status;
    }
  }

  public getHoursProgress(completed: number, total: number): number {
    if (!total) return 0;
    return Math.min(100, Math.round((completed / total) * 100));
  }
}
