import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { Component, OnInit } from '@angular/core';

type Device = {
  active: boolean;
  hasSocket: boolean;
  id: number;
  userAgent: string;
}

@Component({
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css', '../../board.css', '../../../input.css']
})
export class DevicesComponent implements OnInit {

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    private socketService: SocketService
  ) {

    if (!this.schoolingo.getOfflineMode() && this.socketService.getSocket().Socket) {
      this.socketService.getSocket().Socket?.emit('getDevices');
    }
  }

  private devices: Device[] = [];


  ngOnInit(): void {
    this.socketService.addFunction("getDevices", (data: any) => {
      this.devices = data;
    });
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
    } if (userAgent.indexOf("Edg") != -1) {
      browser = "Edge";
    } if (userAgent.indexOf("Chrome") != -1) {
      browser = "Chrome";
    } if (userAgent.indexOf("Safari") != -1) {
      browser = "Safari";
    } if (userAgent.indexOf("Firefox") != -1) {
      browser = "Mozilla";
    } if ((userAgent.indexOf("MSIE") != -1) || (!!(document as any).documentMode == true)) {
      browser = 'IE';
    }
    return browser;
  }

  public getAnotherDevices(): Device[] {
    return this.devices.filter((device: Device) => device.active == false);
  }

}
