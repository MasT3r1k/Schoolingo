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

@Component({
  standalone: true,
  imports: [RouterLink, IconsModule, NgClass],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
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

    // Load stats
    this.http.get<FleetStats>(
      `${Config.API_URL}/v1/fleetvehicles/stats`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.stats = data;
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

    // Load upcoming reservations
    this.http.get<Reservation[]>(
      `${Config.API_URL}/v1/fleetvehicles/reservations?upcoming=true&limit=5`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.upcomingReservations = data;
      },
      error: () => {
        // Mock data
        this.upcomingReservations = [];
      }
    });

    // Load expiring documents
    this.http.get<VehicleDocument[]>(
      `${Config.API_URL}/v1/fleetvehicles/documents/expiring?days=30`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.expiringDocuments = data;
      },
      error: () => {
        this.expiringDocuments = [];
      }
    });
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
