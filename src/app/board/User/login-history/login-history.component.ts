import { Component, inject, OnInit, Sanitizer } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { DatalistComponent, DatalistMetadata } from "@Components/datalist";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { IconsModule } from '@Schoolingo/icons';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [IconsModule, RouterLink, FormsModule],
  templateUrl: './login-history.component.html',
  styleUrl: './login-history.component.css'
})
export class LoginHistoryComponent implements OnInit {
  Utils = Utils;
  public l = inject(Locale);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private declare datalist;
  public page = new BehaviorSubject(1);
  public selected_id = null;

  public metadata: DatalistMetadata & { validLogins: number;failedLogins:number; } = {
    rows: 0,
    limit: 15,
    validLogins: 0,
    failedLogins: 0
  };

  public getPageList(): number[] {
      let pages = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
      let list: number[] = [];
      pages.forEach((page: number) => {
          list.push(page + this.page.getValue());
      })

      let startSlice = 0;
      if (this.page.getValue() == 4 || this.page.getValue() == this.getMaxPages() - 1) {
          startSlice = 1;
      }
      
      else if (this.page.getValue() > 3 && this.page.getValue() <= this.getMaxPages() - 2) {
          startSlice = 2;
      }

      return list.filter((page) => page > 0 && page <= this.getMaxPages()).slice(startSlice).slice(0,5);
  }

  public getMaxPages(): number {
      return Math.ceil(this.metadata.rows / this.metadata.limit);
  }

  public goPage(page: number): void {
      if (page <= 0 || page > this.getMaxPages() || page == this.page.getValue()) return;
      this.page.next(page);
      this.LoadDevices(page);
  }

  public history = new BehaviorSubject<any[]>([]);
  public dateFrom: string = '';
  public dateTo: string = '';
  public selectedPeriod: string = '30days';

  ngOnInit(): void {
    this.LoadDevices(this.page.getValue());

    this.route.queryParams.subscribe((data) => {
      if ('id' in data) {
        this.selected_id = data['id'];
      } else {
        this.selected_id = null;
      }
      console.log(data)
    });
  }

  public onFilterChange(): void {
    this.selectedPeriod = 'custom';
    this.page.next(1);
    this.LoadDevices(1);
  }

  public setPeriod(period: string): void {
    this.selectedPeriod = period;
    const now = moment();
    
    switch(period) {
        case 'day':
            this.dateFrom = now.format('YYYY-MM-DD');
            this.dateTo = now.format('YYYY-MM-DD');
            break;
        case 'week':
            this.dateFrom = now.clone().startOf('isoWeek').format('YYYY-MM-DD');
            this.dateTo = now.clone().endOf('isoWeek').format('YYYY-MM-DD');
            break;
        case 'month':
            this.dateFrom = now.clone().startOf('month').format('YYYY-MM-DD');
            this.dateTo = now.clone().endOf('month').format('YYYY-MM-DD');
            break;
        case 'semester':
            const month = now.month(); // 0 is January
            const year = now.year();
            if (month >= 8 || month === 0) { // Sept - Jan (0)
                this.dateFrom = (month === 0 ? year - 1 : year) + '-09-01';
                this.dateTo = (month === 0 ? year : year + 1) + '-01-31';
            } else { // Feb - Aug
                this.dateFrom = year + '-02-01';
                this.dateTo = year + '-08-31';
            }
            break;
        case 'year':
            const currentYear = now.year();
            const currentMonth = now.month();
            // School year starts on Sept 1st
            if (currentMonth >= 8) {
                this.dateFrom = currentYear + '-09-01';
                this.dateTo = (currentYear + 1) + '-08-31';
            } else {
                this.dateFrom = (currentYear - 1) + '-09-01';
                this.dateTo = currentYear + '-08-31';
            }
            break;
        case '30days':
            this.dateFrom = '';
            this.dateTo = '';
            break;
    }

    this.page.next(1);
    this.LoadDevices(1);
  }

  public LoadDevices(page: number): void {
    let url = Config.API_URL + '/v1/login_history?limit=10&offset=' + (page - 1) * 10;
    if (this.dateFrom) url += '&dateFrom=' + this.dateFrom;
    if (this.dateTo) url += '&dateTo=' + this.dateTo;

    this.http.get<{data: any[], count: number, validLogins: number,failedLogins:number}>(
      url,
      { withCredentials: true })
      .subscribe(async(dataRaw) => {
      if (!dataRaw.data) return;
      let data: any[] = [];
      this.metadata.rows = dataRaw.count;
      this.metadata.validLogins = dataRaw.validLogins;
      this.metadata.failedLogins = dataRaw.failedLogins;
      this.history.next(dataRaw.data);
    });
  }

  public getSuccessfulLogins(): number {
    return this.metadata.validLogins;
  }

  public getFailedLogins(): number {
    return this.metadata.failedLogins;
  }
  public getSelectedLogin(): any {
    if (!this.selected_id) return null;
    // ensure type compatibility (string vs number)
    return this.history.getValue().find(item => item.login_id == this.selected_id);
  }

  public closeDetail(): void {

  }
}
