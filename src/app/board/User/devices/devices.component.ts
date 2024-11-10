import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Schoolingo } from '@Schoolingo';
import { addZeros } from '@Schoolingo/Utils';
import { Moment } from 'moment';
import { Subscription } from 'rxjs';

type Device = {
  active: boolean;
  hasSocket: boolean;
  id: number;
  userAgent: string;
  expires: Moment;
}

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css', '../../../Styles/card.css', '../../../Styles/select.css']
})
export class DevicesComponent {
  private devices: Device[] = [];
  private subscribers: Subscription[] = [];

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
    this.subscribers.push(this.schoolingo.socketService.addFunction("getDevices").subscribe((data: any) => {
      this.devices = data;
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("removeDevice").subscribe((data: any) => {
      let index = this.devices.findIndex((device: Device) => device.id == data.id);
      this.devices.splice(index, 1);
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("connect").subscribe((data: any) => {
      this.schoolingo.socketService.emit('getDevices');
    }));
  }

  ngOnDestroy(): void {
    this.subscribers.forEach((subscribe: Subscription) => subscribe.unsubscribe());
  }

  public getOS(userAgent: string): string {
    {
      var OSName = "???";
      if (userAgent.indexOf("Win") != -1) OSName = "Windows";
      if (userAgent.indexOf("Mac") != -1) OSName = "Macintosh";
      if (userAgent.indexOf("Linux") != -1) OSName = "Linux";
      if (userAgent.indexOf("Android") != -1) OSName = "Android";
      if (userAgent.indexOf("like Mac") != -1) OSName = "iOS";
      return OSName;
    }
  }

  public getOwnUserAgent(): string {
    return window.navigator.userAgent;
  }
  

  public getMobile(userAgent: string): boolean {
    return /Mobi|Fennec|mini|Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|iP(ad|od|hone)/i.test(userAgent);
  }

  public getBrowser(userAgent: string): string {
    let browser: string = '???';
    if ((userAgent.indexOf("Opera") || userAgent.indexOf('OPR')) != -1) {
      browser = "Opera";
    } else if (userAgent.indexOf("Edg") != -1) {
      browser = "Edge";
    } else if (userAgent.indexOf("Chrome") != -1) {
      browser = "Chrome";
    } else if (userAgent.indexOf("Safari") != -1) {
      browser = "Safari";
    } else if (userAgent.indexOf("Firefox") != -1) {
      browser = "Mozilla";
    } else if ((userAgent.indexOf("MSIE") != -1) || (!!(document as any).documentMode == true)) {
      browser = 'IE';
    }
    return browser;
  }

  public getAnotherDevices(): Device[] {
    return this.devices.filter((device: Device) => device.active == false);
  }

  public getActiveDevice(): Device {
    return this.devices.filter((device: Device) => device.active == true)?.[0];
  }

  public removeDevice(id: number): void {
    this.schoolingo.socketService.emit('removeDevice', { id });
  }


  public removeAllDevices(): void {   // TODO! velmi ošklivé :(, NEBEZPEČNÝ: (MOŽNÉ) přiliš mnoho requestů
    this.getAnotherDevices().forEach((device: Device) => {
      this.removeDevice(device.id);
    });
  }

  public returnAsDate(date: string): Date {
    return new Date(date);
  }

  public formatDate(dat: Date): string {
    if (!dat || !dat?.getTime) return '';
    return dat.getHours() + ':' + addZeros(dat.getMinutes(), 2) + ':' + addZeros(dat.getSeconds(), 2) + ' ' + dat.getDate() + '. ' + (dat.getMonth() + 1) + '. ' + dat.getFullYear();
  
  }

}
