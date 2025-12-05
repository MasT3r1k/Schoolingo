import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as fleetVehicles from './types';

// Re-export all types for external use
export default fleetVehicles

@Injectable({
  providedIn: 'root'
})
export class FleetVehicles {
  public vehicles = new BehaviorSubject<fleetVehicles.Vehicle[]>([]);
  public reservations = new BehaviorSubject<fleetVehicles.Reservation[]>([]);
  public documents = new BehaviorSubject<fleetVehicles.VehicleDocument[]>([]);
  public settings = signal<fleetVehicles.FleetSettings | null>(null);
  public stats = signal<fleetVehicles.FleetStats | null>(null);

  public selectedVehicle: fleetVehicles.Vehicle | null = null;
  public selectedReservation: fleetVehicles.Reservation | null = null;

  // Highway sticker countries
  public highwayStickerCountries = fleetVehicles.HIGHWAY_STICKER_COUNTRIES;
  public tollFreeCountries = fleetVehicles.TOLL_FREE_COUNTRIES;
  public tollPayPerUseCountries = fleetVehicles.TOLL_PAY_PER_USE_COUNTRIES;

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

  getVehicleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
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
