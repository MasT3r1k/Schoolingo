import { WritableSignal } from "@angular/core";
import { BehaviorSubject } from "rxjs";

// Vehicle Types
export type VehicleType = 'car' | 'van' | 'bus' | 'minibus' | 'truck' | 'motorcycle';
export type VehicleStatus = 'available' | 'reserved' | 'maintenance' | 'unavailable';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng';

// Document Types
export type DocumentType = 'highway_sticker' | 'insurance' | 'inspection' | 'emission' | 'other';

// Reservation Types
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
export type ApprovalMode = 'auto' | 'manager_approval' | 'free';

// Highway Sticker Countries (with paid vignettes)
export const HIGHWAY_STICKER_COUNTRIES = [
  { code: 'CZ', name: 'Česká republika', required: true },
  { code: 'AT', name: 'Rakousko', required: true },
  { code: 'SK', name: 'Slovensko', required: true },
  { code: 'SI', name: 'Slovinsko', required: true },
  { code: 'HU', name: 'Maďarsko', required: true },
  { code: 'CH', name: 'Švýcarsko', required: true },
  { code: 'BG', name: 'Bulharsko', required: true },
  { code: 'RO', name: 'Rumunsko', required: true },
  { code: 'MD', name: 'Moldavsko', required: true },
] as const;

// Countries without highway stickers (toll-free or pay-per-use)
export const TOLL_FREE_COUNTRIES = [
  { code: 'DE', name: 'Německo', note: 'toll_free_cars' },
  { code: 'PL', name: 'Polsko', note: 'toll_free_cars' },
  { code: 'NL', name: 'Nizozemsko', note: 'toll_free' },
  { code: 'BE', name: 'Belgie', note: 'toll_free' },
  { code: 'LU', name: 'Lucembursko', note: 'toll_free' },
  { code: 'DK', name: 'Dánsko', note: 'toll_free' },
  { code: 'SE', name: 'Švédsko', note: 'toll_free' },
  { code: 'FI', name: 'Finsko', note: 'toll_free' },
  { code: 'GB', name: 'Velká Británie', note: 'toll_free' },
] as const;

// Pay-per-use toll countries
export const TOLL_PAY_PER_USE_COUNTRIES = [
  { code: 'FR', name: 'Francie', note: 'pay_per_use' },
  { code: 'IT', name: 'Itálie', note: 'pay_per_use' },
  { code: 'ES', name: 'Španělsko', note: 'pay_per_use' },
  { code: 'PT', name: 'Portugalsko', note: 'pay_per_use' },
  { code: 'HR', name: 'Chorvatsko', note: 'pay_per_use' },
  { code: 'GR', name: 'Řecko', note: 'pay_per_use' },
] as const;

// Interfaces
export interface Vehicle {
  vehicleId: number;
  name: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  color?: string;
  fuelType?: FuelType;
  mileage?: number;
  capacity?: number;
  vin?: string;
  managerId?: number;        // Optional vehicle manager
  managerName?: string;
  notes?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleDocument {
  documentId: number;
  vehicleId: number;
  type: DocumentType;
  country?: string;          // For highway stickers
  validFrom: Date;
  validTo: Date;
  description?: string;
  documentUrl?: string;
  cost?: number;
  reminderDays?: number;     // Days before expiry to remind
  createdAt?: Date;
}

export interface Reservation {
  reservationId: number;
  vehicleId: number;
  vehicleName?: string;
  vehicleLicensePlate?: string;
  userId: number;
  userName?: string;
  driverId?: number;
  driverName?: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  destination?: string;
  status: ReservationStatus;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: Date;
  startMileage?: number;
  endMileage?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FleetSettings {
  approvalMode: ApprovalMode;
  defaultManagerId?: number;
  defaultManagerName?: string;
  requireDestination: boolean;
  requirePurpose: boolean;
  maxReservationDays: number;
  advanceBookingDays: number;
  documentReminderDays: number;
  enabledVehicleTypes: VehicleType[];
  notifyOnReservation: boolean;
  notifyOnApproval: boolean;
  notifyOnDocumentExpiry: boolean;
}

export interface FleetStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  maintenanceVehicles: number;
  upcomingReservations: number;
  expiringDocuments: number;
  pendingApprovals: number;
}

// Service class placeholder
export declare class FleetVehicles {
  vehicles: BehaviorSubject<Vehicle[]>;
  reservations: BehaviorSubject<Reservation[]>;
  settings: WritableSignal<FleetSettings | null>;
  stats: WritableSignal<FleetStats | null>;
  
  selectedVehicle: Vehicle | null;
  selectedReservation: Reservation | null;
  
  getVehicleById(id: number): Vehicle | undefined;
  getReservationsForVehicle(vehicleId: number): Reservation[];
  getDocumentsForVehicle(vehicleId: number): VehicleDocument[];
  getExpiringDocuments(days: number): VehicleDocument[];
  getVehicleStatusLabel(status: VehicleStatus): string;
  getDocumentTypeLabel(type: DocumentType): string;
}
