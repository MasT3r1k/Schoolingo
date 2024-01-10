import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@Components/Toast';

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class AbsenceComponent {
  constructor(
    public toast: ToastService
  ) {}

  

}
