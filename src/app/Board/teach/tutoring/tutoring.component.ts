import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/Locale';

@Component({
  selector: 'app-tutoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutoring.component.html',
  styleUrl: './tutoring.component.css'
})
export class TutoringComponent {
  constructor(
    public locale: Locale
  ) {}
}
