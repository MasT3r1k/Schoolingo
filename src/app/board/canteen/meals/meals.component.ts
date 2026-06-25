import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-canteen-meals',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css']
})
export class MealsComponent {
  title = 'Jídla a týdenní menu';
  subtitle = 'Katalog jídel a jejich přiřazení do jídelníčku.';
  
  filter = 'all';

  meals = [
    { id: 1, name: 'Svíčková na smetaně, houskový knedlík', cat: 'Masité', kcal: 640, price: 89, tags: ['Lepek', 'Mléko'] },
    { id: 2, name: 'Kuřecí řízek, bramborová kaše', cat: 'Masité', kcal: 710, price: 79, tags: ['Lepek', 'Vejce'] },
    { id: 3, name: 'Zeleninové rizoto s parmazánem', cat: 'Vegetariánské', kcal: 520, price: 69, tags: ['Mléko', 'Celer'] },
    { id: 4, name: 'Palačinky s tvarohem a ovocem', cat: 'Sladké', kcal: 450, price: 62, tags: ['Lepek', 'Mléko', 'Vejce'] }
  ];

  setFilter(f: string) {
    this.filter = f;
  }
}
