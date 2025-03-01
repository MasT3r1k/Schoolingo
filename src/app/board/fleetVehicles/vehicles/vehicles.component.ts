import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent, errorAPI, Metadata } from '@Components/Datalist/Datalist';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { Vehicle } from '@Schoolingo/Vehicles';
import { Country } from 'country-state-city';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  imports: [FormsModule, ReactiveFormsModule, DatalistComponent, TabsComponent],
  standalone: true,
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css', '../../../Styles/card.css']
})
export class VehiclesComponent implements OnInit {
  Utils = Utils;
  Country = Country;
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public page: 'list' | 'detail' = 'list';

  private listeners: Subscription[] = [];
  public vehicles = new BehaviorSubject<Data[][]>([]);
  public selectedVehicle: any = null;
  public selectedTab = new BehaviorSubject(0);
  public metadata: Metadata = { rows: 0 }
  public search = new FormControl();
  public datalist!: DatalistComponent;

  ngOnInit(): void {
    this.listeners.push(this.schoolingo.socketService.addFunction("fleetVehicles:getVehicles").subscribe((vehicles: dataAPI | errorAPI) => {
      if ('data' in vehicles) {
        this.metadata.rows = vehicles.rows;
        let vehicleList: Data[][] = [];
        vehicles.data.forEach((vehicle: any) => {
          vehicleList.push([{
            id: vehicle.vehicleId
          }, {
            value: vehicle.manufacture,
            isLocale: false
          }, {
            value: vehicle.model,
            isLocale: false
          }, {
            value: vehicle.year_manufacture,
            isLocale: false
          }, {
            value: Country.getCountryByCode(vehicle.countryCode)?.flag + ' ' + vehicle.plate,
            isLocale: false
          }, {
            value: vehicle.mileage + ' km',
            isLocale: false
          }]);
        });
        this.vehicles.next(vehicleList);
      }
    }));

    this.listeners.push(this.schoolingo.socketService.addFunction("fleetVehicles:getVehicleInfo").subscribe((vehicleInfo: any | errorAPI) => {
      console.log(vehicleInfo)
      this.selectedVehicle = vehicleInfo;
    }));
  }

  public getVignette(): any {
    return Object.entries(this.selectedVehicle.vignette);
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public getVehicleInfo(): void {
    console.log(Vehicle.getVehicleInfo(this.search.value));
  }

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  onClick = (id: any, index: number): void => {
    this.selectedVehicle = undefined;
    this.schoolingo.socketService.emit('fleetVehicles:getVehicleInfo', { vehicleId: id[0].id });
    this.page = 'detail';
  }

}
