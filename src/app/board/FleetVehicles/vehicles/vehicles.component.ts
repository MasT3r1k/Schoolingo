import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { Config } from '@Schoolingo/config';
import { Vehicle, VehicleDocument, VehicleStatus, VehicleType } from '../../../infrastructure/fleetvehicles/types';
import { FleetVehicles } from '@Schoolingo/fleetvehicles';
import { ModalManager } from '@Schoolingo/modal';
import { TabsComponent } from '@Components/Tabs';
import moment from 'moment';
import { Utils } from '@Schoolingo/utils';
import { NewVehicleComponent } from '../modals/new-vehicle/new-vehicle.component';

import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  standalone: true,
  imports: [RouterLink, IconsModule, NgClass, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class FleetVehiclesComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public fleet = inject(FleetVehicles);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private listeners: Subscription[] = [];

  public loading = true;
  public showPage: 'list' | 'detail' = 'list';
  public vehicles: Vehicle[] = [];
  public filteredVehicles: Vehicle[] = [];
  public selectedVehicle: Vehicle | null = null;
  public vehicleDocuments: VehicleDocument[] = [];

  // Filters
  public searchQuery = '';
  public statusFilter: VehicleStatus | 'all' = 'all';
  public typeFilter: VehicleType | 'all' = 'all';

  // Tabs for vehicle detail
  public selectedTab = new BehaviorSubject<number>(0);
  public tabOptions = [
    'fleetvehicles.tab.info',
    'fleetvehicles.tab.documents',
    'fleetvehicles.tab.reservations',
    'fleetvehicles.tab.history'
  ];

  public vehicleTypes: VehicleType[] = ['car', 'van', 'bus', 'minibus', 'truck', 'motorcycle'];
  public vehicleStatuses: VehicleStatus[] = ['available', 'reserved', 'maintenance', 'unavailable'];

  public getFilterLabel(type: 'status' | 'type', value: any): string {
    const options = this.getFilterOptions(type);
    return options.find(o => o.value === value)?.label || value;
  }

  public getFilterOptions(type: 'status' | 'type'): {value: string, label: string}[] {
    switch(type) {
      case 'status':
        return [
          {value: 'all', label: this.l.s('fleetvehicles.all_statuses')},
          ...this.vehicleStatuses.map(status => ({
            value: status,
            label: this.l.s(this.fleet.getVehicleStatusLabel(status))
          }))
        ];
      case 'type':
         return [
          {value: 'all', label: this.l.s('fleetvehicles.all_types')},
          ...this.vehicleTypes.map(type => ({
            value: type,
            label: this.l.s(this.fleet.getVehicleTypeLabel(type))
          }))
        ];
      default: return [];
    }
  }

  ngOnInit(): void {
    this.loadVehicles();

    this.modalManager.addModal(
      'add_vehicle',
      {
        title: 'fleetvehicles.add_vehicle_title',
        width: 800,
        closeable: true,
        items: [
          { type: 'component', component: NewVehicleComponent }
        ]
      }
    )
    
    this.listeners.push(
      this.route.params.subscribe(() => {
        this.checkRouteParams();
      })
    );
  }

  ngOnDestroy(): void {
    this.listeners.forEach(sub => sub.unsubscribe());
  }

  private checkRouteParams(): void {
    const idFromUrl = this.route.snapshot.paramMap.get('id');
    if (idFromUrl && idFromUrl !== 'new') {
      const vehicleId = parseInt(idFromUrl);
      this.selectVehicle(vehicleId);
    } else if (idFromUrl === 'new') {
      this.openAddVehicleModal();
    } else {
      this.showPage = 'list';
      this.selectedVehicle = null;
    }
  }

  private loadVehicles(): void {
    this.loading = true;
    this.http.get<{ vehicles: any[] }>(
      `${Config.API_URL}/v1/fleet/vehicles`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        // Map API response to Vehicle interface
        this.vehicles = response.vehicles.map(v => ({
          vehicleId: v.vehicleId,
          name: `${v.manufacture} ${v.model}`,
          licensePlate: v.plate,
          brand: v.manufacture,
          model: v.model,
          year: v.year_manufacture,
          type: 'car' as const,
          status: 'available' as const,
          color: '',
          fuelType: v.fuel,
          mileage: v.mileage,
          capacity: 5
        }));
        this.filterVehicles();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mock data for development
        this.vehicles = [
          {
            vehicleId: 1,
            name: 'Škoda Octavia',
            licensePlate: '1AB 2345',
            brand: 'Škoda',
            model: 'Octavia',
            year: 2021,
            type: 'car',
            status: 'available',
            color: 'Bílá',
            fuelType: 'diesel',
            mileage: 45000,
            capacity: 5
          },
          {
            vehicleId: 2,
            name: 'VW Transporter',
            licensePlate: '2CD 3456',
            brand: 'Volkswagen',
            model: 'Transporter',
            year: 2020,
            type: 'van',
            status: 'reserved',
            color: 'Šedá',
            fuelType: 'diesel',
            mileage: 78000,
            capacity: 9
          },
          {
            vehicleId: 3,
            name: 'Mercedes Sprinter',
            licensePlate: '3EF 4567',
            brand: 'Mercedes-Benz',
            model: 'Sprinter',
            year: 2019,
            type: 'minibus',
            status: 'maintenance',
            color: 'Modrá',
            fuelType: 'diesel',
            mileage: 120000,
            capacity: 17
          }
        ];
        this.filterVehicles();
      }
    });
  }

  public filterVehicles(): void {
    this.checkRouteParams();

    this.filteredVehicles = this.vehicles.filter(v => {
      // Status filter
      if (this.statusFilter !== 'all' && v.status !== this.statusFilter) return false;
      // Type filter
      if (this.typeFilter !== 'all' && v.type !== this.typeFilter) return false;
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const searchable = `${v.name} ${v.licensePlate} ${v.brand} ${v.model}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }

  public selectVehicle(vehicleId: number): void {
    const vehicle = this.vehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      this.selectedVehicle = vehicle;
      this.fleet.selectedVehicle = vehicle;
      this.showPage = 'detail';
      this.selectedTab.next(0);
      this.router.navigate(['/fleetvehicles/vehicles', vehicleId]);
      this.loadVehicleDocuments(vehicleId);
    }
  }

  private loadVehicleDocuments(vehicleId: number): void {
    this.http.get<VehicleDocument[]>(
      `${Config.API_URL}/v1/fleetvehicles/vehicles/${vehicleId}/documents`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.vehicleDocuments = data;
      },
      error: () => {
        // Mock data
        this.vehicleDocuments = [
          {
            documentId: 1,
            vehicleId: vehicleId,
            type: 'highway_sticker',
            country: 'CZ',
            validFrom: new Date('2024-01-01'),
            validTo: new Date('2025-01-31'),
            cost: 1500
          },
          {
            documentId: 2,
            vehicleId: vehicleId,
            type: 'highway_sticker',
            country: 'AT',
            validFrom: new Date('2024-06-01'),
            validTo: new Date('2024-12-31'),
            cost: 96
          },
          {
            documentId: 3,
            vehicleId: vehicleId,
            type: 'insurance',
            validFrom: new Date('2024-01-01'),
            validTo: new Date('2024-12-31'),
            description: 'Pojištění odpovědnosti + havarijní'
          },
          {
            documentId: 4,
            vehicleId: vehicleId,
            type: 'inspection',
            validFrom: new Date('2023-06-15'),
            validTo: new Date('2025-06-15'),
            description: 'STK'
          }
        ];
      }
    });
  }

  public goToList(): void {
    this.showPage = 'list';
    this.selectedVehicle = null;
    this.fleet.selectedVehicle = null;
    this.router.navigate(['/fleetvehicles/vehicles']);
  }

  public openAddVehicleModal(): void {
    this.modalManager.openModal('add_vehicle');
  }

  public openEditVehicleModal(): void {
    if (this.selectedVehicle) {
      this.modalManager.openModal('edit_vehicle');
    }
  }

  public formatDate(date: Date): string {
    return Utils.formatDateShort(date);
  }

  public getStatusClass(status: VehicleStatus): string {
    return status;
  }

  public getDaysUntilExpiry(date: Date): number {
    return moment(date).diff(moment(), 'days');
  }

  public getExpiryClass(date: Date): string {
    const days = this.getDaysUntilExpiry(date);
    if (days < 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'valid';
  }

  public formatMileage(mileage: number | undefined): string {
    if (!mileage) return '-';
    return mileage.toLocaleString('cs-CZ') + ' km';
  }
}
