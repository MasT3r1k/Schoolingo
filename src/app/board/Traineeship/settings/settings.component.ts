import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { TraineeshipSettingsService, TraineeshipConfig } from '../../../infrastructure/traineeship/traineeship-settings.service';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  standalone: true,
  imports: [NgClass, IconsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class SettingsComponent implements OnInit {
  public schoolingo = inject(Schoolingo);
  public traineeshipService = inject(TraineeshipSettingsService);
  
  public config: TraineeshipConfig | null = null;
  public loading = true;
  public saving = false;

  ngOnInit(): void {
    this.loadConfig();
  }

  private loadConfig(): void {
    this.loading = true;
    this.traineeshipService.loadConfig().subscribe({
      next: (config) => {
        this.config = config;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public toggleModule(): void {
    if (!this.config) return;
    
    const newValue = !this.config.isActivated;
    this.saving = true;
    
    this.traineeshipService.updateConfig({ isActivated: newValue }).subscribe({
      next: (response) => {
        if (response.success && this.config) {
          this.config.isActivated = newValue;
        }
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  public toggleAllowMap(): void {
    if (!this.config) return;
    
    const newValue = !this.config.allowMap;
    this.saving = true;
    
    this.traineeshipService.updateConfig({ allowMap: newValue }).subscribe({
      next: (response) => {
        if (response.success && this.config) {
          this.config.allowMap = newValue;
        }
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  get checked(): boolean {
    return this.config?.isActivated || false;
  }
}

