import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [],
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css', '../../../Styles/card.css']
})
export class ListingComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
