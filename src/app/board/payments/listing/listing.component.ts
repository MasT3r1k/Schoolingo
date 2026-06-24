import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Permission } from '@Schoolingo/permission';

@Component({
  selector: 'app-payment-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css']
})
export class ListingComponent implements OnInit {
  public l = inject(Locale);
  public auth = inject(Authentication);
  public perm = inject(Permission);
  private http = inject(HttpClient);

  public searchQuery = '';
  public filterClass = '';
  public filterStatus = '';

  public items = [
    { id: 1, name: 'Pracovní sešity', class_name: '1.A', amount: 450, created: '01. 09. 2024', deadline: '15. 09. 2024', paid: 28, total: 30, status: 'active' },
    { id: 2, name: 'Výlet ZOO', class_name: '3.B', amount: 200, created: '10. 10. 2024', deadline: '20. 10. 2024', paid: 25, total: 25, status: 'closed' },
    { id: 3, name: 'SRPŠ', class_name: 'Všechny', amount: 500, created: '01. 09. 2024', deadline: '31. 10. 2024', paid: 400, total: 450, status: 'active' }
  ];

  ngOnInit(): void {
  }
}
