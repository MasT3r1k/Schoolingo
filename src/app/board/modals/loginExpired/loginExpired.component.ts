import { Component, OnInit } from '@angular/core';
import { IconsModule } from '../../../Modules/Icons.module';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { AppConfig } from '@Schoolingo/App';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  standalone: true,
  imports: [IconsModule, NgStyle, NgClass],
  templateUrl: './loginExpired.component.html',
  styleUrls: ['./loginExpired.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})
export class LoginExpiredComponent implements OnInit {
  Utils = Utils;
  interval!: NodeJS.Timeout;

  public time = AppConfig.WARN_BEFORE_LOGOUT_MINUTES * 60;
  public logoutTime = '';
  public logoutPercents = 100;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.time = this.schoolingo.logoutTime.diff(Utils.getNow(), 'seconds');
      if (this.time <= 0) {
        this.schoolingo.isLoginExpired = true;
        clearInterval(this.interval);
        return;
      }
      this.logoutPercents = (this.time / (AppConfig.WARN_BEFORE_LOGOUT_MINUTES * 60)) * 100;
      let minutes = Math.floor(this.time / 60);
      let seconds = this.time % 60;
      this.logoutTime = `${minutes}:${Utils.addZeros(seconds, 2)}`;
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  public refreshToken(): void {
    if (this.time <= 3) return;
    this.schoolingo.socketService.emit('tokens:refreshToken')
  }
}
