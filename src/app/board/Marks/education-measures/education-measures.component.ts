import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './education-measures.component.html',
  styleUrls: ['./education-measures.component.css', '../../../Styles/card.css']
})
export class EducationMeasuresComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
