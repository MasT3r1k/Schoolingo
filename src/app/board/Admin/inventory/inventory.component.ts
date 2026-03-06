import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { InventoryItemModalComponent } from './modals/inventory-item-modal.component';
import { InventoryLogsModalComponent } from './modals/inventory-logs-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <div class="left">
          <h2>{{ l.s('architecture.inventory') }}</h2>
          <span class="meta muted">{{ l.s('architecture.inventory_desc') }}</span>
        </div>
        <div class="right">
          <button class="btn btn--primary" (click)="openItemModal()">
            <i-tabler name="plus"></i-tabler>
            {{ l.s('architecture.new_item') }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="table-container">
          <table class="table">
            <thead class="table__head">
              <tr>
                <th class="table__th">{{ l.s('architecture.inventory_fields.name') }}</th>
                <th class="table__th">{{ l.s('architecture.inventory_fields.category') }}</th>
                <th class="table__th">{{ l.s('architecture.inventory_fields.room') }}</th>
                <th class="table__th">{{ l.s('architecture.inventory_fields.status') }}</th>
                <th class="table__th">{{ l.s('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of inventory; track item.inventory_id) {
                <tr class="table__row">
                  <td class="table__td">
                    <strong>{{ item.name }}</strong>
                    @if (item.serial_number) {
                        <br><small class="muted">{{ item.serial_number }}</small>
                    }
                  </td>
                  <td class="table__td">{{ item.category }}</td>
                  <td class="table__td">
                    @if (item.room_name) {
                        <span class="badge badge--outline">{{ item.building_name }} - {{ item.room_name }}</span>
                    } @else {
                        <span class="muted">{{ l.s('architecture.unassigned') }}</span>
                    }
                  </td>
                  <td class="table__td">
                    <span class="badge" [class.badge--success]="item.status === 'active'" [class.badge--warning]="item.status === 'maintenance'" [class.badge--danger]="item.status === 'broken' || item.status === 'discarded'">
                      {{ l.s('architecture.inventory_status.' + item.status) }}
                    </span>
                  </td>
                  <td class="table__td">
                    <div class="actions">
                        <button class="btn btn--icon btn--sm btn--ghost" (click)="openItemModal(item)">
                            <i-tabler name="edit"></i-tabler>
                        </button>
                        <button class="btn btn--icon btn--sm btn--ghost" (click)="showLogs(item.inventory_id)">
                            <i-tabler name="history"></i-tabler>
                        </button>
                        <button class="btn btn--icon btn--sm btn--ghost btn--danger" (click)="deleteItem(item.inventory_id)">
                            <i-tabler name="trash"></i-tabler>
                        </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="table__td" style="text-align: center; padding: 3rem;">
                    <div class="empty-state">
                      <i-tabler name="package-off" class="empty-state__icon"></i-tabler>
                      <p class="empty-state__title">{{ l.s('architecture.empty.inventory') }}</p>
                      <p class="empty-state__description">{{ l.s('architecture.empty.inventory_desc') }}</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      gap: 1rem;
    }
    .card-header .left h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: var(--text);
    }
    .card-body {
      padding: 1.5rem;
    }
    .table-container {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .actions {
        display: flex;
        gap: 0.5rem;
    }
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
    }
    .empty-state__icon {
        width: 64px;
        height: 64px;
        color: var(--text-muted);
        opacity: 0.5;
        margin-bottom: 1rem;
    }
  `]
})
export class InventoryComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);

  public inventory: any[] = [];
  public rooms: any[] = [];

  ngOnInit(): void {
    this.modalManager.addModal('inventory-item', {
      title: 'architecture.inventory',
      icon: 'plus',
      closeable: true,
      width: 600,
      items: [{ type: 'component', component: InventoryItemModalComponent }]
    });

    this.modalManager.addModal('inventory-logs', {
      title: 'architecture.history.title',
      closeable: true,
      width: 800,
      items: [{ type: 'component', component: InventoryLogsModalComponent }]
    });

    this.loadInventory();
    this.loadRooms();
  }

  loadInventory(): void {
    this.http.get(`${Config.API_URL}/v1/school/inventory`, { withCredentials: true })
      .subscribe((data: any) => {
        this.inventory = data.items;
      });
  }

  loadRooms(): void {
    this.http.get(`${Config.API_URL}/v1/school/architecture/rooms`, { withCredentials: true })
      .subscribe((data: any) => {
        this.rooms = data.rooms;
      });
  }

  openItemModal(item: any = null): void {
    this.modalManager.updateModal('inventory-item', 'title', item ? this.l.s('architecture.edit_item') : this.l.s('architecture.new_item'));
    this.modalManager.updateModal('inventory-item', 'icon', item ? 'edit' : 'plus');
    this.modalManager.openModal('inventory-item', {
      item,
      rooms: this.rooms,
      refreshCallback: () => this.loadInventory()
    });
  }

  deleteItem(id: number): void {
      if (confirm('Opravdu chcete smazat tuto položku z evidence?')) {
          this.http.delete(`${Config.API_URL}/v1/school/inventory/${id}`, { withCredentials: true })
            .subscribe(() => this.loadInventory());
      }
  }

  showLogs(id: number): void {
      this.http.get(`${Config.API_URL}/v1/school/inventory/${id}/logs`, { withCredentials: true })
        .subscribe((data: any) => {
            this.modalManager.openModal('inventory-logs', {
                logs: data.logs
            });
        });
  }
}
