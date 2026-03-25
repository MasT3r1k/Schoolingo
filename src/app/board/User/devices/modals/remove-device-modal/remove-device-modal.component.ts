import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-remove-device-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './remove-device-modal.component.html',
  styleUrl: './remove-device-modal.component.css'
})
export class RemoveDeviceModalComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  
  public data: any;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('remove-device');
  }

  public closeModal(): void {
    this.modalManager.closeModal('remove-device');
  }

  public confirm(): void {
    if (!this.data) return;
    this.data.callback();
    this.closeModal();
  }
}
