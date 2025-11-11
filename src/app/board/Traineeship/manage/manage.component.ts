import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';
import { DiaryWeek, Traineeship } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';

@Component({
  standalone: true,
  imports: [NgClass],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent {
  public l = inject(Locale);
  public school = inject(School);
  public traineeship = inject(Traineeship);
  public Utils = Utils;
  constructor() {}

  public selectWeek(week: DiaryWeek | null): void {
    this.traineeship.selectDairy(week);
  }

}
