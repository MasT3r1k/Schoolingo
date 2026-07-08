import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '../../../infrastructure/config';
import moment from 'moment';
import { IssueMealModalComponent } from './modals/issue-modal.component';

import { StatCardComponent } from '@Components/stat-card/stat-card.component';

interface IssueOrder {
  order_id: number;
  status: 'ordered' | 'issued' | 'cancelled';
  variant_index: number;
  meal_name: string;
  first_name: string;
  last_name: string;
  credit?: number;
}

interface IssueStats {
  total_ordered: number;
  issued: number;
  cancelled: number;
}

  import { BehaviorSubject } from 'rxjs';
  import { TabsComponent } from '@Components/Tabs';
  
  @Component({
    selector: 'app-canteen-issues',
    standalone: true,
    imports: [CommonModule, FormsModule, IconsModule, StatCardComponent, TabsComponent],
    templateUrl: './issues.component.html',
    styleUrl: './issues.component.css'
  })
  export class IssuesComponent implements OnInit {
    l = inject(Locale);
    http = inject(HttpClient);
    modalManager = inject(ModalManager);
  
    today = moment().format('YYYY-MM-DD');
    todayLabel = moment().format('D. M. YYYY');
  
    issues: IssueOrder[] = [];
    filteredIssues: IssueOrder[] = [];
    stats: IssueStats = { total_ordered: 0, issued: 0, cancelled: 0 };
  
    searchQuery = '';
    isLoading = true;
    public tabValue = new BehaviorSubject<number>(0);
  
    ngOnInit() {
      this.modalManager.addModal('issue_meal', {
        title: 'Vydat jídlo',
        icon: 'scan',
        width: 600,
        closeable: true,
        items: [
          { type: 'component', component: IssueMealModalComponent }
        ]
      });
      this.loadIssues();
      this.tabValue.subscribe(() => {
        this.applyFilter();
      });
    }
  
    openIssueModal() {
      this.modalManager.openModal('issue_meal', {
        date: this.today,
        refreshCallback: () => {
          this.loadIssues();
        }
      });
    }
  
    loadIssues() {
      this.isLoading = true;
      this.http
        .get<{ issues: IssueOrder[]; stats: IssueStats }>(
          `${Config.API_URL}/v1/canteen/issues?date=${this.today}`,
          { withCredentials: true }
        )
        .subscribe({
          next: (res) => {
            this.issues = res.issues || [];
            this.stats = res.stats || { total_ordered: 0, issued: 0, cancelled: 0 };
            this.applyFilter();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Chyba při načítání výdeje', err);
            this.isLoading = false;
          }
        });
    }
  
    applyFilter() {
      const q = this.searchQuery.toLowerCase().trim();
      const tabIdx = this.tabValue.getValue();
      const statusFilter = tabIdx === 1 ? 'ordered' : (tabIdx === 2 ? 'issued' : (tabIdx === 3 ? 'cancelled' : null));
  
      this.filteredIssues = this.issues.filter(i => {
        if (statusFilter && i.status !== statusFilter) return false;
        if (!q) return true;
        const fullName = `${i.first_name} ${i.last_name}`.toLowerCase();
        return fullName.includes(q) || i.meal_name.toLowerCase().includes(q);
      });
    }
  
    issueMeal(order: IssueOrder) {
      this.http
        .post(`${Config.API_URL}/v1/canteen/issue/${order.order_id}`, {}, { withCredentials: true })
        .subscribe({
          next: () => {
            order.status = 'issued';
            this.stats.issued++;
            // Re-apply filter to reflect change
            this.applyFilter();
          },
          error: (err) => console.error('Chyba při vydávání oběda', err)
        });
    }

    issueFilteredMeals() {
      const waitingOrders = this.filteredIssues.filter(o => o.status === 'ordered');
      if (waitingOrders.length === 0) return;

      const orderIds = waitingOrders.map(o => o.order_id);

      this.http
        .post(`${Config.API_URL}/v1/canteen/issue/bulk`, { order_ids: orderIds }, { withCredentials: true })
        .subscribe({
          next: () => {
            waitingOrders.forEach(o => {
              o.status = 'issued';
            });
            this.stats.issued += waitingOrders.length;
            this.applyFilter();
          },
          error: (err) => console.error('Chyba při hromadném vydávání', err)
        });
    }
  
    get waitingCount(): number {
      return this.stats.total_ordered - this.stats.issued - this.stats.cancelled;
    }
  
    get filteredWaitingCount(): number {
      return this.filteredIssues.filter(o => o.status === 'ordered').length;
    }
  
    get issuedPercent(): number {
      if (!this.stats.total_ordered) return 0;
      return Math.round((this.stats.issued / this.stats.total_ordered) * 100);
    }
  
    getFullName(order: IssueOrder): string {
      return `${order.first_name} ${order.last_name}`;
    }
  }
