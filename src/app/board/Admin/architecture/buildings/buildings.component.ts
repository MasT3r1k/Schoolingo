import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { FormsModule } from '@angular/forms';
import { AddBuildingModalComponent } from '../modals/add-building-modal/add-building-modal.component';
import { DeleteBuildingModalComponent } from './modals/delete-building-modal/delete-building-modal.component';
import { ModalManager } from '@Schoolingo/modal';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>{{ l.s('architecture.buildings') }}</h2>
        <div class="header-actions">
          <button class="btn btn--primary btn--sm" (click)="openModal()">
            <i-tabler name="plus"></i-tabler>
            {{ l.s('architecture.new_building') }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="table-container">
      <table class="table">
        <thead class="table__head">
          <tr>
            <th class="table__th">ID</th>
            <th class="table__th">{{ l.s('architecture.building_name') }}</th>
            <th class="table__th">{{ l.s('architecture.building_type') }}</th>
            <th class="table__th">Počet místností</th>
            <th class="table__th">Kapacita osob</th>
            <th class="table__th">{{ l.s('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          @for (building of buildings; track building.building_id) {
            <tr class="table__row">
              <td class="table__td">BLD-{{ building.building_id }}</td>
              <td class="table__td"><strong>{{ building.name }}</strong></td>
              <td class="table__td">
                <span class="badge badge--neutral">{{ l.s('architecture.types.' + building.type) }}</span>
              </td>
              <td class="table__td">{{ building.rooms_count }}</td>
              <td class="table__td">{{ building.persons_capacity }}</td>
              <td class="table__td">
                <div class="actions">
                    <button class="btn btn--icon btn--sm btn--ghost" (click)="goToDetail(building.building_id)" title="Spravovat patra">
                        <i-tabler name="layers-intersect"></i-tabler>
                    </button>
                    <button class="btn btn--icon btn--sm btn--ghost" (click)="editBuilding(building)">
                        <i-tabler name="edit"></i-tabler>
                    </button>
                    <button class="btn btn--icon btn--sm btn--ghost btn--danger" (click)="deleteBuilding(building.building_id)">
                        <i-tabler name="trash"></i-tabler>
                    </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="table__td" style="text-align: center; padding: 3rem;">
                <div class="empty-state">
                  <i-tabler name="building-off" class="empty-state__icon"></i-tabler>
                  <p class="empty-state__title">Žádné budovy nebyly nalezeny</p>
                  <p class="empty-state__description">Začněte přidáním první budovy kliknutím na tlačítko výše.</p>
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
    .table-container {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
    .empty-state__title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 0.5rem 0;
    }
    .empty-state__description {
        font-size: 0.9375rem;
        color: var(--text-muted);
        margin: 0;
        max-width: 400px;
    }
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        .header {
            flex-direction: column;
        }
        .table-container {
            overflow-x: auto;
        }
        .modal {
            max-width: 100%;
            margin: 1rem;
        }
    }
  `]
})
export class ArchitectureBuildingsComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  private router = inject(Router);

  public buildings: any[] = [];
  public showModal = false;
  public editingBuilding: any = null;
  public buildingForm = {
    name: '',
    type: 'school' as 'school' | 'canteen' | 'workshop' | 'other'
  };

  ngOnInit(): void {
    this.loadBuildings();
    this.modalManager.addModal('add-building', {
      title: 'architecture.new_building',
      icon: 'building',
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: AddBuildingModalComponent }
      ]
    });

    this.modalManager.addModal('delete-building', {
      title: 'architecture.delete_building_title',
      icon: 'trash',
      width: 500,
      closeable: true,
      items: [
        { type: 'component', component: DeleteBuildingModalComponent }
      ]
    });
  }

  loadBuildings(): void {
    this.http.get(`${Config.API_URL}/v1/school/architecture/buildings`, { withCredentials: true })
      .subscribe((data: any) => {
        this.buildings = data.buildings;
      });
  }

  openModal(): void {
    this.modalManager.updateModal('add-building', 'title', 'architecture.new_building');
    this.modalManager.updateModal('add-building', 'icon', 'plus');
    this.modalManager.openModal('add-building', { refreshCallback: () => { this.loadBuildings(); } });
  }

  editBuilding(building: any): void {
    this.modalManager.updateModal('add-building', 'title', 'architecture.edit_building');
    this.modalManager.updateModal('add-building', 'icon', 'edit');
    this.modalManager.openModal('add-building', { 
        building,
        refreshCallback: () => { this.loadBuildings(); } 
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveBuilding(): void {
    const payload = {
        ...this.buildingForm,
        building_id: this.editingBuilding?.building_id
    };

    this.http.post(`${Config.API_URL}/v1/school/architecture/buildings`, payload, { withCredentials: true })
        .subscribe(() => {
            this.loadBuildings();
            this.closeModal();
        });
  }

  deleteBuilding(id: number): void {
      this.modalManager.openModal('delete-building', {
          callback: () => {
              this.http.delete(`${Config.API_URL}/v1/school/architecture/buildings/${id}`, { withCredentials: true })
                .subscribe(() => this.loadBuildings());
          }
      });
  }

  goToDetail(id: number): void {
      this.router.navigate(['/admin/architecture/buildings', id]);
  }
}
