import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';

@Component({
  templateUrl: './substitution.component.html',
  styleUrls: ['./substitution.component.css', '../../board.css']
})
export class SubstitutionComponent {
  constructor(
    public locale: Locale
  ) {}
}
