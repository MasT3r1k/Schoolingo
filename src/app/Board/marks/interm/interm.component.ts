import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './interm.component.html',
  styleUrls: ['./interm.component.css', '../../board.css']
})
export class IntermComponent {
  public tabName: string = 'Interm_Tab';

  constructor(
    public schoolingo: Schoolingo,
    public locale: Locale
  ) {}

}
