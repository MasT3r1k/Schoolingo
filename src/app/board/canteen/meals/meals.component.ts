import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { Config } from '../../../infrastructure/config';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Authentication } from '../../../infrastructure/authentication';

// Import Dropdown and Tabs
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { TabsComponent } from '@Components/Tabs';

// Import modals
import { CanteenMealModalComponent } from './modals/meal-modal.component';
import { CanteenAssignModalComponent } from './modals/assign-modal/assign-modal.component';
import { CanteenGenerateModalComponent } from './modals/generate-modal.component';
import { CanteenDeleteMealModalComponent } from './modals/delete-meal-modal.component';
import { CanteenRemoveAssignModalComponent } from './modals/remove-assign-modal.component';
import { MoneyPipe } from "../../../pipes/money/money.pipe";

interface Meal {
  meal_id: number;
  name: string;
  category: 'meat' | 'veg' | 'sweet' | 'other';
  price: string | number;
  calories: number | null;
  allergens: string | null;
}

@Component({
  selector: 'app-canteen-meals',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent, TabsComponent, MoneyPipe],
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css']
})
export class MealsComponent implements OnInit {
  title = 'Jídla a týdenní menu';
  subtitle = 'Katalog jídel a jejich přiřazení do jídelníčku.';

  // Expose Math for template usage (progress bar calculation)
  Math = Math;
  // Default weekly kcal target used in progress bar (matches generator default)
  genForm_kcal = 3500;

  http = inject(HttpClient);
  modalManager = inject(ModalManager);
  l = inject(Locale);
  
  // Data lists
  meals: Meal[] = [];
  filteredMeals: Meal[] = [];
  
  // Filters
  searchQuery = '';
  filter = 'all'; // all, meat, veg, sweet, other
  
  // Week Selection
  weekOptions: { label: string, value: string }[] = [];
  selectedWeekStart = '';
  public tabValue = new BehaviorSubject<number>(0);
  
  // Menu Grid Data
  weekDays: { label: string, date: string, nameCz: string }[] = [];
  menuGrid: { 
    variant: number; 
    days: { 
      date: string; 
      menu_id: number | null; 
      meal_id: number | null; 
      name: string | null; 
      price: string | number | null;
      calories: number | null;
    }[];
  }[] = [];

  router = inject(Router);
  auth = inject(Authentication);

  ngOnInit() {
    const user = this.auth.getUser();
    if (user && user.role === 'student') {
      this.router.navigate(['/canteen/orders']);
      return;
    }

    this.generateWeeks();
    this.loadMeals();
    this.loadMenu();

    this.tabValue.subscribe((index) => {
      const filters = ['all', 'meat', 'veg', 'sweet'];
      if (filters[index] !== this.filter) {
        this.setFilter(filters[index]);
      }
    });

    this.modalManager.addModal('canteen-meal-modal', {
      title: 'canteen.canteen_meal_modal_title',
      icon: 'soup',
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: CanteenMealModalComponent }
      ]
    });

    this.modalManager.addModal('canteen-assign-modal', {
      title: 'canteen.canteen_assign_modal_title',
      icon: 'calendar-event',
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: CanteenAssignModalComponent }
      ]
    });

    this.modalManager.addModal('canteen-generate-modal', {
      title: 'canteen.canteen_generate_modal_title',
      icon: 'wand',
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: CanteenGenerateModalComponent }
      ]
    });

    this.modalManager.addModal('canteen-delete-meal-modal', {
      title: 'canteen.canteen_delete_meal_modal_title',
      icon: 'trash',
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: CanteenDeleteMealModalComponent }
      ]
    });

    this.modalManager.addModal('canteen-remove-assign-modal', {
      title: 'canteen.canteen_remove_assign_modal_title',
      icon: 'calendar-minus',
      width: 460,
      closeable: true,
      items: [
        { type: 'component', component: CanteenRemoveAssignModalComponent }
      ]
    });
  }

  generateWeeks() {
    const today = moment();
    const currentMonday = today.clone().startOf('isoWeek');
    
    this.weekOptions = [];
    for (let i = 0; i < 6; i++) {
      const mon = currentMonday.clone().add(i, 'weeks');
      const fri = mon.clone().add(4, 'days');
      
      const label = `${this.l.s('time.week')} ${mon.isoWeek()} (${mon.format('D.M.')}–${fri.format('D.M.')})`;
      this.weekOptions.push({
        label,
        value: mon.format('YYYY-MM-DD')
      });
    }
    
    this.selectedWeekStart = this.weekOptions[0].value;
    this.updateWeekDays();
  }

  updateWeekDays() {
    const start = moment(this.selectedWeekStart);
    
    this.weekDays = [];
    for (let i = 1; i < 6; i++) {
      const d = start.clone().add(i - 1, 'days');
      this.weekDays.push({
        label: `${this.l.s('short_days.' + i)} ${d.format('D.M.')}`,
        date: d.format('YYYY-MM-DD'),
        nameCz: this.l.s('days.' + i)
      });
    }
  }

  onWeekChange() {
    this.updateWeekDays();
    this.loadMenu();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MEALS API CALLS
  // ═══════════════════════════════════════════════════════════════════════

  loadMeals() {
    this.http.get<Meal[]>(`${Config.API_URL}/v1/canteen/meals`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.meals = data || [];
          this.applyFilters();
        },
        error: (err) => console.error('Chyba při načítání jídel', err)
      });
  }

  applyFilters() {
    this.filteredMeals = this.meals.filter(meal => {
      const matchesSearch = !this.searchQuery || meal.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCat = this.filter === 'all' || meal.category === this.filter;
      return matchesSearch && matchesCat;
    });
  }

  setFilter(f: string) {
    this.filter = f;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MENU API CALLS
  // ═══════════════════════════════════════════════════════════════════════

  loadMenu() {
    const end_date = moment(this.selectedWeekStart).add(4, 'days').format('YYYY-MM-DD');
    
    this.menuGrid = [
      { variant: 1, days: [] },
      { variant: 2, days: [] }
    ];

    for (const wd of this.weekDays) {
      this.menuGrid[0].days.push({ date: wd.date, menu_id: null, meal_id: null, name: null, price: null, calories: null });
      this.menuGrid[1].days.push({ date: wd.date, menu_id: null, meal_id: null, name: null, price: null, calories: null });
    }

    this.http.get<{ menu: any[] }>(`${Config.API_URL}/v1/canteen/menu?start_date=${this.selectedWeekStart}&end_date=${end_date}`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res && res.menu) {
            for (const item of res.menu) {
              const itemDate = moment(item.date).format('YYYY-MM-DD');
              const varIndex = item.variant_index;
              const gridRow = this.menuGrid.find(row => row.variant === varIndex);
              if (gridRow) {
                const gridDay = gridRow.days.find(day => day.date === itemDate);
                if (gridDay) {
                  gridDay.menu_id = item.menu_id;
                  gridDay.meal_id = item.meal_id;
                  gridDay.name = item.name;
                  gridDay.price = item.price;
                  gridDay.calories = item.calories;
                }
              }
            }
          }
        },
        error: (err) => console.error('Chyba při načítání jídelníčku', err)
      });
  }

  getVariantKcalSum(variant: number): number {
    const row = this.menuGrid.find(r => r.variant === variant);
    if (!row) return 0;
    return row.days.reduce((sum, d) => sum + (d.calories || 0), 0);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MEALS ACTIONS (CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  openAddMeal() {
    this.modalManager.openModal('canteen-meal-modal', {
      meal: null,
      refreshCallback: () => this.loadMeals()
    });
  }

  openEditMeal(meal: Meal, event: Event) {
    event.stopPropagation();
    this.modalManager.openModal('canteen-meal-modal', {
      meal,
      refreshCallback: () => {
        this.loadMeals();
        this.loadMenu();
      }
    });
  }

  deleteMeal(meal: Meal, event: Event) {
    event.stopPropagation();
    this.modalManager.openModal('canteen-delete-meal-modal', {
      meal,
      refreshCallback: () => {
        this.loadMeals();
        this.loadMenu();
      }
    });
  }

  getCategoryLabel(cat: string): string {
    switch(cat) {
      case 'meat': return this.l.s('canteen.category_meat');
      case 'veg': return this.l.s('canteen.category_veg');
      case 'sweet': return this.l.s('canteen.category_sweet');
      default: return this.l.s('canteen.category_other');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MENU ASSIGNMENT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  openAssignMenu(date: string, variant: number, currentMealId: number | null) {
    this.modalManager.openModal('canteen-assign-modal', {
      date,
      variant_index: variant,
      meal_id: currentMealId,
      meals: this.meals,
      refreshCallback: () => this.loadMenu()
    });
  }

  removeAssignMenu(date: string, variant: number, event: Event) {
    event.stopPropagation();

    // Find meal name for the modal display
    const row = this.menuGrid.find(r => r.variant === variant);
    const day = row?.days.find(d => d.date === date);

    this.modalManager.openModal('canteen-remove-assign-modal', {
      date,
      variant,
      mealName: day?.name || '',
      refreshCallback: () => this.loadMenu()
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // AUTOMATIC MENU GENERATOR
  // ═══════════════════════════════════════════════════════════════════════

  openGenerator() {
    this.modalManager.openModal('canteen-generate-modal', {
      startDate: this.selectedWeekStart,
      refreshCallback: () => this.loadMenu()
    });
  }
}
