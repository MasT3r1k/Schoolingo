import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Permission } from '@Schoolingo/permission';
import { Config } from '@Schoolingo/config';
import { MoneyPipe } from '../../../pipes/money/money.pipe';
import { Utils } from '@Schoolingo/utils';

@Component({
  selector: 'app-payment-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, MoneyPipe],
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css']
})
export class ListingComponent implements OnInit {
  public l = inject(Locale);
  public auth = inject(Authentication);
  public perm = inject(Permission);
  private http = inject(HttpClient);
  public Utils = Utils;

  public searchQuery = '';
  public filterClass = '';
  public filterStatus = '';
  public loading = false;

  public items: any[] = [];
  public classes: { name: string; class_id: number }[] = [];

  public get filteredItems() {
    return this.items.filter((item) => {
      const matchSearch = !this.searchQuery ||
        item.name?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchClass = !this.filterClass ||
        String(item.class_id) === this.filterClass;
      const matchStatus = !this.filterStatus ||
        item.status === this.filterStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }

  public isClosed(item: any): boolean {
    return item.due_date && new Date(item.due_date) < new Date();
  }

  ngOnInit(): void {
    this.loading = true;

    this.http.get<any[]>(`${Config.API_URL}/v1/payments/fees`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.items = data;
          // Sestavit unikátní seznam tříd z dat
          const seen = new Set<string>();
          this.classes = data
            .filter((item) => item.class_id && !seen.has(String(item.class_id)) && seen.add(String(item.class_id)))
            .map((item) => ({ name: item.class_name ?? String(item.class_id), class_id: item.class_id }));
        },
        error: () => { this.loading = false; }
      });
  }

  deleteFee(fee_id: number): void {
    if (!confirm('Opravdu chcete smazat tento poplatek?')) return;

    this.http.delete(`${Config.API_URL}/v1/payments/fee/${fee_id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.items = this.items.filter((i) => i.payment_fee_id !== fee_id);
        },
        error: () => {}
      });
  }
}
