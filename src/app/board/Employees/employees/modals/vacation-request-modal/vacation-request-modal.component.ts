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
    if (!this.start_date || !this.end_date) return;
    this.loading = true;
    this.http.post<{success: boolean, message: string}>(Config.API_URL + '/v1/employees/vacations/request', {
      startDate: this.start_date.format('YYYY-MM-DD'),
      endDate: this.end_date.format('YYYY-MM-DD'),
      type: this.selected_type,
      reason: this.reason
    }, { withCredentials: true }).subscribe({
      next: (res) => {
        this.loading = false;
        const data = this.modalManager.getModalData('request_vacation');
        if (data && data.onSave) {
          data.onSave();
        }
        this.close();
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to submit vacation request', err);
      }
    });
  }

  close() {
    this.modalManager.closeModal('request_vacation');
  }
}
