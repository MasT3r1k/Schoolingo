import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-canteen-orders',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  // Hardcoded fake data based on HTML mock
  weekName = 'Týden 27 · 30. 6. – 4. 7. 2026';
  
  days = [
    {
      code: 'Po', name: 'Pondělí', date: '30. 6.',
      options: [
        { id: 1, label: 'Svíčková na smetaně, houskový knedlík', num: 'Oběd 1', price: 89, kcal: 640, tags: ['Lepek', 'Mléko'] },
        { id: 2, label: 'Kuřecí řízek, bramborová kaše', num: 'Oběd 2', price: 79, kcal: 710, tags: ['Lepek', 'Vejce'] },
        { id: 3, label: 'Zeleninové rizoto s parmazánem', num: 'Oběd 3 · vege', price: 69, kcal: 520, tags: ['Mléko', 'Celer'] }
      ]
    },
    {
      code: 'Út', name: 'Úterý', date: '1. 7.',
      options: [
        { id: 4, label: 'Špagety boloňské, parmazán', num: 'Oběd 1', price: 79, kcal: 680, tags: ['Lepek', 'Mléko'] },
        { id: 5, label: 'Hovězí guláš, houskový knedlík', num: 'Oběd 2', price: 85, kcal: 750, tags: ['Lepek'] },
        { id: 6, label: 'Čočka na kyselo, vejce, chléb', num: 'Oběd 3 · vege', price: 65, kcal: 480, tags: ['Lepek', 'Vejce'] }
      ]
    },
    {
      code: 'St', name: 'Středa', date: '2. 7.',
      options: [
        { id: 7, label: 'Rybí filé, vařené brambory, tatarka', num: 'Oběd 1', price: 82, kcal: 590, tags: ['Ryby', 'Vejce'] },
        { id: 8, label: 'Zapečené brambory se zelím a klobásou', num: 'Oběd 2', price: 79, kcal: 670, tags: ['Mléko'] },
        { id: 9, label: 'Houbový guláš, knedlík', num: 'Oběd 3 · vege', price: 69, kcal: 540, tags: ['Lepek'] }
      ]
    },
    {
      code: 'Čt', name: 'Čtvrtek', date: '3. 7.',
      options: [
        { id: 10, label: 'Kuřecí nudličky na kari s rýží', num: 'Oběd 1', price: 75, kcal: 620, tags: ['Sója'] },
        { id: 11, label: 'Vepřová pečeně, zelí, knedlík', num: 'Oběd 2', price: 85, kcal: 730, tags: ['Lepek'] },
        { id: 12, label: 'Palačinky s tvarohem a ovocem', num: 'Oběd 3 · sladký', price: 62, kcal: 450, tags: ['Lepek', 'Mléko', 'Vejce'] }
      ]
    },
    {
      code: 'Pá', name: 'Pátek', date: '4. 7.',
      options: [
        { id: 13, label: 'Smažený sýr, brambory, tatarka', num: 'Oběd 1', price: 79, kcal: 700, tags: ['Lepek', 'Mléko', 'Vejce'] },
        { id: 14, label: 'Kuřecí steak, grilovaná zelenina', num: 'Oběd 2', price: 89, kcal: 560, tags: [] },
        { id: 15, label: 'Zelný salát s tofu a quinoou', num: 'Oběd 3 · vege', price: 59, kcal: 390, tags: ['Sója'] }
      ]
    }
  ];

  selections: { [day: string]: any } = {
    'Po': this.days[0].options[0], // Svíčková
    'Út': this.days[1].options[1], // Guláš
    'St': null, // Bez oběda
    'Čt': this.days[3].options[0], // Kari
    'Pá': this.days[4].options[1]  // Steak
  };

  title = 'Objednávky';
  subtitle = 'Výběr obědů na následující týden';

  submitting = false;
  submitSuccess = false;

  ngOnInit() {}

  selectOption(dayCode: string, option: any) {
    this.selections[dayCode] = option;
  }

  get summary() {
    let total = 0;
    const items = this.days.map(d => {
      const sel = this.selections[d.code];
      if (sel) {
        total += sel.price;
        return { day: d.code, name: sel.label, price: sel.price, none: false };
      } else {
        return { day: d.code, name: 'Bez oběda', price: 0, none: true };
      }
    });
    return { items, total };
  }

  submitOrder() {
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.submitSuccess = true;
      setTimeout(() => this.submitSuccess = false, 3000);
    }, 1500);
  }
}
