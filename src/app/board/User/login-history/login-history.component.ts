// import { Component, OnInit } from '@angular/core';
// import { Data, dataAPI, DatalistComponent, Metadata } from '@Components/Datalist/Datalist';
// import { Schoolingo } from '@Schoolingo';
// import { Utils } from '@Schoolingo/Utils';
// import moment from 'moment';
// import { BehaviorSubject } from 'rxjs';

// @Component({
//   standalone: true,
//   imports: [DatalistComponent],
//   templateUrl: './login-history.component.html',
//   styleUrls: ['./login-history.component.css', '../../../Styles/card.css']
// })
// export class LoginHistoryComponent implements OnInit {
//   public history = new BehaviorSubject<Data[][] | any>([]);
//   public metadata: Metadata = { rows: 0 };

//   constructor(
//     public schoolingo: Schoolingo
//   ) {}

//   ngOnInit(): void {
//     this.schoolingo.socketService.addFunction("users:loginHistory").subscribe((data: dataAPI | any) => {
//       let historyList: Data[][] = []
//       this.metadata.rows = data.rows;
//       data.data.forEach((login: any) => {
//         historyList.push([
//           { value: login.attempt || "roles/unknown", isLocale: login.attempt ? false : true },
//           { value: login.success || "roles/unknown", isLocale: login.success ? false : true },
//           { value: login.ip || "roles/unknown", isLocale: login.ip ? false : true },
//           { value: moment(login.created).format('DD. MM. YYYY - HH:mm:ss'), isLocale: false },
//           { value: Utils.getOS(login.userAgent).toUpperCase(), isLocale: false },
//           { value: Utils.getBrowser(login.userAgent).toUpperCase(), isLocale: false }

//         ])
//       })
//       this.history.next(historyList);
//     });
//   }
// }

import { Component, inject, OnInit, Sanitizer } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';
import { DatalistComponent, Metadata } from "@Components/Datalist/Datalist";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { Config } from '@Schoolingo/Config';
import { Utils } from '@Schoolingo/Utils';
import moment from 'moment';
import { IconsModule } from '../../../Modules/Icons.module';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [DatalistComponent, IconsModule],
  templateUrl: './login-history.component.html',
  styleUrls: [
    './login-history.component.css',
    '../../../Styles/card.css'
  ]
})
export class LoginHistoryComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public schoolingo = inject(Schoolingo);
  private declare datalist;
  public page = 0;

  public metadata: Metadata = {
    rows: 0,
    limit: 15
  };

  public tableHead = [
    'login_history/table/type',
    'login_history/table/browser',
    'login_history/table/system',
    'login_history/table/created',
    'login_history/table/state',
    'actions'
  ];
  public history = new BehaviorSubject<any[]>([]);

  public subscribeDatalist(datalist: DatalistComponent): void {
    this.datalist = datalist;
    console.log(datalist)

    this.datalist.page
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.http.get<{data: any[], count: number}>(Config.API_URL + 'v1/login_history?limit=' + this.metadata.limit + '&offset=' + ((this.datalist.page.getValue() - 1) * (this.metadata.limit || 15)), { withCredentials: true }).subscribe(async(dataRaw) => {
        if (!dataRaw.data) return;
        let data: any[] = [];
        await dataRaw.data.forEach((raw) => {
          let browser = Utils.getBrowser(raw.userAgent);
          if (Utils.getBrowserIcon(raw.userAgent) !== '') {
            browser = '<img height="24" width="24" class="table-icon" src="/assets/browsers/' + Utils.getBrowserIcon(raw.userAgent) + '" alt="" /> ' + browser;
          }

          let actionButton = '<div class="btn small gray disabled">' + this.l.getLocale('login_history/buttons/details') + '</div>';
          if (false) { // TODO: Implement details button
            actionButton = '<div class="btn small justify-content-space-between" onclick="alert(\'Not implemented yet\')">' + this.l.getLocale('login_history/buttons/details') + '<div class="icon-arrow-right"></div></div>';
          }

          data.push([
            { html: '<div class="row"><div class="' + Utils.getLoginTypeIcon(raw.type) + '"></div> ' + this.l.getLocale('login_history/types/' + raw.type) + '</div>', isLocale: false },
            { html: browser, isLocale: false },
            { value: Utils.getOS(raw.userAgent), isLocale: false },
            { value: moment(raw.created).format('HH:mm:ss DD. MM. YYYY'), isLocale: false },
            { html: raw.success ? '<div class="badge text primary"><span style="width:100%;text-align:center;">' + this.l.getLocale('login_history/state/success') + '</span></badge>' : '<div class="badge text danger"><span style="width:100%;text-align:center;">' + this.l.getLocale('login_history/state/' + (raw.error ? raw.error : 'error')) + '</span></badge>', isLocale: false },
            { html: actionButton, isLocale: false }
          ])
        });
        this.metadata.rows = dataRaw.count;
        this.history.next(data);
      });
    })
  }

  ngOnInit(): void {
    // console.log('AAAA');
    // this.http
    // .get<{data: any[], count: number}>(Config.API_URL + 'v1/login_history?limit=' + this.metadata.limit + '&offset=' + ((this.page) * (this.metadata.limit || 15)), { withCredentials: true })
    // .subscribe(async(dataRaw) => {
    // console.log(dataRaw);
    //     if (!dataRaw.data) return;
    //     let data: any[] = [];
    //     await dataRaw.data.forEach((raw) => {
    //       let browser = Utils.getBrowser(raw.userAgent);
    //       if (Utils.getBrowserIcon(raw.userAgent) !== '') {
    //         browser = '<img height="24" width="24" class="table-icon" src="/assets/browsers/' + Utils.getBrowserIcon(raw.userAgent) + '" alt="" /> ' + browser;
    //       }

    //       let actionButton = '<div class="btn small gray disabled">' + this.l.getLocale('login_history/buttons/details') + '</div>';
    //       if (true) { // TODO: Implement details button
    //         actionButton = '<div class="btn small justify-content-space-between" onclick="alert(\'Not implemented yet\')">' + this.l.getLocale('login_history/buttons/details') + '<div class="icon-arrow-right"></div></div>';
    //       }

    //       data.push([
    //         { html: '<div class="row"><div class="' + Utils.getLoginTypeIcon(raw.type) + '"></div> ' + this.l.getLocale('login_history/types/' + raw.type) + '</div>', isLocale: false },
    //         { html: browser, isLocale: false },
    //         { value: Utils.getOS(raw.userAgent), isLocale: false },
    //         { value: moment(raw.created).format('HH:mm:ss DD. MM. YYYY'), isLocale: false },
    //         { html: raw.success ? '<div class="badge text primary"><span style="width:100%;text-align:center;">' + this.l.getLocale('login_history/state/success') + '</span></badge>' : '<div class="badge text danger"><span style="width:100%;text-align:center;">' + this.l.getLocale('login_history/state/' + (raw.error ? raw.error : 'error')) + '</span></badge>', isLocale: false },
    //         { html: actionButton, isLocale: false }
    //       ])
    //     });
    //     this.metadata.rows = dataRaw.count;
    //     this.history.next(data);
    //   });
  }
}
