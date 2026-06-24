import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { AddFloorModalComponent } from './modals/add-floor-modal.component';
import { DeleteFloorModalComponent } from './modals/delete-floor-modal/delete-floor-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <div class="row" style="gap: 8px">
          <div class="btn btn--secondary btn--sm" (click)="goBack()">
            <i-tabler name="arrow-left"></i-tabler>
            {{ building?.name || l.s('architecture.buildings') }}
          </div>
          <h2>Správa pater budovy</h2>
        </div>
        <div class="header-actions">
          <button class="btn btn--primary btn--sm" (click)="openAddFloorModal()">
            <i-tabler name="plus"></i-tabler>
            Přidat patro
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="table-container">
          <table class="table">
            <thead class="table__head">
              <tr>
                <th class="table__th">ID</th>
                <th class="table__th">Úroveň patra</th>
                <th class="table__th">Plánek (SVG/Kód)</th>
                <th class="table__th">{{ l.s('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (floor of floors; track floor.bf_id) {
                <tr class="table__row">
                  <td class="table__td">FLR-{{ floor.bf_id }}</td>
                  <td class="table__td">
                    <strong>
                      @if (floor.level === 0) {
                          Přízemí (0)
                      } @else if (floor.level > 0) {
                          {{ floor.level }}. patro
                      } @else {
                          Suterén ({{ floor.level }})
                      }
                    </strong>
                  </td>
                  <td class="table__td">
                    @if (floor.floor_plan) {
                        <span class="badge badge--success">Nahrán</span>
                    } @else {
                        <span class="badge badge--neutral">Nenahrán</span>
                    }
                  </td>
                  <td class="table__td">
                    <div class="actions">
                        <button class="btn btn--icon btn--sm btn--ghost" (click)="editFloor(floor)">
                            <i-tabler name="edit"></i-tabler>
                        </button>
                        <button class="btn btn--icon btn--sm btn--ghost btn--danger" (click)="deleteFloor(floor.bf_id)">
                            <i-tabler name="trash"></i-tabler>
                        </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="table__td" style="text-align: center; padding: 3rem;">
                    <div class="empty-state">
                      <i-tabler name="layers-off" class="empty-state__icon"></i-tabler>
                      <p class="empty-state__title">Zatím zde nejsou žádná patra</p>
                      <p class="empty-state__description">Začněte přidáním prvního patra kliknutím na tlačítko výše.</p>
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
    .card-body {
      padding: 1.5rem;
    }
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
  `]
})
export class ArchitectureBuildingDetailComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public buildingId: number = 0;
  public building: any = null;
  public floors: any[] = [];
  public modalManager = inject(ModalManager);

  ngOnInit(): void {
    this.modalManager.addModal('floor-modal', {
      icon: 'layers-intersect',
      title: 'architecture.new_floor',
      closeable: true,
      width: 500,
      items: [{ type: 'component', component: AddFloorModalComponent }]
    });

    this.modalManager.addModal('delete-floor', {
      icon: 'trash',
      title: 'architecture.delete_floor_title',
      closeable: true,
      width: 500,
      items: [{ type: 'component', component: DeleteFloorModalComponent }]
    });
    this.route.params.subscribe(params => {
        if (params['id']) {
            this.buildingId = Number(params['id']);
            this.loadBuildingContext();
            this.loadFloors();
        }
    });
  }

  loadBuildingContext(): void {
      // Just temporarily getting building name by fetching all buildings and finding this one
      // Usually would have a GET /architecture/buildings/:id endpoint, but we can manage here
      this.http.get(`${Config.API_URL}/v1/school/architecture/buildings`, { withCredentials: true })
      .subscribe((data: any) => {
        const found = data.buildings.find((b: any) => b.building_id === this.buildingId);
        if (found) {
            this.building = found;
        }
      });
  }

  loadFloors(): void {
    this.http.get(`${Config.API_URL}/v1/school/architecture/buildings/${this.buildingId}/floors`, { withCredentials: true })
      .subscribe((data: any) => {
        this.floors = data.floors;
      });
  }

  goBack(): void {
      this.router.navigate(['/admin/architecture/buildings']);
  }

  openAddFloorModal(): void {
    this.modalManager.updateModal('floor-modal', 'title', 'architecture.new_floor');
    this.modalManager.updateModal('floor-modal', 'icon', 'plus');
    this.modalManager.openModal('floor-modal', {
        buildingId: this.buildingId,
        refreshCallback: () => this.loadFloors()
    });
  }

  editFloor(floor: any): void {
    this.modalManager.updateModal('floor-modal', 'title', 'architecture.edit_floor');
    this.modalManager.updateModal('floor-modal', 'icon', 'edit');
    this.modalManager.openModal('floor-modal', {
        buildingId: this.buildingId,
        floor: floor,
        refreshCallback: () => this.loadFloors()
    });
  }

  deleteFloor(id: number): void {
      this.modalManager.openModal('delete-floor', {
          callback: () => {
              this.http.delete(`${Config.API_URL}/v1/school/architecture/floors/${id}`, { withCredentials: true })
                .subscribe(() => this.loadFloors());
          }
      });
  }
}
