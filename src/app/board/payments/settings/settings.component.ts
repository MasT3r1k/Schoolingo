import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Permission } from '@Schoolingo/permission';
import { CheckboxComponent } from '@Components/Checkbox';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CheckboxComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  public l = inject(Locale);
  public auth = inject(Authentication);
  public perm = inject(Permission);

  public settings = {
    bankAccount: '1208000000001234567890/0100',
    vsPrefix: '2024',
    warningDays: 5,
    emailNotifications: true
  };

  public saveSettings() {
    // mock save
    console.log('Settings saved', this.settings);
  }

  ngOnInit(): void {
  }
}
