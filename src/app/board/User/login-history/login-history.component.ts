import { Component, inject, OnInit } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { DatalistComponent, DatalistMetadata } from "../../../components/datalist/index";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';

@Component({
  imports: [DatalistComponent],
  templateUrl: './login-history.component.html',
  styleUrl: './login-history.component.css'
})
export class LoginHistoryComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private declare datalist;

  public metadata: DatalistMetadata = {
    rows: 0,
    limit: 15
  };

  public tableHead = [
    'login_history.table.type',
    'login_history.table.browser',
    'login_history.table.system',
    'login_history.table.created',
    'login_history.table.state',
    'actions'
  ];
  public history = new BehaviorSubject<any[]>([]);

  public subscribeDatalist(datalist: DatalistComponent): void {
    this.datalist = datalist;

    this.datalist.page
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.http.get<{data: any[], count: number}>(Config.API_URL + '/v1/login_history?limit=' + this.metadata.limit + '&offset=' + ((this.datalist.page.getValue() - 1) * this.metadata.limit), { withCredentials: true }).subscribe(async(dataRaw) => {
        if (!dataRaw.data) return;
        let data: any[] = [];
        await dataRaw.data.forEach((raw) => {
          data.push([
            { value: 'login_history.types.' + raw.type, isLocale: true },
            { value: Utils.getBrowser(raw.userAgent), isLocale: false },
            { value: Utils.getOS(raw.userAgent), isLocale: false },
            { value: moment(raw.created).format('HH:mm:ss DD. MM. YYYY'), isLocale: false },
            { html: raw.success ? '<div class="badge text primary"><span style="width:100%;text-align:center;">' + this.l.s('login_history.state.success') + '</span></badge>' : '<div class="badge text danger"><span style="width:100%;text-align:center;">' + this.l.s('login_history.state.' + (raw.error ? raw.error : 'error')) + '</span></badge>', isLocale: false },
            { html: '<div class="btn small disabled">' + this.l.s('login_history.buttons.details') + '</div>', isLocale: false }
          ])
        });
        this.metadata.rows = dataRaw.count;
        this.history.next(data);
      });
    })
  }

  ngOnInit(): void {
  }
}
