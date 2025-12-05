import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { Config } from '@Schoolingo/config';
import { FleetVehicles } from '@Schoolingo/fleetvehicles';
import { FleetSettings, ApprovalMode, VehicleType, HIGHWAY_STICKER_COUNTRIES, TOLL_FREE_COUNTRIES, TOLL_PAY_PER_USE_COUNTRIES } from '../../../infrastructure/fleetvehicles/types';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [IconsModule, FormsModule, NgClass],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public fleet = inject(FleetVehicles);
  private http = inject(HttpClient);

  public loading = true;
  public saving = false;

  public settings: FleetSettings = {
    approvalMode: 'auto',
    defaultManagerId: undefined,
    defaultManagerName: undefined,
    requireDestination: false,
    requirePurpose: true,
    maxReservationDays: 30,
    advanceBookingDays: 90,
    documentReminderDays: 14,
    enabledVehicleTypes: ['car', 'van', 'bus', 'minibus', 'truck', 'motorcycle'],
    notifyOnReservation: true,
    notifyOnApproval: true,
    notifyOnDocumentExpiry: true
  };

  public approvalModes: ApprovalMode[] = ['auto', 'manager_approval', 'free'];
  public vehicleTypes: VehicleType[] = ['car', 'van', 'bus', 'minibus', 'truck', 'motorcycle'];

  // Highway sticker countries
  public highwayStickerCountries = HIGHWAY_STICKER_COUNTRIES;
  public tollFreeCountries = TOLL_FREE_COUNTRIES;
  public tollPayPerUseCountries = TOLL_PAY_PER_USE_COUNTRIES;

  // Manager search
  public managerSearchQuery = '';
  public managerSearchResults: any[] = [];

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.http.get<FleetSettings>(
      `${Config.API_URL}/v1/fleetvehicles/settings`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.settings = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public saveSettings(): void {
    this.saving = true;
    this.http.put(
      `${Config.API_URL}/v1/fleetvehicles/settings`,
      this.settings,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.saving = false;
        Swal.fire({
          title: this.l.s('fleetvehicles.settings_saved'),
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        this.saving = false;
        Swal.fire({
          title: this.l.s('errors.save_failed'),
          icon: 'error'
        });
      }
    });
  }

  public toggleVehicleType(type: VehicleType): void {
    const index = this.settings.enabledVehicleTypes.indexOf(type);
    if (index === -1) {
      this.settings.enabledVehicleTypes.push(type);
    } else {
      this.settings.enabledVehicleTypes.splice(index, 1);
    }
  }

  public isVehicleTypeEnabled(type: VehicleType): boolean {
    return this.settings.enabledVehicleTypes.includes(type);
  }

  public searchManager(): void {
    if (this.managerSearchQuery.length < 2) {
      this.managerSearchResults = [];
      return;
    }

    this.http.get<any[]>(
      `${Config.API_URL}/v1/users/search?q=${encodeURIComponent(this.managerSearchQuery)}&role=teacher`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.managerSearchResults = data;
      },
      error: () => {
        this.managerSearchResults = [];
      }
    });
  }

  public selectManager(user: any): void {
    this.settings.defaultManagerId = user.userId;
    this.settings.defaultManagerName = user.fullName;
    this.managerSearchQuery = '';
    this.managerSearchResults = [];
  }

  public clearManager(): void {
    this.settings.defaultManagerId = undefined;
    this.settings.defaultManagerName = undefined;
  }

  public getApprovalModeDescription(mode: ApprovalMode): string {
    return this.l.s(`fleetvehicles.approval_mode.${mode}_desc`);
  }
}
