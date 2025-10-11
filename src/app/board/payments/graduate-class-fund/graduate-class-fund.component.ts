import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  selector: 'app-graduate-class-fund',
  standalone: true,
  imports: [],
  templateUrl: './graduate-class-fund.component.html',
  styleUrls: ['./graduate-class-fund.component.css', '../../../Styles/card.css']
})
export class GraduateClassFundComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
