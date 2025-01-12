import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent, errorAPI, Metadata } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { Vehicle } from '@Schoolingo/Vehicles';
import { Country } from 'country-state-city';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  imports: [FormsModule, ReactiveFormsModule, DatalistComponent],
  standalone: true,
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css', '../../../Styles/card.css']
})
export class VehiclesComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public page: 'list' | 'detail' = 'list';

  private listeners: Subscription[] = [];
  public vehicles: BehaviorSubject<Data[][]> = new BehaviorSubject<Data[][]>([]);
  public selectedVehicle: any = null;
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
  }

  public getVehicleInfo(): void {
    console.log(Vehicle.getVehicleInfo(this.search.value));
  }

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  onClick = (id: any, index: number): void => {
    console.log('ID: ' + id[0].id);
    console.log('Index: ' + index);
    this.selectedVehicle = this.vehicles.getValue()[index];
    this.page = 'detail';
  }

}
