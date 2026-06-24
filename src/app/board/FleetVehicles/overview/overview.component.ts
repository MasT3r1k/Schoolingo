import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { Config } from '@Schoolingo/config';
import { FleetVehicles } from '@Schoolingo/fleetvehicles';
import { Vehicle, Reservation, VehicleDocument, FleetStats } from '../../../infrastructure/fleetvehicles/types';
import moment from 'moment';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";

@Component({
  standalone: true,
  imports: [RouterLink, IconsModule, NgClass, StatCardComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class FleetVehiclesOverviewComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public fleet = inject(FleetVehicles);
  private http = inject(HttpClient);

  public loading = true;
  public stats: FleetStats = {
    totalVehicles: 0,
    availableVehicles: 0,
    reservedVehicles: 0,
    maintenanceVehicles: 0,
    upcomingReservations: 0,
    expiringDocuments: 0,
    pendingApprovals: 0
  };

  public upcomingReservations: Reservation[] = [];
  public expiringDocuments: VehicleDocument[] = [];
  public recentVehicles: Vehicle[] = [];

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;

    // Load stats from overview endpoint
    this.http.get<{ stats: FleetStats }>(
      `${Config.API_URL}/v1/fleet/overview`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        // API returns { stats: { totalVehicles, monthlyTrips, monthlyExpenses, monthlyDistance } }
        const apiStats = response.stats as any;
        this.stats = {
          totalVehicles: apiStats.totalVehicles || 0,
          availableVehicles: apiStats.totalVehicles || 0,
          reservedVehicles: 0,
          maintenanceVehicles: 0,
          upcomingReservations: apiStats.monthlyTrips || 0,
          expiringDocuments: 0,
          pendingApprovals: 0,
          monthlyTrips: apiStats.monthlyTrips || 0,
          monthlyExpenses: apiStats.monthlyExpenses || 0,
          monthlyDistance: apiStats.monthlyDistance || 0
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mock data for development
        this.stats = {
          totalVehicles: 8,
          availableVehicles: 5,
          reservedVehicles: 2,
          maintenanceVehicles: 1,
          upcomingReservations: 3,
          expiringDocuments: 2,
          pendingApprovals: 1
        };
      }
    });

    // Load recent trips as upcoming reservations
    this.http.get<{ trips: any[] }>(
      `${Config.API_URL}/v1/fleet/trips`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.upcomingReservations = response.trips.map((t: any) => ({
          reservationId: t.tripId,
          vehicleId: t.vehicleId,
          vehicleName: t.plate || 'Unknown',
          userId: t.driverId,
          userName: 'Driver',
          startDate: new Date(t.start_date),
          endDate: t.end_date ? new Date(t.end_date) : new Date(),
          purpose: t.purpose,
          status: 'approved' as const
        }));
      },
      error: () => {
        this.upcomingReservations = [];
      }
    });

    // Documents expiring - keep as is (no API yet)
    this.expiringDocuments = [];
  }

  public formatDate(date: Date): string {
    return moment(date).format('D. M. YYYY');
  }

  public formatDateRange(start: Date, end: Date): string {
    const s = moment(start);
    const e = moment(end);
    if (s.isSame(e, 'day')) {
      return s.format('D. M. YYYY');
    }
    return `${s.format('D. M.')} - ${e.format('D. M. YYYY')}`;
  }

  public getDaysUntilExpiry(date: Date): number {
    return moment(date).diff(moment(), 'days');
  }

  public getExpiryClass(date: Date): string {
    const days = this.getDaysUntilExpiry(date);
    if (days <= 7) return 'critical';
    if (days <= 14) return 'warning';
    return 'normal';
  }
}
