import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css', '../../../Styles/card.css']
})
export class SubjectsComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
