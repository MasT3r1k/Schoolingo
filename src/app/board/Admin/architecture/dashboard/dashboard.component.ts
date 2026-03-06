import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { RouterLink } from '@angular/router';
import { ModalManager } from '@Schoolingo/modal';
import { AddBuildingModalComponent } from '../modals/add-building-modal/add-building-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, RouterLink],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>{{ l.s('architecture.dashboard') }}</h2>
        <div class="right">
          <button class="btn btn--primary" (click)="openAddBuildingModal()">
            <i-tabler name="plus"></i-tabler>
            {{ l.s('architecture.new_building') }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="stats-grid">
      <div class="stat-card stat--primary">
        <div class="stat-icon">
          <i-tabler name="building-community"></i-tabler>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.buildings }}</span>
          <span class="stat-label">{{ l.s('architecture.total_buildings') }}</span>
        </div>
      </div>
      <div class="stat-card stat--success">
        <div class="stat-icon">
          <i-tabler name="door-enter"></i-tabler>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.rooms }}</span>
          <span class="stat-label">{{ l.s('architecture.total_rooms') }}</span>
        </div>
      </div>
      <div class="stat-card stat--info">
        <div class="stat-icon">
          <i-tabler name="route-2"></i-tabler>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.hallways }}</span>
          <span class="stat-label">{{ l.s('architecture.total_hallways') }}</span>
        </div>
      </div>
      <div class="stat-card stat--warning" [routerLink]="['/admin/architecture/inventory']" style="cursor: pointer">
        <div class="stat-icon">
          <i-tabler name="package"></i-tabler>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.inventory || 0 }}</span>
          <span class="stat-label">{{ l.s('architecture.inventory') }}</span>
        </div>
      </div>
    </div>

    <div class="section-header">
        <h2>{{ l.s('architecture.active_objects') }}</h2>
        <button class="btn btn--ghost" [routerLink]="['/admin/architecture/buildings']">{{ l.s('buttons.view_all') }}</button>
    </div>

    <div class="objects-grid">
        @for (building of buildings; track building.building_id) {
            <div class="object-card">
                <div class="card-top">
                    <div class="title-area">
                        <h3>{{ building.name }}</h3>
                        <p>{{ l.s('architecture.types.' + building.type) }}</p>
                    </div>
                </div>
                <div class="card-stats">
                    <div class="card-stat">
                        <span class="value">{{ building.rooms_count || 0 }}</span>
                        <span class="label">MÍSTNOSTÍ</span>
                    </div>
                    <div class="card-stat">
                        <span class="value">{{ building.persons_capacity || 0 }} osob</span>
                        <span class="label">KAPACITA</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span class="id-tag">ID: BLD-{{ building.building_id }}</span>
                    <button class="btn btn--secondary btn--sm" [routerLink]="['/admin/architecture/buildings']">
                        {{ l.s('architecture.manage') }}
                    </button>
                </div>
            </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .card-header .right {
      flex-shrink: 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }
    .section-header h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: var(--text);
    }

    .objects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
    }
    .object-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        transition: all 0.3s ease;
    }
    .object-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: var(--primary);
    }
    .card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
    }
    .title-area {
        flex: 1;
    }
    .card-top h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0;
        color: var(--text);
    }
    .card-top p {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin: 0.25rem 0 0 0;
    }
    .status-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.375rem 0.75rem;
        border-radius: 999px;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .status-badge.success {
        background: rgba(34, 197, 94, 0.15);
        color: var(--success);
    }
    .card-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        background: var(--surface-2);
        padding: 1rem;
        border-radius: var(--radius);
        border: 1px solid var(--border);
    }
    .card-stat {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .card-stat .label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
    }
    .card-stat .value {
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--text);
    }
    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
    }
    .id-tag {
        font-size: 0.75rem;
        font-family: monospace;
        color: var(--primary);
        font-weight: 600;
        background: rgba(var(--primary-rgb), 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }

    @media (max-width: 768px) {
        .header {
            flex-direction: column;
        }
        .stats-grid {
            grid-template-columns: 1fr;
        }
        .objects-grid {
            grid-template-columns: 1fr;
        }
        .section-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
  `]
})
export class ArchitectureDashboardComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);

  public stats = {
    buildings: 0,
    rooms: 0,
    hallways: 0,
    inventory: 0
  };

  public buildings: any[] = [];

  ngOnInit(): void {
    this.modalManager.addModal('add-building', {
      title: this.l.s('architecture.new_building'),
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: AddBuildingModalComponent }
      ]
    });

    this.loadStats();
    this.loadBuildings();
  }

  private loadStats(): void {
    this.http.get(`${Config.API_URL}/v1/school/architecture/overview`, { withCredentials: true })
      .subscribe((data: any) => {
        this.stats = data;
      });
  }

  private loadBuildings(): void {
    this.http.get(`${Config.API_URL}/v1/school/architecture/buildings`, { withCredentials: true })
      .subscribe((data: any) => {
        this.buildings = data.buildings;
      });
  }

  public openAddBuildingModal(): void {
    this.modalManager.openModal('add-building', { refreshCallback: () => { this.loadStats(); this.loadBuildings(); } });
  }
}
