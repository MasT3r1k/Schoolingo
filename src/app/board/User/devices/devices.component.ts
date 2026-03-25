import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ModalManager } from '@Schoolingo/modal';
import { RemoveDeviceModalComponent } from './modals/remove-device-modal/remove-device-modal.component';

interface DeviceSession {
  device_id: number;
  browser: string;
  os: string;
  userAgent: string;
  ip: string | null;
  expires: Date;
  current: boolean;
  icon: string;
  isMobile: boolean;
  city: string | null;
  country: string | null;
  country_code: string | null;
  _showIp: boolean;
}

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit {
  Utils = Utils;
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public sessions: DeviceSession[] = [];

  ngOnInit(): void {
    this.modalManager.addModal('remove-device', {
      title: 'devices.remove_confirm_title',
      icon: 'device-mobile-off',
      closeable: true,
      items: [
        { type: 'component', component: RemoveDeviceModalComponent }
      ]
    });

    this.http.get<any[]>(
      `${Config.API_URL}/v1/devices/list`,
      { withCredentials: true }
    )
    .subscribe((data: any[]) => {
      this.sessions = data.map((device: any) => ({
        ...device,
        browser: Utils.getBrowser(device.user_agent),
        os: Utils.getOS(device.user_agent),
        icon: Utils.getOSIcon(device.user_agent),
        isMobile: Utils.getMobile(device.user_agent),
        _showIp: false
      }))
    });
  }

  public logoutSession(id: number): void {
    this.modalManager.openModal('remove-device', {
      type: 'single',
      deviceId: id,
      callback: () => {
        // Logika pro odhlášení
        this.sessions = this.sessions.filter(s => s.device_id !== id);
      }
    });
  }

  public logoutAllOther(): void {
    this.modalManager.openModal('remove-device', {
      type: 'all',
      callback: () => {
        // Logika pro odhlášení všech ostatních
        this.sessions = this.sessions.filter(s => s.current);
      }
    });
  }
}
