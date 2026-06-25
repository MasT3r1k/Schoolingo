import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-canteen-history',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  title = 'Historie plateb';
  subtitle = 'Platby za obědy a refundace za zrušené / nevyzvednuté obědy.';

  history = [
    { date: '24. 6. 2026', desc: 'Oběd — St 25. 6. · Zapečené brambory se zelím', type: 'payment', amount: '-79 Kč', status: 'paid', doc: true },
    { date: '21. 6. 2026', desc: 'Refundace — Pá 19. 6. · oběd nevyzvednut', type: 'refund', amount: '+85 Kč', status: 'refunded', doc: true },
    { date: '17. 6. 2026', desc: 'Dobití kreditu — bankovní převod', type: 'payment', amount: '+1 000 Kč', status: 'paid', doc: true },
    { date: '14. 6. 2026', desc: 'Oběd — Po 16. 6. · Svíčková na smetaně', type: 'payment', amount: '-89 Kč', status: 'pending', doc: false },
    { date: '10. 6. 2026', desc: 'Refundace — zrušená objednávka (nemoc)', type: 'refund', amount: '+73 Kč', status: 'rejected', doc: true }
  ];
}
