import { Component } from '@angular/core';
import { DatalistComponent } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [DatalistComponent],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css', '../../../Styles/card.css',  '../../../Styles/input.css']
})
export class AccountsComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
