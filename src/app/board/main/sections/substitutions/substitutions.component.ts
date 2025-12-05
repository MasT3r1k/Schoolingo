import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-substitutions',
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './substitutions.component.html',
  styleUrl: './substitutions.component.css'
})
export class SubstitutionsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public substitutions: any[] = [];
  public isLoading = true;

  ngOnInit(): void {
    this.loadSubstitutions();
  }

  public loadSubstitutions(): void {
    this.http.get(
      `${Config.API_URL}/v1/substitutions?limit=5`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if ('substitutions' in data) {
          this.substitutions = data.substitutions;
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
    const d = moment(date);
    const now = moment();
    
    if (d.isSame(now, 'day')) return 'Dnes';
    if (d.isSame(moment().add(1, 'day'), 'day')) return 'Zítra';
    return d.format('D. M.');
  }

  public getSubstitutionType(sub: any): string {
    if (sub.cancelled) return 'cancelled';
    if (sub.room_change) return 'room-change';
    if (sub.teacher_change) return 'teacher-change';
    return 'other';
  }

  public getTypeIcon(sub: any): string {
    if (sub.cancelled) return 'calendar-x';
    if (sub.room_change) return 'door';
    if (sub.teacher_change) return 'user-minus';
    return 'refresh';
  }

  public getTypeLabel(sub: any): string {
    if (sub.cancelled) return 'Odpadá';
    if (sub.room_change) return 'Změna místnosti';
    if (sub.teacher_change) return 'Suplování';
    return 'Změna';
  }
}
