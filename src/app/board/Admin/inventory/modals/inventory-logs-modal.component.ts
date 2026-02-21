import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'inventory-logs-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card__body">
        <div class="logs-list">
            @for (log of itemLogs; track log.log_id) {
                <div class="log-item">
                    <div class="log-date">{{ log.created_at | date:'dd.MM.yyyy HH:mm' }}</div>
                    <div class="log-action">
                        <strong>{{ log.firstName }} {{ log.lastName }}</strong>: 
                        @if (log.action === 'create') {
                            {{ l.s('architecture.history.created') }}
                        } @else if (log.action === 'move') {
                            {{ l.s('architecture.history.moved', { from: log.from_room_name || l.s('architecture.warehouse'), to: log.to_room_name || l.s('architecture.warehouse') }) }}
                        } @else if (log.action === 'status_change') {
                            {{ l.s('architecture.history.status_updated', { status: l.s('architecture.inventory_status.' + log.new_status) }) }}
                        } @else {
                            {{ l.s('architecture.history.data_updated') }}
                        }
                    </div>
                    @if (log.note) {
                        <div class="log-note muted small">{{ log.note }}</div>
                    }
                </div>
            } @empty {
                <p class="muted">{{ l.s('architecture.history.empty') }}</p>
            }
        </div>
    </div>
  `,
  styles: [`
    .card__body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .logs-list { display: flex; flex-direction: column; gap: 1rem; }
    .log-item { padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
    .log-date { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .log-action { font-size: 0.9375rem; }
  `]
})
export class InventoryLogsModalComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);

  public itemLogs: any[] = [];

  ngOnInit(): void {
    const data = this.modalManager.getModalData('inventory-logs');
    if (data) {
      this.itemLogs = data.logs || [];
    }
  }
}
