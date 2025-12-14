import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { Config } from '@Schoolingo/config';
import { FleetVehicles } from '@Schoolingo/fleetvehicles';
import { Vehicle, Reservation, ReservationStatus } from '../../../infrastructure/fleetvehicles/types';
import { ModalManager } from '@Schoolingo/modal';
import { TabsComponent } from '@Components/Tabs';
import moment from 'moment';
import { NewReservationComponent } from '../modals/new-reservation/new-reservation.component';

@Component({
  standalone: true,
  imports: [RouterLink, IconsModule, NgClass, FormsModule, TabsComponent],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class FleetVehiclesReservationsComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public fleet = inject(FleetVehicles);
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private listeners: Subscription[] = [];

  public loading = true;
  public vehicles: Vehicle[] = [];
  public reservations: Reservation[] = [];
  public filteredReservations: Reservation[] = [];

  // View mode
  public viewMode: 'list' | 'calendar' = 'list';
  public selectedTab = new BehaviorSubject<number>(0);
  public tabOptions = [
    'fleetvehicles.reservations.upcoming',
    'fleetvehicles.reservations.past',
    'fleetvehicles.reservations.all'
  ];

  // Filters
  public searchQuery = '';
  public statusFilter: ReservationStatus | 'all' = 'all';
  public vehicleFilter: number | 'all' = 'all';
  public statuses: ReservationStatus[] = ['pending', 'approved', 'active', 'completed', 'rejected', 'cancelled'];
  public dropdownManager = {
    selected_dropdown: ''
  };

  // New reservation form
  public showNewReservationForm = false;
  public newReservation = {
    vehicleId: 0,
    startDate: '',
    endDate: '',
    purpose: '',
    destination: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadData();
    
    this.listeners.push(
      this.selectedTab.subscribe(() => this.filterReservations())
    );
    
    this.modalManager.addModal(
      'fleetvehicles.new_reservation',
      {
        title: 'fleetvehicles.new_reservation',
        closeable: true,
        items: [
          { type: 'component', component: NewReservationComponent }
        ]
      }
    )

    // Check for vehicle param
    const vehicleId = this.route.snapshot.queryParamMap.get('vehicle');
    if (vehicleId) {
      this.vehicleFilter = parseInt(vehicleId);
    }

    this.listeners.push(
      this.route.queryParams.subscribe((data) => {
      if ('vehicle' in data) {
        this.vehicleFilter = parseInt(data['vehicle']);
      }
      })
    )
  }

  ngOnDestroy(): void {
    this.listeners.forEach(sub => sub.unsubscribe());
  }

  private loadData(): void {
    this.loading = true;

    // Load vehicles for filter
    this.http.get<Vehicle[]>(
      `${Config.API_URL}/v1/fleetvehicles/vehicles`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.vehicles = data;
      },
      error: () => {
        this.vehicles = [
          { vehicleId: 1, name: 'Škoda Octavia', licensePlate: '1AB 2345', brand: 'Škoda', model: 'Octavia', year: 2021, type: 'car', status: 'available' },
          { vehicleId: 2, name: 'VW Transporter', licensePlate: '2CD 3456', brand: 'VW', model: 'Transporter', year: 2020, type: 'van', status: 'reserved' }
        ];
      }
    });

    // Load reservations
    this.http.get<Reservation[]>(
      `${Config.API_URL}/v1/fleetvehicles/reservations`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.reservations = data;
        this.filterReservations();
        this.loading = false;
      },
      error: () => {
        // Mock data
        this.reservations = [
          {
            reservationId: 1,
            vehicleId: 1,
            vehicleName: 'Škoda Octavia',
            vehicleLicensePlate: '1AB 2345',
            userId: 1,
            userName: 'Jan Novák',
            startDate: new Date(Date.now() + 86400000),
            endDate: new Date(Date.now() + 86400000 * 2),
            purpose: 'Školení pedagogů',
            destination: 'Praha',
            status: 'approved'
          },
          {
            reservationId: 2,
            vehicleId: 2,
            vehicleName: 'VW Transporter',
            vehicleLicensePlate: '2CD 3456',
            userId: 2,
            userName: 'Petr Svoboda',
            startDate: new Date(Date.now() + 86400000 * 3),
            endDate: new Date(Date.now() + 86400000 * 5),
            purpose: 'Exkurze žáků',
            destination: 'Brno',
            status: 'pending'
          },
          {
            reservationId: 3,
            vehicleId: 1,
            vehicleName: 'Škoda Octavia',
            vehicleLicensePlate: '1AB 2345',
            userId: 3,
            userName: 'Marie Dvořáková',
            startDate: new Date(Date.now() - 86400000 * 5),
            endDate: new Date(Date.now() - 86400000 * 3),
            purpose: 'Služební cesta',
            destination: 'Ostrava',
            status: 'completed'
          }
        ];
        this.filterReservations();
        this.loading = false;
      }
    });
  }

  public filterReservations(): void {
    const now = new Date();
    const tab = this.selectedTab.getValue();
    const searchLower = this.searchQuery.toLowerCase();

    this.filteredReservations = this.reservations.filter(r => {
      // Search filter
      if (searchLower) {
        const matchesSearch = 
          r.vehicleName?.toLowerCase().includes(searchLower) ||
          r.vehicleLicensePlate?.toLowerCase().includes(searchLower) ||
          r.userName?.toLowerCase().includes(searchLower) ||
          r.purpose.toLowerCase().includes(searchLower) ||
          (r.destination && r.destination.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Tab filter
      if (tab === 0) { // Upcoming
        if (new Date(r.startDate) < now && r.status !== 'active') return false;
      } else if (tab === 1) { // Past
        if (new Date(r.endDate) > now || r.status === 'active') return false;
      }
      // All = no tab filter

      // Status filter
      if (this.statusFilter !== 'all' && r.status !== this.statusFilter) return false;

      // Vehicle filter
      if (this.vehicleFilter !== 'all' && r.vehicleId !== this.vehicleFilter) return false;

      return true;
    });

    // Sort by start date
    this.filteredReservations.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  public clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.vehicleFilter = 'all';
    this.filterReservations();
  }

  public getPendingCount(): number {
    return this.reservations.filter(r => r.status === 'pending').length;
  }

  public getApprovedCount(): number {
    return this.reservations.filter(r => r.status === 'approved').length;
  }

  public getActiveCount(): number {
    return this.reservations.filter(r => r.status === 'active').length;
  }

  public openNewReservationForm(): void {
    this.modalManager.openModal('fleetvehicles.new_reservation');
  }

  public approveReservation(reservation: Reservation): void {
    this.http.put(
      `${Config.API_URL}/v1/fleetvehicles/reservations/${reservation.reservationId}/approve`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        reservation.status = 'approved';
      }
    });
  }

  public rejectReservation(reservation: Reservation): void {
    this.http.put(
      `${Config.API_URL}/v1/fleetvehicles/reservations/${reservation.reservationId}/reject`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        reservation.status = 'rejected';
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

  public getStatusClass(status: ReservationStatus): string {
    return status;
  }

  public getDaysFromNowNumber(date: Date): number {
    return moment(date).diff(moment(), 'days');
  }

  public getDaysFromNow(date: Date): string {
    const days = moment(date).diff(moment(), 'days');
    if (days === 0) return this.l.s('fleetvehicles.today');
    if (days === 1) return this.l.s('fleetvehicles.tomorrow');
    if (days === -1) return this.l.s('fleetvehicles.yesterday');
    if (days < 0) return `${Math.abs(days)} ${this.l.s('fleetvehicles.days_ago')}`;
    return `${this.l.s('fleetvehicles.in')} ${days} ${this.l.s('fleetvehicles.days')}`;
  }
}
