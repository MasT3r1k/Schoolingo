import { Component, inject, OnInit, Sanitizer } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { DatalistComponent, DatalistMetadata } from "@Components/datalist";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  imports: [DatalistComponent, IconsModule],
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
          let browser = Utils.getBrowser(raw.userAgent);
          if (Utils.getBrowserIcon(raw.userAgent) !== '') {
            browser = '<img height="24" width="24" class="table-icon" src="/assets/browsers/' + Utils.getBrowserIcon(raw.userAgent) + '" alt="" /> ' + browser;
          }

          let actionButton = '<div class="btn small disabled">' + this.l.s('login_history.buttons.details') + '</div>';
          if (false) { // TODO: Implement details button
            actionButton = '<div class="btn small justify-content-space-between" onclick="alert(\'Not implemented yet\')">' + this.l.s('login_history.buttons.details') + '<div class="icon-arrow-right"></div></div>';
          }

          data.push([
            { html: '<div class="row"><div class="' + Utils.getLoginTypeIcon(raw.type) + '"></div> ' + this.l.s('login_history.types.' + raw.type) + '</div>', isLocale: false },
            { html: browser, isLocale: false },
            { value: Utils.getOS(raw.userAgent), isLocale: false },
            { value: moment(raw.created).format('HH:mm:ss DD. MM. YYYY'), isLocale: false },
            { html: raw.success ? '<div class="badge text primary"><span style="width:100%;text-align:center;">' + this.l.s('login_history.state.success') + '</span></badge>' : '<div class="badge text danger"><span style="width:100%;text-align:center;">' + this.l.s('login_history.state.' + (raw.error ? raw.error : 'error')) + '</span></badge>', isLocale: false },
            { html: actionButton, isLocale: false }
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
