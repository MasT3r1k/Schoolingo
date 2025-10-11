import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { DiaryWeek } from '@Schoolingo/Traineeship';
import { Utils } from '@Schoolingo/Utils';

@Component({
  standalone: true,
  imports: [NgClass],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class ManageComponent {
  public schoolingo = inject(Schoolingo);
  public Utils = Utils;
  constructor() {}

  public selectWeek(week: DiaryWeek | null): void {
    this.schoolingo.traineeship.selectDairy(week);
  }

}
