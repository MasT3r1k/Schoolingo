import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css', '../../Styles/card.css']
})
export class DocumentsComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
