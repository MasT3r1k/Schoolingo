import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Locale } from '@Schoolingo/locale';
import { Config } from '../../../infrastructure/config';
import { IconsModule } from '@Schoolingo/icons';
import { CheckboxComponent } from '@Components/Checkbox';
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  selector: 'app-canteen-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CheckboxComponent, DropdownComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  l = inject(Locale);
  private http = inject(HttpClient);

  settings: any = {
    canteen_enabled: '1',
    canteen_deadline_day: 'Neděle',
    canteen_deadline_time: '20:00',
    canteen_flat_price_enabled: '0',
    canteen_flat_price: '0',
    canteen_payment_account: '1',
    canteen_auto_refund: '1',
    canteen_breakfast_enabled: '0',
    canteen_dinner_enabled: '0'
  };

  staff: any[] = [];
  managers: number[] = [];
  cooks: number[] = [];

  searchQuery = '';
  saving = false;
  successMsg = '';
  errorMsg = '';

  ngOnInit() {
    this.http.get<any>(`${Config.API_URL}/v1/canteen/settings`, { withCredentials: true }).subscribe({
      next: (data) => {
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
        }
        this.staff = data.staff || [];
        this.managers = data.managers || [];
        this.cooks = data.cooks || [];
      },
      error: (err) => {
        console.error('Error loading settings', err);
        this.errorMsg = this.l.s('canteen.settings_load_error') || 'Nepodařilo se načíst nastavení.';
      }
    });
  }

  getFilteredStaff() {
    if (!this.searchQuery) return this.staff;
    const q = this.searchQuery.toLowerCase();
    return this.staff.filter(s => s.name.toLowerCase().includes(q));
  }

  isManager(userId: number): boolean {
    return this.managers.includes(userId);
  }

  isCook(userId: number): boolean {
    return this.cooks.includes(userId);
  }

  toggleManager(userId: number) {
    const idx = this.managers.indexOf(userId);
    if (idx > -1) {
      this.managers.splice(idx, 1);
    } else {
      this.managers.push(userId);
    }
  }

  toggleCook(userId: number) {
    const idx = this.cooks.indexOf(userId);
    if (idx > -1) {
      this.cooks.splice(idx, 1);
    } else {
      this.cooks.push(userId);
    }
  }

  getDeadlineDays() {
    return [
      { label: this.l.s('canteen.day_monday') || 'Pondělí', value: 'Pondělí' },
      { label: this.l.s('canteen.day_tuesday') || 'Úterý', value: 'Úterý' },
      { label: this.l.s('canteen.day_wednesday') || 'Středa', value: 'Středa' },
      { label: this.l.s('canteen.day_thursday') || 'Čtvrtek', value: 'Čtvrtek' },
      { label: this.l.s('canteen.day_friday') || 'Pátek', value: 'Pátek' },
      { label: this.l.s('canteen.day_saturday') || 'Sobota', value: 'Sobota' },
      { label: this.l.s('canteen.day_sunday') || 'Neděle', value: 'Neděle' }
    ];
  }

  getPaymentAccounts() {
    return [
      { label: (this.l.s('canteen.credit_account') || 'Kreditní účet') + ' (ID: 1)', value: '1' },
      { label: (this.l.s('canteen.class_fund_account') || 'Třídní fond') + ' (ID: 2)', value: '2' }
    ];
  }

  save() {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const payload = {
      settings: this.settings,
      managers: this.managers,
      cooks: this.cooks
    };

    this.http.post<any>(`${Config.API_URL}/v1/canteen/settings`, payload, { withCredentials: true }).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = this.l.s('canteen.settings_saved_success') || 'Nastavení bylo úspěšně uloženo.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        console.error('Error saving settings', err);
        this.errorMsg = this.l.s('canteen.settings_save_error') || 'Při ukládání nastavení došlo k chybě.';
      }
    });
  }
}
