import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { SeasonalService, SeasonalAdminSettings } from '@Schoolingo/seasonal';
import { NgClass } from '@angular/common';

interface SeasonConfig {
  key: string;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-admin-seasonal',
  standalone: true,
  imports: [IconsModule, ReactiveFormsModule],
  templateUrl: './seasonal.component.html',
  styleUrl: './seasonal.component.css'
})
export class SeasonalAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  public l = inject(Locale);
  public seasonalService = inject(SeasonalService);
  
  public isLoading = true;
  public isSaving = false;
  public saveSuccess = false;
  
  public form: FormGroup = this.fb.group({
    enabled: [true],
    allowUserOverride: [true],
    christmas: this.fb.group({
      enabled: [true],
      startDate: ['12-12'],
      endDate: ['01-06']
    }),
    easter: this.fb.group({
      enabled: [true],
      startDate: ['auto'],
      endDate: ['auto']
    }),
    summer: this.fb.group({
      enabled: [true],
      startDate: ['06-15'],
      endDate: ['09-01']
    }),
    graduation: this.fb.group({
      enabled: [true],
      startDate: ['05-15'],
      endDate: ['06-15']
    })
  });
  
  public seasons: SeasonConfig[] = [
    { key: 'christmas', name: 'Vánoce', icon: 'snowflake', color: '#D4A853' },
    { key: 'easter', name: 'Velikonoce', icon: 'egg', color: '#9BC4A8' },
    { key: 'summer', name: 'Léto', icon: 'sun', color: '#F4A261' },
    { key: 'graduation', name: 'Promoce', icon: 'school', color: '#C9A227' }
  ];
  
  ngOnInit(): void {
    this.loadSettings();
  }
  
  private loadSettings(): void {
    this.http.get<SeasonalAdminSettings>(`${Config.API_URL}/v1/admin/seasonal`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        this.form.patchValue({
          enabled: data.enabled,
          allowUserOverride: data.allowUserOverride,
          christmas: data.seasons.christmas,
          easter: data.seasons.easter,
          summer: data.seasons.summer,
          graduation: data.seasons.graduation
        });
        this.isLoading = false;
      },
      error: () => {
        // Use defaults
        this.isLoading = false;
      }
    });
  }
  
  public saveSettings(): void {
    this.isSaving = true;
    this.saveSuccess = false;
    
    const formValue = this.form.value;
    const settings: SeasonalAdminSettings = {
      enabled: formValue.enabled,
      allowUserOverride: formValue.allowUserOverride,
      seasons: {
        christmas: formValue.christmas,
        easter: formValue.easter,
        summer: formValue.summer,
        graduation: formValue.graduation
      }
    };
    
    this.http.post(`${Config.API_URL}/v1/admin/seasonal`, settings, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }
  
  public toggleSeason(seasonKey: string): void {
    const group = this.form.get(seasonKey);
    if (group) {
      const currentValue = group.get('enabled')?.value;
      group.get('enabled')?.setValue(!currentValue);
    }
  }
  
  public previewSeason(seasonKey: string): void {
    // Temporarily apply seasonal class for preview
    const html = document.documentElement;
    const classes = ['seasonal-christmas', 'seasonal-easter', 'seasonal-summer', 'seasonal-graduation', 'seasonal-full'];
    
    // Remove all seasonal classes
    classes.forEach(c => html.classList.remove(c));
    
    // Add the preview class
    html.classList.add(`seasonal-${seasonKey}`);
    html.classList.add('seasonal-full');
    
    // Remove after 5 seconds
    setTimeout(() => {
      html.classList.remove(`seasonal-${seasonKey}`);
      html.classList.remove('seasonal-full');
    }, 5000);
  }
}
