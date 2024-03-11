import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { UserService } from '@Schoolingo/User';
import { Component, OnInit } from '@angular/core';

type Device = {
  active: boolean;
  hasSocket: boolean;
  id: number;
  userAgent: string;
  expires: string;
}

@Component({
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css', '../../board.css', '../../../input.css']
})
export class DevicesComponent implements OnInit {

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    private socketService: SocketService,
    public userService: UserService
  ) {

    if (!this.schoolingo.getOfflineMode() && this.socketService.getSocket().Socket) {
      this.socketService.getSocket().Socket?.emit('getDevices');
    }
  }

  private devices: Device[] = [];


  ngOnInit(): void {
    this.socketService.addFunction("getDevices").subscribe((data: any) => {
      this.devices = data;
    });

    this.socketService.addFunction("removeDevice").subscribe((data: any) => {
      let index = this.devices.findIndex((device: Device) => device.id == data.id);
      this.devices.splice(index, 1);
    });

    this.socketService.addFunction("connect").subscribe((data: any) => {
      this.socketService.getSocket().Socket?.emit('getDevices');
    })
  }

  ngOnDestroy(): void {
    this.socketService.socketFunctions["getDevices"] = {};
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
    this.socketService.getSocket().Socket?.emit('removeDevice', { id });
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
  return dat.getHours() + ':' + this.schoolingo.addZeros(dat.getMinutes(), 2) + ':' + this.schoolingo.addZeros(dat.getSeconds(), 2) + ' ' + dat.getDate() + '. ' + (dat.getMonth() + 1) + '. ' + dat.getFullYear();

}



}
