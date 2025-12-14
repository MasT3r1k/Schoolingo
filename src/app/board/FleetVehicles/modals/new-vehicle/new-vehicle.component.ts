import { Component, inject } from '@angular/core';
import { TabsComponent } from '@Components/Tabs';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject } from 'rxjs';
import { FuelType, LICENSE_PLATES, VehicleGearbox, VehicleType } from '../../../../infrastructure/fleetvehicles/types';
import { FleetVehicles } from '@Schoolingo/fleetvehicles';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as VehicleConfig from '../../../../infrastructure/fleetvehicles/config';


@Component({
  imports: [TabsComponent, IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-vehicle.component.html',
  styleUrl: './new-vehicle.component.css'
})
export class NewVehicleComponent {
  public VehicleConfig = VehicleConfig
  public LICENSE_PLATES = LICENSE_PLATES
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  public vehicles = inject(FleetVehicles);
  public types: VehicleType[] = ['car', 'van', 'bus', 'minibus', 'truck', 'motorcycle'];
  public type: VehicleType = this.types[0];
  public fuels: FuelType[] = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'];
  public fuel: FuelType = this.fuels[0];
  public gearboxTypes: VehicleGearbox[] = ['manual', 'automatic'];
  public gearbox: VehicleGearbox = 'manual';
  public assignment: 'everyone' | 'specific' = 'everyone';
  public country = 0;
  public vin = '';

  public option_icons = [
    'dashboard',
    'gas-station',
    'clock',
    'user'
  ];
  public options = [
    'fleetvehicles.new_vehicle.basic_info',
    'fleetvehicles.new_vehicle.operating_and_technical_data',
    'fleetvehicles.new_vehicle.administration_and_deadlines',
    'fleetvehicles.new_vehicle.assignment'
  ];
  public selected_tab = new BehaviorSubject(0);

}
