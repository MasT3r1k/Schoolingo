import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public reservations: any[] = [];
  public isLoading = true;

  ngOnInit(): void {
    this.loadReservations();
  }

  public loadReservations(): void {
    this.http.get(
      `${Config.API_URL}/v1/vehicles/reservations?limit=3`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if ('reservations' in data) {
          this.reservations = data.reservations;
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

  public formatTime(start: string, end: string): string {
    if (!start || !end) return '';
    return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
  }

  public getVehicleIcon(type: string): string {
    switch(type) {
      case 'bus': return 'bus';
      case 'van': return 'car';
      case 'car': return 'car';
      default: return 'truck';
    }
  }

  public getStatusClass(status: string): string {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  public getStatusLabel(status: string): string {
    switch(status) {
      case 'confirmed': return 'Potvrzeno';
      case 'pending': return 'Čeká na schválení';
      case 'cancelled': return 'Zrušeno';
      default: return status;
    }
  }
}
