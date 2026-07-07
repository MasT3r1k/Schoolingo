import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../../infrastructure/config';
import { MoneyPipe } from "../../../pipes/money/money.pipe";
import { Locale } from '@Schoolingo/locale';
import { Router } from '@angular/router';
import moment from 'moment';
import { Authentication } from '@Schoolingo/authentication';
import { ModalManager } from '@Schoolingo/modal';
import { AllergensModalComponent } from './modals/allergens/allergens-modal.component';
import { PaymentAccountModalComponent } from './modals/payment-account/payment-account-modal.component';

interface CreditAPI {
  credit: number,
  account_id: number | number[]
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, MoneyPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  private user = inject(Authentication)
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  credit: number | null = null;

  public showSaveCard(): boolean {
    return this.hasChanges || this.submitting || this.submitSuccess;
  }

  weekStart = moment(); // moment
  weekName = '';
  days: any[] = [];
  allergens: string[] = [];
  selections: { [day: string]: any } = {};
  initialSelections: { [day: string]: any } = {};
  
  submitting = false;
  submitSuccess = false;
  accountId: number | number[] = [];

  public refreshCredit(): void {
    this.http.get<CreditAPI>(Config.API_URL + '/v1/canteen/credit', { withCredentials: true })
      .subscribe((res: CreditAPI) => {
        this.credit = res.credit;
        this.accountId = res.account_id;
      });
      
  }

  ngOnInit() {
    this.modalManager.addModal('allergens-modal', {
      title: 'canteen.change_allergens',
      icon: 'tools-kitchen-2',
      width: 600,
      closeable: true,
      items: [
        { type: 'component', component: AllergensModalComponent }
      ]
    });

    this.modalManager.addModal('payment-account-modal', {
      title: 'Upravit platební účet',
      icon: 'credit-card',
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: PaymentAccountModalComponent }
      ]
    });

    this.weekStart = moment().startOf('isoWeek');
    this.refreshCredit()

    this.http.get<string[]>(
      Config.API_URL + `/v1/canteen/allergens`,
      { withCredentials: true }
    )
    .subscribe((allergens) => {
      this.allergens = allergens
      this.loadWeek();
    });
  }

  public checkAllergens(allergens: any): boolean {
    if (!allergens) return false
    const optAllergens = allergens.split(',');
    for(let i = 0;i < optAllergens.length;i++) {
      if (this.allergens.includes(optAllergens[i])) {
        return true
      }
    }
    return false
  }

  loadWeek() {
    const week_start = this.weekStart.clone().startOf('isoWeek')
    const week_end = this.weekStart.clone().endOf('isoWeek')
    this.weekName = `${this.l.s('time.week')}: ${week_start.format('D. M.')} – ${week_end.format('D. M. YYYY')}`;

    this.http.get<{ menu: any[], orders: any[] }>(
      Config.API_URL + `/v1/canteen/menu?start_date=${week_start.format('YYYY-MM-DD')}&end_date=${week_end.format('YYYY-MM-DD')}`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.buildDays(data.menu, data.orders)
    }, (err) => {
      this.buildDays([], [])
    })
  }

  buildDays(menuItems: any[], orders: any[]) {
    this.days = [];
    this.selections = {};
    this.initialSelections = {};

    for (let i = 0; i < 5; i++) {
      const d = this.weekStart.clone().add(i, 'days');
      const dateStr = d.format('YYYY-MM-DD');
      
      const dayMeals = menuItems.filter((m: any) => moment(m.date).format('YYYY-MM-DD') === dateStr);
      
      const options = dayMeals.map((m: any) => {
        // limit_count check
        let available = true;
        if (m.limit_count !== null && m.ordered_count >= m.limit_count) {
          available = false;
        }

        return {
          id: m.menu_id,
          food: m.name,
          num: `Oběd ${m.variant_index}`,
          price: parseFloat(m.price),
          kcal: m.calories,
          allergens: m.allergens,
          is_allergic: this.checkAllergens(m.allergens),
          tags: m.allergens ? m.allergens.split(',') : [],
          available
        };
      });

      const dayCode = d.format('dd');
      this.days.push({
        code: dayCode,
        index: d.day(),
        date: d.format('D. M.'),
        dateStr: dateStr,
        options: options
      });

      const order = orders.find((o: any) => moment(o.date).format('YYYY-MM-DD') === dateStr);
      if (order) {
        const selectedOpt = options.find(o => o.id === order.menu_id);
        this.selections[dayCode] = selectedOpt || null;
      } else {
        this.selections[dayCode] = null;
      }
    }

    for (const key in this.selections) {
      this.initialSelections[key] = this.selections[key];
    }
  }

  selectWeek(num: number): void {
    this.weekStart = this.weekStart.clone().add(num, 'week');
    this.loadWeek()
  }

  currentWeek() {
    this.weekStart = moment().startOf('isoWeek');
    this.loadWeek();
  }

  get hasChanges(): boolean {
    return this.days.some(d => {
      const initId = this.initialSelections[d.code]?.id || null;
      const currId = this.selections[d.code]?.id || null;
      return initId !== currId;
    });
  }

  revertChanges() {
    for (const key in this.initialSelections) {
      this.selections[key] = this.initialSelections[key];
    }
  }

  selectOption(day: any, option: any) {
    if (
      this.selections[day.code] && option && this.selections[day.code]?.id == option?.id
      || 
      this.selections[day.code] == null && option == null
    ) return
    if (option && !option.available) return;
    if (moment(day.dateStr).isSameOrBefore(moment(), 'day')) {
      return
    }
    this.selections[day.code] = option;
  }

  get summary() {
    let total = 0;

    Object.values(this.selections).filter((select) => select != null).forEach((d) => total += d.price)

    const items = this.days.map(d => {
      const sel = this.selections[d.code];
      
      if (sel) {
        return { day: d.code, name: sel.label, price: sel.price, none: false };
      } else {
        return { day: d.code, name: 'Bez oběda', price: 0, none: true };
      }
    });
    return { items, total };
  }

  submitOrder() {
    this.submitting = true;
    
    const payloadSelections = this.days.map(d => {
      return {
        date: d.dateStr,
        menu_id: this.selections[d.code]?.id || null
      };
    });

    this.http.post(`${Config.API_URL}/v1/canteen/order`, {
      selections: payloadSelections,
      account_id: this.accountId
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        
        for (const key in this.selections) {
          this.initialSelections[key] = this.selections[key];
        }

        setTimeout(() => this.submitSuccess = false, 3000);
      },
      error: (err) => {
        console.error('Submit error', err);
        this.submitting = false;
      }
    });
  }

  private router = inject(Router);

  addCreditModal() {
    this.router.navigate(['/payments/overview']);
  }

  openAllergensModal() {
    this.modalManager.openModal('allergens-modal', {
      allergens: this.allergens,
      refreshCallback: (newAllergens: string[]) => {
        this.allergens = newAllergens;
        this.loadWeek();
      }
    });
  }

  openPaymentAccountModal() {
    this.modalManager.openModal('payment-account-modal', {
      accountId: this.accountId,
      refreshCallback: (newAccountId: number) => {
        if (newAccountId) {
          this.accountId = newAccountId;
          this.refreshCredit();
        }
      }
    });
  }
}
