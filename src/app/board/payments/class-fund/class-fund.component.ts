import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { DropdownManager } from '@Schoolingo/dropdown';
import { ModalManager } from '@Schoolingo/modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-class-fund',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './class-fund.component.html',
  styleUrls: ['./class-fund.component.css']
})
export class ClassFundComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public auth = inject(Authentication);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);

  public data: any = null;
  public loading = true;
  
  // Trip creation modal
  public newTrip = {
    name: '',
    description: '',
    amount: 0,
    payment_class_id: 1,
    due_date: ''
  };

  ngOnInit(): void {
    this.loadData();
    
    // Register modal if needed
    // this.modalManager.addModal('create_trip', ...);
  }

  loadData() {
    this.loading = true;
    this.http.get(`${Config.API_URL}/v1/payments/class_fund`, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.data = response;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  createTrip() {
    if (!this.newTrip.name || this.newTrip.amount <= 0) return;
    this.http.post(`${Config.API_URL}/v1/payments/trip`, this.newTrip, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.loadData(); // Reload data
          this.newTrip = { name: '', description: '', amount: 0, payment_class_id: 1, due_date: '' };
        },
        error: (err) => console.error(err)
      });
  }

  approvePayment(paymentColumnId: number, studentId: number) {
    this.http.post(`${Config.API_URL}/v1/payments/approve`, { payment_column_id: paymentColumnId, student_id: studentId }, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.loadData();
        },
        error: (err) => console.error(err)
      });
  }
}
