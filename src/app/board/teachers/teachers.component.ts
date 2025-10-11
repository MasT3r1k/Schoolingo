import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css', '../../Styles/card.css']
})
export class TeachersComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
