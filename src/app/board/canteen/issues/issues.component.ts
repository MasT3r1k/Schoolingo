import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-canteen-issues',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent {
  title = 'Výdej obědů — dnes';
  subtitle = 'Středa 25. 6. 2026 · výdejní okno 11:30–14:00';

  issuesList = [
    { name: 'Jana Nováková', class: '3.B', meal: 'Oběd 1', status: 'issued' },
    { name: 'Tomáš Beneš', class: '2.A', meal: 'Oběd 2', status: 'waiting' },
    { name: 'Mgr. Petra Horká', class: 'Učitel', meal: 'Oběd 1', status: 'issued' },
    { name: 'Filip Dvořák', class: '4.C', meal: 'Oběd 3', status: 'cancelled' }
  ];

  issueMeal(item: any) {
    if (item.status === 'waiting') {
      item.status = 'issued';
    }
  }
}
