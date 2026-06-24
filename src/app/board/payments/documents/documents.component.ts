import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Permission } from '@Schoolingo/permission';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";
import { MoneyPipe } from "../../../pipes/money/money.pipe";

@Component({
  selector: 'app-payment-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, StatCardComponent, MoneyPipe],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  public l = inject(Locale);
  public auth = inject(Authentication);
  public perm = inject(Permission);
  private http = inject(HttpClient);

  public searchQuery = '';
  public filterType = '';

  public documents = [
    { id: 1, number: 'FV-2024-001', type: 'income', description: 'Pracovní sešity 1.A', amount: 12600, date: '05. 09. 2024', issuedBy: 'Jan Novák' },
    { id: 2, number: 'FV-2024-002', type: 'income', description: 'Výlet ZOO 3.B', amount: 5000, date: '12. 10. 2024', issuedBy: 'Jan Novák' },
    { id: 3, number: 'FA-2024-015', type: 'expense', description: 'Nákup učebnic AJ', amount: 14500, date: '20. 08. 2024', issuedBy: 'Eva Malá' }
  ];

  ngOnInit(): void {
  }
}
