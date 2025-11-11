import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Locale } from '@Schoolingo/locale';
import { Traineeship } from '@Schoolingo/traineeship';

@Component({
  selector: 'schoolingo-traineeship-writeDairy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './writeDairy.component.html',
  styleUrls: ['./writeDairy.component.css']
})
export class writeDairyComponent {
  public traineeship = inject(Traineeship);
  public l = inject(Locale);
}
