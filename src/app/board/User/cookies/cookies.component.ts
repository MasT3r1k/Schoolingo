import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

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
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.css'
})
export class CookiesComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);

  public preferences: CookiePreference[] = [];
  public loading = false;
  public saving = false;
  public showCookieDetails = false;
  public selectedCategory: string | null = null;

  // Cookie categories
  public cookieCategories = [
    {
      id: 'essential',
      name: 'Nezbytné cookies',
      icon: 'lock',
      color: '#22c55e',
      description: 'Tyto cookies jsou nezbytné pro fungování webu. Bez nich by stránka nemohla správně fungovat.',
      required: true,
      examples: [
        'Přihlášení a autentizace',
        'Bezpečnostní tokeny',
        'Předvolby jazyka'
      ]
    },
    {
      id: 'functional',
      name: 'Funkční cookies',
      icon: 'adjustments',
      color: '#6366f1',
      description: 'Umožňují zapamatovat si vaše preference a poskytují vylepšené funkce.',
      required: false,
      examples: [
        'Nastavení zobrazení',
        'Historie procházení',
        'Personalizované funkce'
      ]
    },
    {
      id: 'analytics',
      name: 'Analytické cookies',
      icon: 'chart-pie',
      color: '#8b5cf6',
      description: 'Pomáhají nám pochopit, jak uživatelé používají naše stránky, abychom je mohli zlepšovat.',
      required: false,
      examples: [
        'Počet návštěv stránek',
        'Doba strávená na webu',
        'Výkon stránek'
      ]
    }
  ];

  // Detailed cookie information
  public cookiesList: CookieInfo[] = [
    // Essential
    { name: 'session_id', category: 'essential', purpose: 'Identifikace přihlášeného uživatele', duration: 'Session', provider: 'Schoolingo' },
    { name: 'csrf_token', category: 'essential', purpose: 'Ochrana proti CSRF útokům', duration: 'Session', provider: 'Schoolingo' },
    { name: 'auth_token', category: 'essential', purpose: 'Dlouhodobé přihlášení', duration: '30 dní', provider: 'Schoolingo' },
    { name: 'locale', category: 'essential', purpose: 'Ukládání preferovaného jazyka', duration: '1 rok', provider: 'Schoolingo' },
    
    // Functional
    { name: 'theme', category: 'functional', purpose: 'Uložení preferovaného vzhledu', duration: '1 rok', provider: 'Schoolingo' },
    { name: 'sidebar_state', category: 'functional', purpose: 'Stav postranního panelu', duration: '1 rok', provider: 'Schoolingo' },
    { name: 'recent_items', category: 'functional', purpose: 'Nedávno navštívené položky', duration: '30 dní', provider: 'Schoolingo' },
    
    // Analytics
    { name: '_ga', category: 'analytics', purpose: 'Google Analytics - rozlišení uživatelů', duration: '2 roky', provider: 'Google' },
    { name: '_gid', category: 'analytics', purpose: 'Google Analytics - rozlišení uživatelů', duration: '24 hodin', provider: 'Google' },
    { name: '_gat', category: 'analytics', purpose: 'Google Analytics - omezení rychlosti požadavků', duration: '1 minuta', provider: 'Google' },
    
    // Marketing
    { name: '_fbp', category: 'marketing', purpose: 'Facebook Pixel - sledování konverzí', duration: '3 měsíce', provider: 'Facebook' },
    { name: 'fr', category: 'marketing', purpose: 'Facebook - reklamní účely', duration: '3 měsíce', provider: 'Facebook' }
  ];

  ngOnInit(): void {
    this.loadPreferences();
  }

  private loadPreferences(): void {
    this.loading = true;
    this.http.get<{ preferences: CookiePreference[] }>(
      `${Config.API_URL}/v1/cookies/preferences`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.preferences) {
          this.preferences = data.preferences;
        } else {
          this.initDefaultPreferences();
        }
        this.loading = false;
      },
      error: () => {
        this.initDefaultPreferences();
        this.loading = false;
      }
    });
  }

  private initDefaultPreferences(): void {
    this.preferences = this.cookieCategories.map(cat => ({
      category: cat.id,
      enabled: cat.required,
      required: cat.required
    }));
  }

  public getCategoryPreference(categoryId: string): CookiePreference | undefined {
    return this.preferences.find(p => p.category === categoryId);
  }

  public getCategoryConfig(categoryId: string) {
    return this.cookieCategories.find(c => c.id === categoryId);
  }

  public getCookiesByCategory(categoryId: string): CookieInfo[] {
    return this.cookiesList.filter(c => c.category === categoryId);
  }

  public toggleCategory(categoryId: string): void {
    const pref = this.getCategoryPreference(categoryId);
    const config = this.getCategoryConfig(categoryId);

    if (config?.required) {
      return; // Cannot toggle required categories
    }

    if (pref) {
      pref.enabled = !pref.enabled;
    } else {
      this.preferences.push({
        category: categoryId,
        enabled: true,
        required: false
      });
    }
  }

  public acceptAll(): void {
    this.cookieCategories.forEach(cat => {
      const pref = this.getCategoryPreference(cat.id);
      if (pref) {
        pref.enabled = true;
      } else {
        this.preferences.push({
          category: cat.id,
          enabled: true,
          required: cat.required
        });
      }
    });
    this.savePreferences();
  }

  public acceptEssentialOnly(): void {
    this.cookieCategories.forEach(cat => {
      const pref = this.getCategoryPreference(cat.id);
      if (pref) {
        pref.enabled = cat.required;
      } else {
        this.preferences.push({
          category: cat.id,
          enabled: cat.required,
          required: cat.required
        });
      }
    });
    this.savePreferences();
  }

  public savePreferences(): void {
    this.saving = true;
    this.http.put(
      `${Config.API_URL}/v1/cookies/preferences`,
      { preferences: this.preferences },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.saving = false;
        // Apply cookie settings
        this.applyCookieSettings();
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  private applyCookieSettings(): void {
    // Remove cookies from disabled categories
    this.cookieCategories.forEach(cat => {
      const pref = this.getCategoryPreference(cat.id);
      if (pref && !pref.enabled) {
        this.getCookiesByCategory(cat.id).forEach(cookie => {
          this.deleteCookie(cookie.name);
        });
      }
    });
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  public clearAllCookies(): void {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        this.deleteCookie(name);
      }
    });
    this.initDefaultPreferences();
    this.savePreferences();
  }

  public toggleCategoryDetails(categoryId: string): void {
    if (this.selectedCategory === categoryId) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = categoryId;
    }
  }

  public getEnabledCount(): number {
    return this.preferences.filter(p => p.enabled).length;
  }

  public getTotalCategories(): number {
    return this.cookieCategories.length;
  }
}
