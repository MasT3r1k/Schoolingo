import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { Permission } from '@Schoolingo/permission';
import { Authentication } from '@Schoolingo/authentication';

@Component({
  selector: 'app-attendance-widget',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterLink],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public perm = inject(Permission);
  private auth = inject(Authentication);
  public Utils = Utils;

  isLoading = true;
  isCheckedIn = false;
  checkInTime: string | null = null;
  workedMinutes = 0;
  totalWorkedToday = 0;
  
  // Timer for updating worked time live
  private timer: any;

  ngOnInit() {
    this.checkStatus();
    
    // Update time every minute
    this.timer = setInterval(() => {
      if (this.isCheckedIn) {
        this.updateWorkedTime();
      }
    }, 60000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  checkStatus() {
    this.isLoading = true;
    const today = new Date().toISOString().split('T')[0];
    
    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/attendance`,
      { 
        withCredentials: true, 
        params: { 
          dateFrom: today, 
          dateTo: today,
          employeeId: this.auth.getId()
        } 
      }
    ).subscribe({
      next: (response) => {
        // Find if currently checked in (no checkOut time)
        const openSession = response.data.find(r => !r.check_out);
        
        // Calculate total worked minutes today from closed sessions
        const closedSessions = response.data.filter(r => r.check_out);
        this.totalWorkedToday = closedSessions.reduce((acc, curr) => acc + (curr.worked_minutes || 0), 0);

        if (openSession) {
          this.isCheckedIn = true;
          this.checkInTime = openSession.check_in;
          this.updateWorkedTime();
        } else {
          this.isCheckedIn = false;
          this.checkInTime = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load attendance status', err);
        this.isLoading = false;
      }
    });
  }

  updateWorkedTime() {
    if (!this.checkInTime) return;
    
    const now = new Date();
    const [hours, minutes] = this.checkInTime.split(':').map(Number);
    const checkInDate = new Date();
    checkInDate.setHours(hours, minutes, 0, 0);
    
    const diffMs = now.getTime() - checkInDate.getTime();
    this.workedMinutes = Math.floor(diffMs / 60000);
  }

  performCheckIn() {
    this.isLoading = true;
    this.http.post<{ success: boolean, time: string }>(
      `${Config.API_URL}/v1/employees/attendance/checkin`,
      { type: 'regular' },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.isCheckedIn = true;
        this.checkInTime = res.time;
        this.workedMinutes = 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Check-in failed', err);
        alert('Příchod se nepodařilo zaznamenat');
        this.isLoading = false;
      }
    });
  }

  performCheckOut() {
    if (!confirm('Opravdu chcete odejít?')) return;
    
    this.isLoading = true;
    this.http.post<{ success: boolean, worked_minutes: number }>(
      `${Config.API_URL}/v1/employees/attendance/checkout`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.isCheckedIn = false;
        this.checkInTime = null;
        this.totalWorkedToday += res.worked_minutes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Check-out failed', err);
        alert('Odchod se nepodařilo zaznamenat');
        this.isLoading = false;
      }
    });
  }

  get formattedTotalWorked(): string {
    const total = this.totalWorkedToday + (this.isCheckedIn ? this.workedMinutes : 0);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}h ${m}m`;
  }
}
