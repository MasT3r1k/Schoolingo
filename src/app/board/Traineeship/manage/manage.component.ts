import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class ManageComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
