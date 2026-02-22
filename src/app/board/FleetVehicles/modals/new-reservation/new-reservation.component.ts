import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

import { DropdownManager } from '@Schoolingo/dropdown';
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import moment from 'moment';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule, CalendarComponent],
  templateUrl: './new-reservation.component.html',
  styleUrl: './new-reservation.component.css'
})
export class NewReservationComponent {
  public l = inject(Locale);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  private http = inject(HttpClient);
  public calendarManager = inject(CalendarManager);

  public vehicles: any[] = [];

  public newReservation = {
    vehicleId: 0,
    startDate: moment(),
    endDate: moment(),
    purpose: '',
    destination: '',
    notes: ''
  };

  ngOnInit(): void {
    // Calendar subscriptions are handled via (valueChange) in template
  }

  public closeNewReservationForm(): void {
    this.modalManager.closeModal('fleetvehicles.new_reservation');
  }

  public submitReservation(): void {
    if (!this.newReservation.vehicleId || !this.newReservation.startDate || !this.newReservation.endDate || !this.newReservation.purpose) {
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/fleetvehicles/reservations`,
      {
        ...this.newReservation,
        startDate: this.newReservation.startDate.format('YYYY-MM-DD'),
        endDate: this.newReservation.endDate.format('YYYY-MM-DD')
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.closeNewReservationForm();
        // this.loadData();
      },
      error: () => {
        // For now, just close the form
        this.closeNewReservationForm();
      }
    });
  }

  public selectedType() {
    return this.vehicles.find(v => v.vehicleId === this.newReservation.vehicleId)
  }
}
