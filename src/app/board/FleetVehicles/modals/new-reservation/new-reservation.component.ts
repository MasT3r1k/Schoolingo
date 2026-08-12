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
import { FleetVehicles } from '@Schoolingo/fleetvehicles';
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

  public fleet = inject(FleetVehicles);

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
    this.fleet.vehicles.subscribe(v => {
      this.vehicles = v;
    });
    if (this.vehicles.length === 0) {
      this.fleet.loadVehicles().subscribe();
    }
  }

  public closeNewReservationForm(): void {
    this.modalManager.closeModal('fleetvehicles.new_reservation');
  }

  public submitReservation(): void {
    if (!this.newReservation.vehicleId || !this.newReservation.startDate || !this.newReservation.endDate || !this.newReservation.purpose) {
      return;
    }

    this.fleet.createTrip({
      vehicleId: this.newReservation.vehicleId,
      purpose: this.newReservation.purpose,
      start_location: 'School', // Default or from input if you add it
      end_location: this.newReservation.destination,
      start_date: this.newReservation.startDate.format('YYYY-MM-DD'),
      end_date: this.newReservation.endDate.format('YYYY-MM-DD')
    }).subscribe({
      next: () => {
        this.closeNewReservationForm();
        // optionally trigger a reload of trips by calling fleet.loadTrips() or emitting an event
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
