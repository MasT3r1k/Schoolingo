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
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    purpose: '',
    destination: '',
    notes: ''
  };

  ngOnInit(): void {
    setTimeout(() => {
        this.calendarManager.getCalendarData('fleet_reservation_start').selected_date[0].next(moment(this.newReservation.startDate));
        this.calendarManager.getCalendarData('fleet_reservation_end').selected_date[0].next(moment(this.newReservation.endDate));
    });

    this.calendarManager.getCalendarData('fleet_reservation_start').selected_date[0].subscribe((date) => {
        this.newReservation.startDate = date.format('YYYY-MM-DD');
    });
    this.calendarManager.getCalendarData('fleet_reservation_end').selected_date[0].subscribe((date) => {
        this.newReservation.endDate = date.format('YYYY-MM-DD');
    });
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
      this.newReservation,
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
