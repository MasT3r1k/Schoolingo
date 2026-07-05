import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { Config } from '../../../../infrastructure/config';
import { IconsModule } from '@Schoolingo/icons';
import { Subject, of, Subscription } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';

interface SearchStudentOrder {
  person_id: number;
  first_name: string;
  last_name: string;
  order_id?: number | null;
  status?: 'ordered' | 'issued' | 'cancelled' | null;
  variant_index?: number | null;
  meal_name?: string | null;
  credit?: number | null;
}

@Component({
  selector: 'app-issue-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label" for="searchStudent">{{ l.s('canteen.search_student') || 'Vyhledat studenta' }}</label>
        <div style="display: flex; gap: 0.5rem; flex-direction: column;">
          <input 
            type="text" 
            class="form-input" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange($event)" 
            [placeholder]="l.s('canteen.search_student_placeholder') || 'Jméno studenta...'" 
            id="searchStudent"
            autocomplete="off"
            #searchInput>
        </div>
      </div>

      <div class="search-results" *ngIf="searchQuery && filteredOrders.length > 0">
        @for (order of filteredOrders; track order.person_id) {
          <div class="order-card" [class.order-card--issued]="order.status === 'issued'">
            <div class="order-card-header">
              <div class="order-person">
                <div class="avatar">{{ order.first_name[0] }}{{ order.last_name[0] }}</div>
                <strong>{{ order.first_name }} {{ order.last_name }}</strong>
              </div>
              <div class="order-status">
                @if (!order.order_id) {
                  <span class="badge badge--danger"><i-tabler name="x"></i-tabler> {{ l.s('canteen.status_no_order') || 'Nemá oběd' }}</span>
                } @else if (order.status === 'issued') {
                  <span class="badge badge--success"><i-tabler name="check"></i-tabler> {{ l.s('canteen.status_issued') || 'Vydáno' }}</span>
                } @else if (order.status === 'ordered') {
                  <span class="badge badge--warning"><i-tabler name="clock"></i-tabler> {{ l.s('canteen.status_ordered') || 'Čeká na výdej' }}</span>
                } @else {
                  <span class="badge badge--danger"><i-tabler name="x"></i-tabler> {{ l.s('canteen.status_cancelled') || 'Zrušeno' }}</span>
                }
              </div>
            </div>
            
            <div class="order-meal">
              @if (order.order_id) {
                <span class="badge badge--primary">{{ l.s('canteen.weekly_menu_td') || 'Oběd' }} {{ order.variant_index }}</span>
                <span class="meal-name">{{ order.meal_name }}</span>
              } @else {
                <span style="color: var(--danger-600); font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                  <i-tabler name="ban"></i-tabler>
                  {{ l.s('canteen.status_no_order_long') || 'Nemá zvolený žádný oběd' }}
                </span>
              }
            </div>

            @if (order.credit !== undefined && order.credit !== null) {
              <div class="order-credit" style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center; font-size: 0.875rem;">
                <i-tabler name="wallet" style="color: var(--text-muted); width: 18px; height: 18px;"></i-tabler>
                <span style="color: var(--text-muted);">{{ l.s('canteen.available_credit') || 'Dostupný kredit' }}:</span>
                <strong [class.text--danger]="order.credit < 0">{{ order.credit }} Kč</strong>
              </div>
            }

            <div class="order-actions">
              @if (!order.order_id) {
                <button class="btn btn--danger" disabled>
                  <i-tabler name="x"></i-tabler>
                  {{ l.s('canteen.btn_issue') || 'Vydat oběd' }}
                </button>
              } @else if (order.status === 'ordered') {
                <button class="btn btn--primary" (click)="issueMeal(order)">
                  <i-tabler name="scan"></i-tabler>
                  {{ l.s('canteen.btn_issue') || 'Vydat oběd' }}
                </button>
              } @else if (order.status === 'issued') {
                <div class="message message--success" style="margin: 0; padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; width: 100%; border-radius: 6px;">
                  <i-tabler name="info-circle" style="width: 20px; height: 20px;"></i-tabler>
                  {{ l.s('canteen.already_issued') || 'Uživatel si již tento oběd vyzvedl.' }}
                </div>
              }
            </div>
          </div>
        }
      </div>

      <div class="search-empty" *ngIf="searchQuery && filteredOrders.length === 0">
        <i-tabler name="search-off"></i-tabler>
        <p>{{ l.s('canteen.no_results_for') || 'Žádný výsledek pro' }} <strong>{{ searchQuery }}</strong></p>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn--secondary" (click)="close()">{{ l.s('buttons.close') || 'Zavřít' }}</button>
    </div>
  `,
  styles: [`
    .order-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .order-card--issued {
      border-color: var(--success);
      background: rgba(var(--success-rgb), 0.05);
    }
    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .order-person {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8rem;
    }
    .order-meal {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .meal-name {
      font-weight: 500;
    }
    .order-actions {
      display: flex;
      justify-content: flex-end;
    }
    .search-empty {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-muted);
    }
    .search-empty i-tabler {
      width: 32px;
      height: 32px;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }
  `]
})
export class IssueMealModalComponent implements OnInit, OnDestroy {
  public modalManager = inject(ModalManager);
  public l = inject(Locale);
  public http = inject(HttpClient);

  public searchQuery = '';
  public filteredOrders: SearchStudentOrder[] = [];

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  get data() {
    return this.modalManager.getModalData('issue_meal');
  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      switchMap(q => {
        if (!q.trim()) return of([]);
        const date = this.data?.date || '';
        return this.http.get<SearchStudentOrder[]>(`${Config.API_URL}/v1/canteen/students/search?q=${q}&date=${date}`, { withCredentials: true }).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      this.filteredOrders = results;
    });

    setTimeout(() => {
      document.getElementById('searchStudent')?.focus();
    }, 100);
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchChange(query: string) {
    if (!query.trim()) {
      this.filteredOrders = [];
      return;
    }
    this.searchSubject.next(query);
  }

  issueMeal(order: SearchStudentOrder) {
    if (!order.order_id) return;
    
    this.http.post(`${Config.API_URL}/v1/canteen/issue/${order.order_id}`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          order.status = 'issued';
          if (this.data?.refreshCallback) {
            this.data.refreshCallback(); // refresh list in background
          }
        },
        error: (err) => {
          console.error('Failed to issue meal', err);
        }
      });
  }

  close() {
    this.modalManager.closeModal('issue_meal');
  }
}
