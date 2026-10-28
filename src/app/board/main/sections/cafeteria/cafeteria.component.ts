import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';
import { ModalManager } from '@Schoolingo/modal';
import { BoardAlertManager } from '../../../../infrastructure/alert/board.alert.manager';
import { CafeteriaOrderModalComponent } from './modals/cafeteria-order-modal/cafeteria-order-modal.component';
import { EmptyStateComponent } from '@Components/empty-state/empty-state.component';

@Component({
  selector: 'app-cafeteria',
  standalone: true,
  imports: [IconsModule, EmptyStateComponent],
  templateUrl: './cafeteria.component.html',
  styleUrl: './cafeteria.component.css'
})
export class CafeteriaComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  private alertManager = inject(BoardAlertManager);
  public menu: any[] = [];
  public rawMenuItems: any[] = [];
  public rawOrders: any[] = [];
  public balance: number = 0;
  public accountId: number | number[] = [];
  public isLoading = true;

  public weekStart = moment().startOf('isoWeek');
  public selectedDate = moment();

  ngOnInit(): void {
    if (this.selectedDate.isoWeekday() > 5) {
      this.selectedDate = this.weekStart.clone();
    }

    this.modalManager.addModal('cafeteria-order-modal', {
      title: 'Objednat jídlo',
      icon: 'tools-kitchen-2',
      width: 450,
      closeable: true,
      items: [
        { type: 'component', component: CafeteriaOrderModalComponent }
      ]
    });
    this.loadMenu();
  }

  public loadMenu(): void {
    const startDate = this.weekStart.format('YYYY-MM-DD');
    const endDate = this.weekStart.clone().add(4, 'days').format('YYYY-MM-DD');
    
    this.http.get<any>(`${Config.API_URL}/v1/canteen/credit`, { withCredentials: true }).subscribe({
      next: (creditData) => {
        this.balance = creditData.credit;
        this.accountId = creditData.account_id;
        
        this.http.get<any>(
          `${Config.API_URL}/v1/canteen/menu?start_date=${startDate}&end_date=${endDate}`,
          { withCredentials: true }
        ).subscribe({
          next: (data) => {
            this.rawMenuItems = data.menu || [];
            this.rawOrders = data.orders || [];

            // If selected date has no meals, but week has meals, select first available date
            if (this.rawMenuItems.length > 0) {
              const currentSelectedStr = this.selectedDate.format('YYYY-MM-DD');
              const hasMealsOnSelected = this.rawMenuItems.some((m: any) => moment(m.date).format('YYYY-MM-DD') === currentSelectedStr);
              if (!hasMealsOnSelected) {
                const first = this.rawMenuItems[0];
                if (first && first.date) {
                  this.selectedDate = moment(first.date);
                }
              }
            }
            
            const processedMenu = [];
            for (let i = 0; i < 5; i++) {
                const dayMoment = this.weekStart.clone().add(i, 'days');
                const dateStr = dayMoment.format('YYYY-MM-DD');
                const canModify = dayMoment.isAfter(moment(), 'day');
                const dayMeals = this.rawMenuItems.filter((m: any) => moment(m.date).format('YYYY-MM-DD') === dateStr);
                
                if (dayMeals.length === 0) continue;
                
                const orderedMealForDay = dayMeals.find((m: any) => 
                    this.rawOrders.some((o: any) => o.menu_id === m.menu_id)
                );
                
                if (orderedMealForDay) {
                    processedMenu.push({
                        date: orderedMealForDay.date,
                        meal_id: orderedMealForDay.menu_id,
                        meal_name: orderedMealForDay.name,
                        allergens: orderedMealForDay.allergens,
                        ordered: true,
                        available: canModify,
                        dayMeals: dayMeals
                    });
                } else {
                    const firstMeal = dayMeals[0];
                    processedMenu.push({
                        date: firstMeal.date,
                        meal_name: this.l.s('canteen.not_selected', { count: dayMeals.length }) || `Nevybráno (k dispozici ${dayMeals.length} jídel)`,
                        allergens: '',
                        ordered: false,
                        available: canModify,
                        dayMeals: dayMeals
                    });
                }
            }
            
            this.menu = processedMenu;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public getDayMeals(): any[] {
    const dateStr = this.selectedDate.format('YYYY-MM-DD');
    const dayMeals = this.rawMenuItems.filter((m: any) => moment(m.date).format('YYYY-MM-DD') === dateStr);
    const canModify = this.selectedDate.isAfter(moment(), 'day');

    return dayMeals.map((meal: any, index: number) => {
      const isOrdered = this.rawOrders.some((o: any) => o.menu_id === meal.menu_id);
      return {
        ...meal,
        ordered: isOrdered,
        available: canModify,
        label: isOrdered 
          ? `Objednáno (Oběd ${index + 1})` 
          : (index === 0 ? 'Oběd 1' : `Alternativa (Oběd ${index + 1})`)
      };
    });
  }

  public onMealClick(meal: any): void {
    if (!meal.available) return;
    const dateStr = this.selectedDate.format('YYYY-MM-DD');
    const dayMeals = this.rawMenuItems.filter((m: any) => moment(m.date).format('YYYY-MM-DD') === dateStr);

    this.modalManager.openModal('cafeteria-order-modal', {
      meals: dayMeals,
      selectedMealId: meal.ordered ? null : meal.menu_id,
      onConfirm: (mealId: number | null) => {
        this.saveOrder(meal.date, mealId);
      }
    });
  }

  public prevDay(): void {
    let d = this.selectedDate.clone().subtract(1, 'day');
    if (d.isoWeekday() === 7) d.subtract(2, 'days');
    if (d.isoWeekday() === 6) d.subtract(1, 'day');
    this.selectedDate = d;
    this.checkAndReloadWeek();
  }

  public nextDay(): void {
    let d = this.selectedDate.clone().add(1, 'day');
    if (d.isoWeekday() === 6) d.add(2, 'days');
    if (d.isoWeekday() === 7) d.add(1, 'day');
    this.selectedDate = d;
    this.checkAndReloadWeek();
  }

  private checkAndReloadWeek(): void {
    if (this.selectedDate.isoWeek() !== this.weekStart.isoWeek()) {
      this.weekStart = this.selectedDate.clone().startOf('isoWeek');
      this.isLoading = true;
      this.loadMenu();
    }
  }

  public getSelectedDateFormatted(): string {
    const d = this.selectedDate;
    const now = moment();
    if (d.isSame(now, 'day')) {
      return `Dnes (${d.format('D. M.')})`;
    }
    if (d.isSame(now.clone().add(1, 'day'), 'day')) {
      return `Zítra (${d.format('D. M.')})`;
    }
    return `${this.l.s('days.' + d.day())}, ${d.format('D. M.')}`;
  }

  public formatDate(date: string | Date): string {
    if (!date) return '';
    const d = moment(date);
    const now = moment();
    
    if (d.isSame(moment().subtract(1, 'day'), 'day')) return this.l.s('substitution.yesterday');
    if (d.isSame(now, 'day')) return this.l.s('substitution.today');
    if (d.isSame(moment().add(1, 'day'), 'day')) return this.l.s('substitution.tomorrow');
    return `${this.l.s('short_days.' + d.isoWeekday() % 7)} ${d.format('D. M.')}`;
  }

  public getDayName(date: string | Date): string {
    if (!date) return '';
    return moment(date).format('dddd');
  }

  public formatPrice(price: number): string {
    return `${price} Kč`;
  }

  public getOrderStatusClass(item: any): string {
    if (item.ordered) return 'ordered';
    if (item.available) return 'available';
    return 'unavailable';
  }

  public getOrderStatusIcon(item: any): string {
    if (item.ordered) return 'check';
    if (item.available) return 'plus';
    return 'x';
  }

  public openOrderModal(day: any) {
    if (!day.available || !day.dayMeals) return;

    this.modalManager.openModal('cafeteria-order-modal', {
      meals: day.dayMeals,
      selectedMealId: day.meal_id || null,
      onConfirm: (mealId: number | null) => {
        this.saveOrder(day.date, mealId);
      }
    });
  }

  public saveOrder(date: string, mealId: number | null) {
    const payload = {
      selections: [ { date: moment(date).format('YYYY-MM-DD'), menu_id: mealId } ],
      account_id: this.accountId
    };
    
    this.http.post(`${Config.API_URL}/v1/canteen/order`, payload, { withCredentials: true }).subscribe({
      next: () => {
        this.alertManager.alert('success', 'canteen.order_saved');
        this.loadMenu();
      },
      error: () => {
        this.alertManager.alert('error', 'canteen.order_failed');
      }
    });
  }

  public nextWeek() {
    this.weekStart.add(1, 'week');
    this.isLoading = true;
    this.loadMenu();
  }

  public prevWeek() {
    this.weekStart.subtract(1, 'week');
    this.isLoading = true;
    this.loadMenu();
  }
}
