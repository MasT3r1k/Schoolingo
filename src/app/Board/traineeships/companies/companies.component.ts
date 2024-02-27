import { Component } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css', '../../board.css', '../../../input.css']
})
export class CompaniesComponent {
  constructor(
    public locale: Locale
  ) {}
}
