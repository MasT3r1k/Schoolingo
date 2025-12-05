import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-cafeteria',
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './cafeteria.component.html',
  styleUrl: './cafeteria.component.css'
})
export class CafeteriaComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public menu: any[] = [];
  public balance: number = 0;
  public isLoading = true;

  ngOnInit(): void {
    this.loadMenu();
  }

  public loadMenu(): void {
    this.http.get(
      `${Config.API_URL}/v1/cafeteria/menu?days=5`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if ('menu' in data) {
          this.menu = data.menu;
        }
        if ('balance' in data) {
          this.balance = data.balance;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public formatDate(date: string | Date): string {
    if (!date) return '';
    const d = moment(date);
    const now = moment();
    
    if (d.isSame(now, 'day')) return 'Dnes';
    if (d.isSame(moment().add(1, 'day'), 'day')) return 'Zítra';
    return d.format('dd D. M.');
  }

  public getDayName(date: string | Date): string {
    if (!date) return '';
    return moment(date).format('dddd');
  }

  public formatPrice(price: number): string {
    return `${price} Kč`;
  }

  public getOrderStatusClass(item: any): string {
    if (item.ordered) return 'ordered';
    if (item.available) return 'available';
    return 'unavailable';
  }

  public getOrderStatusIcon(item: any): string {
    if (item.ordered) return 'check';
    if (item.available) return 'plus';
    return 'x';
  }
}
