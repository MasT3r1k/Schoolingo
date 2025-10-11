import { Component } from '@angular/core';
import { DatalistComponent } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [DatalistComponent],
  templateUrl: './class-fund.component.html',
  styleUrls: ['./class-fund.component.css', '../../../Styles/card.css']
})
export class ClassFundComponent {
  public data: BehaviorSubject<[]> = new BehaviorSubject([]);
  
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
