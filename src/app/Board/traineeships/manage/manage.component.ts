import { Component } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css', '../../board.css', '../../../input.css']
})
export class ManageComponent {
  constructor(
    public locale: Locale
  ) {}
}
