import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <div class="left">
          <h2>{{ l.s('architecture.rooms') }}</h2>
          <span class="meta muted">Správa místností v areálu školy.</span>
        </div>
        <div class="right">
          <button class="btn btn--primary" (click)="openModal()">
            <i-tabler name="plus"></i-tabler>
            {{ l.s('architecture.new_room') }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="table-container">
      <table class="table">
        <thead class="table__head">
          <tr>
            <th class="table__th">ID</th>
            <th class="table__th">{{ l.s('architecture.room_name') }}</th>
            <th class="table__th">{{ l.s('architecture.room_type') }}</th>
            <th class="table__th">{{ l.s('architecture.capacity') }}</th>
            <th class="table__th">{{ l.s('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          @for (room of rooms; track room.br_id) {
            <tr class="table__row">
              <td class="table__td">RM-{{ room.br_id }}</td>
              <td class="table__td"><strong>{{ room.name }}</strong></td>
              <td class="table__td">
                <span class="badge badge--primary">{{ l.s('architecture.types.' + room.type) }}</span>
              </td>
              <td class="table__td">{{ room.capacity || 0 }} žáků</td>
              <td class="table__td">
                <div class="actions">
                    <button class="btn btn--icon btn--sm btn--ghost" (click)="editRoom(room)">
                        <i-tabler name="edit"></i-tabler>
                    </button>
                    <button class="btn btn--icon btn--sm btn--ghost btn--danger" (click)="deleteRoom(room.br_id)">
                        <i-tabler name="trash"></i-tabler>
                    </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" class="table__td" style="text-align: center; padding: 3rem;">
                <div class="empty-state">
                  <i-tabler name="door-off" class="empty-state__icon"></i-tabler>
                  <p class="empty-state__title">Žádné místnosti nebyly nalezeny</p>
                  <p class="empty-state__description">Začněte přidáním první místnosti.</p>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
        </div>
      </div>
    </div>

    <!-- Modal for adding/editing room -->
    @if (showModal) {
    <div class="modal-overlay">
        <div class="modal card">
            <div class="card__header">
                <h2 class="card__title">{{ editingRoom?.br_id ? 'Upravit místnost' : 'Nová místnost' }}</h2>
                <button class="btn btn--icon btn--ghost" (click)="closeModal()">
                    <i-tabler name="x"></i-tabler>
                </button>
            </div>
            <div class="card__body">
                @if (!editingRoom) {
                <div class="form-group">
                    <label class="form-label">Budova & Patro</label>
                    <select class="form-select" [(ngModel)]="roomForm.floor_id">
                        @for (f of floors; track f.bf_id) {
                            <option [value]="f.bf_id">{{ f.building_name }} - {{ f.level }}. patro</option>
                        }
                    </select>
                </div>
                }
                <div class="form-group">
                    <label class="form-label">{{ l.s('architecture.room_name') }}</label>
                    <input type="text" class="form-input" [(ngModel)]="roomForm.name" placeholder="Např. 402, Kabinet IT...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">{{ l.s('architecture.room_type') }}</label>
                        <select class="form-select" [(ngModel)]="roomForm.type">
                            <option value="classroom">Třída</option>
                            <option value="cabinet">Kabinet</option>
                            <option value="office">Kancelář</option>
                            <option value="hallway">Chodba</option>
                            <option value="canteen">Jídelna</option>
                            <option value="other">Ostatní</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">{{ l.s('architecture.capacity') }}</label>
                        <input type="number" class="form-input" [(ngModel)]="roomForm.capacity" placeholder="Počet studentů">
                    </div>
                </div>
            </div>
            <div class="card__footer">
                <button class="btn btn--secondary" (click)="closeModal()">{{ l.s('cancel') }}</button>
                <button class="btn btn--primary" (click)="saveRoom()">{{ l.s('buttons.save') }}</button>
            </div>
        </div>
    </div>
    }
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
    .card-header .left {
      flex: 1;
    }
    .card-header .left h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: var(--text);
    }
    .card-header .right {
      flex-shrink: 0;
    }
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
    .modal {
        width: 100%;
        max-width: 600px;
        background: var(--surface);
        border-radius: var(--radius);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideUp 0.2s ease;
        max-height: 90vh;
        overflow-y: auto;
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
    .card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border);
    }
    .card__title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: var(--text);
    }
    .card__body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }
    .card__footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid var(--border);
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    .form-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text);
    }
    .form-input,
    .form-select {
        padding: 0.75rem 1rem;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        font-size: 0.9375rem;
        color: var(--text);
        transition: all 0.2s ease;
    }
    .form-input:focus,
    .form-select:focus {
        outline: none;
        border-color: var(--primary);
        background: var(--surface);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
    }
    .form-input::placeholder {
        color: var(--text-muted);
    }

    @media (max-width: 768px) {
        .table-container {
            overflow-x: auto;
        }
        .modal {
            max-width: 100%;
            margin: 1rem;
        }
        .form-row {
            grid-template-columns: 1fr;
        }
    }
  `]
})
export class ArchitectureRoomsComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);

  public rooms: any[] = [];
  public floors: any[] = [];
  public showModal = false;
  public editingRoom: any = null;
  public roomForm = {
    floor_id: 0,
    name: '',
    type: 'classroom',
    capacity: 30
  };

  ngOnInit(): void {
    this.loadRooms();
    this.loadFloors();
  }

  loadRooms(): void {
    // This is simplified, usually we'd pass a floor ID or get all for school
    // In our API we have /architecture/floors/:id/rooms
    // For now getting all rooms (requires a new endpoint or multiple calls)
    // I'll assume we have a way to see them all for now or I'll add the endpoint
    this.http.get(`${Config.API_URL}/v1/school/architecture/rooms`, { withCredentials: true })
      .subscribe((data: any) => {
        this.rooms = data.rooms;
      });
  }

  loadFloors(): void {
    this.http.get(`${Config.API_URL}/v1/school/architecture/floors-all`, { withCredentials: true })
      .subscribe((data: any) => {
        this.floors = data.floors;
      });
  }

  openModal(): void {
    this.editingRoom = null;
    this.roomForm = { floor_id: this.floors[0]?.bf_id || 0, name: '', type: 'classroom', capacity: 30 };
    this.showModal = true;
  }

  editRoom(room: any): void {
    this.editingRoom = room;
    this.roomForm = { ...room };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveRoom(): void {
    this.http.post(`${Config.API_URL}/v1/school/architecture/rooms`, { ...this.roomForm, br_id: this.editingRoom?.br_id }, { withCredentials: true })
        .subscribe(() => {
            this.loadRooms();
            this.closeModal();
        });
  }

  deleteRoom(id: number): void {
      if (confirm('Opravdu chcete smazat tuto místnost?')) {
          this.http.delete(`${Config.API_URL}/v1/school/architecture/rooms/${id}`, { withCredentials: true })
            .subscribe(() => this.loadRooms());
      }
  }
}
