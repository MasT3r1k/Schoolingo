import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './substitution.component.html',
  styleUrls: ['./substitution.component.css', '../../../Styles/card.css']
})
export class SubstitutionComponent {

  constructor(
    public schoolingo: Schoolingo
  ) {}

}
