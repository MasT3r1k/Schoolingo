import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

import * as fleetVehicles from './types';

// Re-export all types for external use
export default fleetVehicles

@Injectable({
  providedIn: 'root'
})
export class FleetVehicles {
  private http = inject(HttpClient);
  
  public vehicles = new BehaviorSubject<fleetVehicles.Vehicle[]>([]);
  public reservations = new BehaviorSubject<fleetVehicles.Reservation[]>([]);
  public documents = new BehaviorSubject<fleetVehicles.VehicleDocument[]>([]);
  public settings = signal<fleetVehicles.FleetSettings | null>(null);
  public stats = signal<fleetVehicles.FleetStats | null>(null);

  public selectedVehicle: fleetVehicles.Vehicle | null = null;
  public selectedReservation: fleetVehicles.Reservation | null = null;
  public loading = signal<boolean>(false);

  // Highway sticker countries
  public highwayStickerCountries = fleetVehicles.HIGHWAY_STICKER_COUNTRIES;
  public tollFreeCountries = fleetVehicles.TOLL_FREE_COUNTRIES;
  public tollPayPerUseCountries = fleetVehicles.TOLL_PAY_PER_USE_COUNTRIES;

  // ==================== API METHODS ====================
  
  loadVehicles(): Observable<fleetVehicles.Vehicle[]> {
    this.loading.set(true);
    return this.http.get<{ vehicles: any[] }>(
      `${Config.API_URL}/v1/fleet/vehicles`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const vehicles = response.vehicles.map(v => this.mapVehicle(v));
        this.vehicles.next(vehicles);
        this.loading.set(false);
        return vehicles;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  loadOverview(): Observable<fleetVehicles.FleetStats | null> {
    return this.http.get<{ stats: any }>(
      `${Config.API_URL}/v1/fleet/overview`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const stats: fleetVehicles.FleetStats = {
          totalVehicles: response.stats.totalVehicles || 0,
          availableVehicles: response.stats.totalVehicles || 0,
          reservedVehicles: 0,
          maintenanceVehicles: 0,
          upcomingReservations: response.stats.monthlyTrips || 0,
          expiringDocuments: 0,
          pendingApprovals: 0,
          monthlyTrips: response.stats.monthlyTrips || 0,
          monthlyExpenses: response.stats.monthlyExpenses || 0,
          monthlyDistance: response.stats.monthlyDistance || 0
        };
        this.stats.set(stats);
        return stats;
      }),
      catchError(() => of(null))
    );
  }

  loadTrips(vehicleId?: number): Observable<any[]> {
    const url = vehicleId 
      ? `${Config.API_URL}/v1/fleet/trips?vehicleId=${vehicleId}`
      : `${Config.API_URL}/v1/fleet/trips`;
    
    return this.http.get<{ trips: any[] }>(url, { withCredentials: true }).pipe(
      map(response => response.trips),
      catchError(() => of([]))
    );
  }

  loadExpenses(vehicleId?: number): Observable<any[]> {
    const url = vehicleId 
      ? `${Config.API_URL}/v1/fleet/expenses?vehicleId=${vehicleId}`
      : `${Config.API_URL}/v1/fleet/expenses`;
    
    return this.http.get<{ expenses: any[] }>(url, { withCredentials: true }).pipe(
      map(response => response.expenses),
      catchError(() => of([]))
    );
  }

  createVehicle(data: Partial<fleetVehicles.Vehicle>): Observable<{ vehicleId: number; success: boolean }> {
    return this.http.post<{ vehicleId: number; success: boolean }>(
      `${Config.API_URL}/v1/fleet/vehicles`,
      {
        plate: data.licensePlate,
        manufacture: data.brand,
        model: data.model,
        year_manufacture: data.year,
        fuel: data.fuelType,
        mileage: data.mileage
      },
      { withCredentials: true }
    );
  }

  createTrip(data: { vehicleId: number; purpose: string; start_location: string; end_location: string; distance?: number }): Observable<{ tripId: number; success: boolean }> {
    return this.http.post<{ tripId: number; success: boolean }>(
      `${Config.API_URL}/v1/fleet/trips`,
      data,
      { withCredentials: true }
    );
  }

  createExpense(data: { vehicleId: number; amount: number; description: string; category: string }): Observable<{ expenseId: number; success: boolean }> {
    return this.http.post<{ expenseId: number; success: boolean }>(
      `${Config.API_URL}/v1/fleet/expenses`,
      data,
      { withCredentials: true }
    );
  }

  // ==================== HELPER METHODS ====================

  private mapVehicle(v: any): fleetVehicles.Vehicle {
    return {
      vehicleId: v.vehicleId,
      name: `${v.manufacture} ${v.model}`,
      licensePlate: v.plate,
      brand: v.manufacture,
      model: v.model,
      year: v.year_manufacture,
      type: 'car',
      status: 'available',
      color: '',
      fuelType: v.fuel,
      mileage: v.mileage,
      capacity: 5
    };
  }

  getVehicleById(id: number): fleetVehicles.Vehicle | undefined {
    return this.vehicles.getValue().find(v => v.vehicleId === id);
  }

  getReservationsForVehicle(vehicleId: number): fleetVehicles.Reservation[] {
    return this.reservations.getValue().filter(r => r.vehicleId === vehicleId);
  }

  getDocumentsForVehicle(vehicleId: number): fleetVehicles.VehicleDocument[] {
    return this.documents.getValue().filter(d => d.vehicleId === vehicleId);
  }

  getExpiringDocuments(days: number = 30): fleetVehicles.VehicleDocument[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.documents.getValue().filter(d => {
      const validTo = new Date(d.validTo);
      return validTo >= now && validTo <= futureDate;
    });
  }

  getFuelLabel(fuel: fleetVehicles.FuelType): string {
    const labels: Record<fleetVehicles.FuelType, string> = {
      'petrol': 'fleetvehicles.fuel.petrol',
      'diesel': 'fleetvehicles.fuel.diesel',
      'electric': 'fleetvehicles.fuel.electric',
      'hybrid': 'fleetvehicles.fuel.hybrid',
      'lpg': 'fleetvehicles.fuel.lpg',
      'cng': 'fleetvehicles.fuel.cng',
    };
    return labels[fuel] || fuel;
  }

  getVehicleStatusLabel(status: fleetVehicles.VehicleStatus): string {
    const labels: Record<fleetVehicles.VehicleStatus, string> = {
      'available': 'fleetvehicles.status.available',
      'reserved': 'fleetvehicles.status.reserved',
      'maintenance': 'fleetvehicles.status.maintenance',
      'unavailable': 'fleetvehicles.status.unavailable'
    };
    return labels[status] || status;
  }

  getDocumentTypeLabel(type: fleetVehicles.DocumentType): string {
    const labels: Record<fleetVehicles.DocumentType, string> = {
      'highway_sticker': 'fleetvehicles.document.highway_sticker',
      'insurance': 'fleetvehicles.document.insurance',
      'inspection': 'fleetvehicles.document.inspection',
      'emission': 'fleetvehicles.document.emission',
      'other': 'fleetvehicles.document.other'
    };
    return labels[type] || type;
  }

  getVehicleGearboxLabel(gearbox: fleetVehicles.VehicleGearbox): string {
    const labels: Record<fleetVehicles.VehicleGearbox, string> = {
      'manual': 'fleetvehicles.gearbox.manual',
      'automatic': 'fleetvehicles.gearbox.automatic'
    };
    return labels[gearbox] || gearbox;
  }

  getVehicleTypeLabel(type: fleetVehicles.VehicleType): string {
    const labels: Record<fleetVehicles.VehicleType, string> = {
      'car': 'fleetvehicles.type.car',
      'van': 'fleetvehicles.type.van',
      'bus': 'fleetvehicles.type.bus',
      'minibus': 'fleetvehicles.type.minibus',
      'truck': 'fleetvehicles.type.truck',
      'motorcycle': 'fleetvehicles.type.motorcycle'
    };
    return labels[type] || type;
  }

  getVehicleTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'car': 'car',
      'van': 'truck',
      'bus': 'bus',
      'minibus': 'bus',
      'truck': 'truck-delivery',
      'motorcycle': 'motorbike'
    };
    return icons[type] || 'car';
  }

  getStatusColor(status: fleetVehicles.VehicleStatus): string {
    const colors: Record<fleetVehicles.VehicleStatus, string> = {
      'available': 'var(--success)',
      'reserved': 'var(--warning)',
      'maintenance': 'var(--danger)',
      'unavailable': 'var(--text-muted)'
    };
    return colors[status] || 'var(--text-muted)';
  }
}

