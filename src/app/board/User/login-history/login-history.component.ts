import { Component, OnInit } from '@angular/core';
import { Data, dataAPI, DatalistComponent, Metadata } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [DatalistComponent],
  templateUrl: './login-history.component.html',
  styleUrls: ['./login-history.component.css', '../../../Styles/card.css']
})
export class LoginHistoryComponent implements OnInit {
  public history: BehaviorSubject<Data[][] | any> = new BehaviorSubject([]);
  public metadata: Metadata = { rows: 0 };

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
    this.schoolingo.socketService.addFunction("users:loginHistory").subscribe((data: dataAPI | any) => {
      let historyList: Data[][] = []
      this.metadata.rows = data.rows;
      data.data.forEach((login: any) => {
        historyList.push([
          { value: login.attempt, isLocale: false },
          { value: login.success, isLocale: false },
          { value: login.ip, isLocale: false },
          { value: moment(login.created).format('DD. MM. YYYY - HH:mm:ss'), isLocale: false },
          { value: Utils.getOS(login.userAgent).toUpperCase(), isLocale: false },
          { value: Utils.getBrowser(login.userAgent).toUpperCase(), isLocale: false }

        ])
      })
      this.history.next(historyList);
    });
  }
}
