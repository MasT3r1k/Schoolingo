import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../../infrastructure/config';
import { DatePipe } from '@angular/common';
import { MoneyPipe } from '../../../pipes/money/money.pipe';

@Component({
  selector: 'app-canteen-history',
  standalone: true,
  imports: [CommonModule, IconsModule, MoneyPipe, DatePipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  title = 'Historie plateb';
  subtitle = 'Platby za obědy a refundace za zrušené / nevyzvednuté obědy.';

  history: any[] = [];
  loading = true;

  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<any[]>(Config.API_URL + '/v1/canteen/history', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.history = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }
}
