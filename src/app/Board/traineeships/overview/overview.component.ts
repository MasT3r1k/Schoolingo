import { Component } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', '../../board.css', '../../../input.css']
})
export class OverviewComponent {
  constructor(
    public locale: Locale
  ) {}
}
