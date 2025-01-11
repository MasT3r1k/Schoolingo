import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  imports: [],
  standalone: true,
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css', '../../../Styles/card.css']
})
export class VehiclesComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
