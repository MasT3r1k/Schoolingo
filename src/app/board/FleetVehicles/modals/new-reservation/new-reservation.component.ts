import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-reservation.component.html',
  styleUrl: './new-reservation.component.css'
})
export class NewReservationComponent {
  public l = inject(Locale);
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);

  public vehicles: any[] = [];

  public newReservation = {
    vehicleId: 0,
    startDate: '',
    endDate: '',
    purpose: '',
    destination: '',
    notes: ''
  };

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
}
