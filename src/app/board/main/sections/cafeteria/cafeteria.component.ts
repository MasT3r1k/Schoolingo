import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import moment from 'moment';
import { ModalManager } from '@Schoolingo/modal';
import { BoardAlertManager } from '../../../../infrastructure/alert/board.alert.manager';
import { CafeteriaOrderModalComponent } from './modals/cafeteria-order-modal/cafeteria-order-modal.component';
import { MoneyPipe } from "../../../../pipes/money/money.pipe";

@Component({
  selector: 'app-cafeteria',
  standalone: true,
  imports: [IconsModule, NgClass, MoneyPipe],
  templateUrl: './cafeteria.component.html',
  styleUrl: './cafeteria.component.css'
})
export class CafeteriaComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  private alertManager = inject(BoardAlertManager);
  public menu: any[] = [];
  public balance: number = 0;
  public accountId: number | number[] = [];
  public isLoading = true;

  ngOnInit(): void {
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

  public weekStart = moment().startOf('isoWeek');

  public loadMenu(): void {
    const startDate = this.weekStart.format('YYYY-MM-DD');
    const endDate = this.weekStart.clone().add(4, 'days').format('YYYY-MM-DD');
    
    // Nejprve získáme kredit
    this.http.get<any>(`${Config.API_URL}/v1/canteen/credit`, { withCredentials: true }).subscribe({
      next: (creditData) => {
        this.balance = creditData.credit;
        this.accountId = creditData.account_id;
        
        // Pak získáme jídla
        this.http.get<any>(
          `${Config.API_URL}/v1/canteen/menu?start_date=${startDate}&end_date=${endDate}`,
          { withCredentials: true }
        ).subscribe({
          next: (data) => {
            const menuItems = data.menu || [];
            const orders = data.orders || [];
            
            const processedMenu = [];
            
            for (let i = 0; i < 5; i++) {
                const dayMoment = this.weekStart.clone().add(i, 'days');
                const dateStr = dayMoment.format('YYYY-MM-DD');
                
                // Můžeme měnit, pokud to není dnes nebo v minulosti
                const canModify = dayMoment.isAfter(moment(), 'day');
                
                const dayMeals = menuItems.filter((m: any) => moment(m.date).format('YYYY-MM-DD') === dateStr);
                
                if (dayMeals.length === 0) continue;
                
                const orderedMealForDay = dayMeals.find((m: any) => 
                    orders.some((o: any) => o.menu_id === m.menu_id)
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

  public formatDate(date: string | Date): string {
    if (!date) return '';
    const d = moment(date);
    const now = moment();
    
    if (d.isSame(moment().subtract(1, 'day'), 'day')) return this.l.s('substitution.yesterday');
    if (d.isSame(now, 'day')) return this.l.s('substitution.today');
    if (d.isSame(moment().add(1, 'day'), 'day')) return this.l.s('substitution.tomorrow');
    return `${this.l.s('short_days.' + d.isoWeekday() % 7)} ${d.format('D. M.')}`
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
        this.loadMenu(); // reload to show the change
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
