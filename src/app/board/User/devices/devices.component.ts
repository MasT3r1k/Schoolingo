import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Schoolingo } from '@Schoolingo';
import { Country } from 'country-state-city';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { Device } from './devices.component.d'; 
import { Utils } from '@Schoolingo/Utils';

@Component({
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css', '../../../Styles/card.css', '../../../Styles/select.css']
})
export class DevicesComponent {
  private devices: Device[] = [];
  private subscribers: Subscription[] = [];
  public country = Country;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  moment = moment;
  Utils = Utils;

  ngOnInit(): void {
    this.schoolingo.socketService.emit('devices:getDevices');

    this.subscribers.push(this.schoolingo.socketService.addFunction("devices:getDevices").subscribe((data: Device[]) => {
      this.devices = data;
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("devices:removeDevice").subscribe((data: any) => {
      let index = this.devices.findIndex((device: Device) => device.id == data.id);
      this.devices.splice(index, 1);
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit('devices:getDevices');
    }));
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

  public removeDevice(id: number): void {
    this.schoolingo.socketService.emit('devices:removeDevice', { id });
  }


  public removeAllDevices(): void {   // TODO! velmi ošklivé :(, potencionálně přiliš mnoho requestů
    this.getAnotherDevices().forEach((device: Device) => {
      this.removeDevice(device.id);
    });
  }
}
