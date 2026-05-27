import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Cookies } from '@Schoolingo/cookies';
import { CheckboxComponent } from '@Components/Checkbox';

interface CookiePreference {
  category: string;
  enabled: boolean;
  required: boolean;
}

interface CookieInfo {
  name: string;
  category: string;
  purpose: string;
  duration: string;
  provider: string;
}

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, RouterModule, CheckboxComponent],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.css'
})
export class CookiesComponent implements OnInit {
  public cookies = inject(Cookies);
  public l = inject(Locale);

  ngOnInit(): void {
    this.cookies.loadPreferences();
  }
}
