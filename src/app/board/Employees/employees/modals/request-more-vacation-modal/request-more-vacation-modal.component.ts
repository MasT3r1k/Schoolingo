import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import moment from 'moment';

@Component({
  selector: 'app-request-more-vacation-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './request-more-vacation-modal.component.html',
  styleUrls: ['./request-more-vacation-modal.component.css']
})
export class RequestMoreVacationModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  private auth = inject(Authentication);

  public amount: number = 5;
  public reason: string = '';
  public loading: boolean = false;
  public submit_error: string | null = null;
  public data: any;

  ngOnInit() {
    this.data = this.modalManager.getModalData('request_extra_vacation');
  }

  public get is_valid(): boolean {
    return this.amount > 0 && this.amount <= 20 && this.reason.length > 5;
  }

  submit() {
    if (!this.is_valid) return;
    this.loading = true;
    this.submit_error = null;

    // Use the generic /v1/employees/vacations/request endpoint with the new type
    // We set startDate and endDate to the current year range to satisfy backend date parsing
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    this.http.post<{success: boolean, message: string}>(Config.API_URL + '/v1/employees/vacations/request', {
      startDate: startDate,
      endDate: endDate,
      days: this.amount,
      type: 'extra_vacation',
      reason: this.reason
    }, { withCredentials: true }).subscribe({
      next: (res) => {
        this.loading = true;
        if (this.data && this.data.onSave) {
          this.data.onSave();
        }
        this.close();
      },
      error: (err) => {
        this.loading = false;
        this.submit_error = err.error?.message || 'unknown_error';
      }
    });
  }

  close() {
    this.modalManager.closeModal('request_extra_vacation');
  }
}
