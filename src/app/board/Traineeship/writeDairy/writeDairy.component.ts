import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Schoolingo } from '@Schoolingo';

@Component({
  selector: 'schoolingo-traineeship-writeDairy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './writeDairy.component.html',
  styleUrls: ['./writeDairy.component.css', '../../../Styles/card.css']
})
export class writeDairyComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}

}
