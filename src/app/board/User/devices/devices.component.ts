import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Schoolingo } from '@Schoolingo';
import { Country } from 'country-state-city';
import { Subscription } from 'rxjs';
import { Device } from './devices.component.d'; 
import { Utils } from '@Schoolingo/Utils';
import { IconsModule } from '../../../Modules/Icons.module';
import { Alert } from '@Schoolingo/Alert';

@Component({
  standalone: true,
  imports: [RouterLink, IconsModule],
  providers: [],
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css', '../../../Styles/card.css', '../../../Styles/select.css', '../../../Styles/input.css', '../../../Components/Modal/modal.css']
})
export class DevicesComponent {
  public alert: Alert | null = null;
  public modal: 'confirmLogout' | null = null;
  private devices: Device[] = [];
  private subscribers: Subscription[] = [];
  public country = Country;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  Utils = Utils;

  ngOnInit(): void {
    this.schoolingo.socketService.emit('devices:getDevices');

    this.subscribers.push(
      this.schoolingo.socketService.addFunction("devices:getDevices").subscribe((data: Device[]) => {
        this.devices = data;
      })
    );

    this.subscribers.push(
      this.schoolingo.socketService.addFunction("devices:removeDevice").subscribe((data: { id: number[] }) => {
        this.modal = null;
        this.alert = null;
        for (let id of data.id) {
          let index = this.devices.findIndex((device: Device) => device.id == id);
          this.devices.splice(index, 1);
        }
      })
    );

    this.subscribers.push(
      this.schoolingo.socketService.addFunction("connect").subscribe(() => {
        this.schoolingo.socketService.emit('devices:getDevices');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscribers.forEach((subscribe: Subscription) => subscribe.unsubscribe());
  }


  public getAnotherDevices(): Device[] {
    return this.devices.filter((device: Device) => !device.active);
  }

  public getActiveDevice(): Device {
    return this.devices.filter((device: Device) => device.active)[0];
  }

  public removeDevice(id: number[]): void {
    this.schoolingo.socketService.emit('devices:removeDevice', { id });
  }


  public removeAllDevices(force: boolean = false): void {
    if (!this.getAnotherDevices().length) {
      this.alert = new Alert('error', 'devices/noAnotherDevicesToLogout');
      return;
    }
    if (!force) {
      this.modal = 'confirmLogout';
      return;
    }

    let deviceIds: number[] = [];
    this.getAnotherDevices().forEach((device: Device) => {
      deviceIds.push(device.id);
    });
    this.removeDevice(deviceIds);
  }
}
