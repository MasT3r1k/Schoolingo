import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';

@Component({
  selector: 'app-vacation-request-modal',
  standalone: true,
  imports: [FormsModule, IconsModule, CalendarComponent],
  templateUrl: './vacation-request-modal.component.html',
  styleUrls: ['./vacation-request-modal.component.css']
})
export class VacationRequestModalComponent {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  private auth = inject(Authentication);
  public types = ['vacation', 'inability_to_work', 'personal_obstacle', 'education', 'school_event', 'business_trip', 'other'];
  public selected_type = 'vacation';
  public start_date = moment();
  public end_date = moment();
  public reason = '';
  public loading = false;
  public balance: any = null;
  public submit_error: string | null = null;
  public get is_valid(): boolean {
    if (!this.start_date || !this.end_date) return false;
    if (this.end_date.isBefore(this.start_date, 'day')) return false;
    if (this.selected_type === 'vacation' && this.balance && this.projectedBalance < 0) return false;
    return true;
  }

  public get total_days(): number {
    if (!this.start_date || !this.end_date) return 0;
    // Don't call is_valid here to avoid recursion
    const diff = this.end_date.diff(this.start_date, 'days') + 1;
    return diff > 0 ? diff : 0;
  }

  public get projectedBalance(): number {
    if (!this.balance || this.selected_type !== 'vacation') return 0;
    return (this.balance.remaining || 0) - this.total_days;
  }

  ngOnInit() {
    this.loadBalance();
  }

  loadBalance() {
    this.http.get<any>(
      `${Config.API_URL}/v1/employees/vacations/balance?employeeId=${this.auth.getId()}&year=${new Date().getFullYear()}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.balance = response.balance || response;
      },
      error: (error) => {
        console.error('Failed to load vacation balance in modal:', error);
      }
    });
  }

  submit() {
    if (!this.is_valid) return;
    this.loading = true;
    this.submit_error = null;
    this.http.post<{success: boolean, message: string}>(Config.API_URL + '/v1/employees/vacations/request', {
      startDate: this.start_date.format('YYYY-MM-DD'),
      endDate: this.end_date.format('YYYY-MM-DD'),
      type: this.selected_type,
      reason: this.reason
    }, { withCredentials: true }).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.success) {
            this.submit_error = res.message;
            return;
        }
        const data = this.modalManager.getModalData('request_vacation');
        if (data && data.onSave) {
          data.onSave();
        }
        this.close();
      },
      error: (err) => {
        this.loading = false;
        this.submit_error = err.error?.message || 'unknown_error';
        console.error('Failed to submit vacation request', err);
      }
    });
  }

  close() {
    this.modalManager.closeModal('request_vacation');
  }

  requestMoreDays() {
    // Placeholder logic or modal opening for requesting more days
    console.log('Requesting more days...');
    // This could open another modal or navigate to a specialized request page
  }
}
