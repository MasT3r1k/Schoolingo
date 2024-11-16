import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './midterm.component.html',
  styleUrls: ['./midterm.component.css', '../../../Styles/card.css']
})
export class MidtermComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
