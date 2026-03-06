import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { RoomModalComponent } from './modals/room-modal.component';
import { RoomTimetableModalComponent } from './modals/room-timetable-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <div class="left">
          <h2>{{ l.s('architecture.rooms') }}</h2>
          <span class="meta muted">{{ l.s('architecture.rooms_desc') }}</span>
        </div>
        <div class="right">
          <button class="btn btn--primary" (click)="openRoomModal()">
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
            <th class="table__th">Umístění</th>
            <th class="table__th">{{ l.s('architecture.room_type') }}</th>
            <th class="table__th">{{ l.s('architecture.capacity') }}</th>
            <th class="table__th">{{ l.s('architecture.room_manager') }}</th>
            <th class="table__th">{{ l.s('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          @for (room of rooms; track room.room_id) {
            <tr class="table__row">
              <td class="table__td">RM-{{ room.room_id }}</td>
              <td class="table__td">
                <strong>{{ room.name }}</strong>
                @if (room.description) {
                  <br><small class="muted">{{ room.description }}</small>
                }
              </td>
              <td class="table__td">
                <strong>{{ room.building_name }}</strong><br>
                <small class="muted">
                  @if (room.level === 0) {
                    Přízemí (0)
                  } @else if (room.level > 0) {
                    {{ room.level }}. patro
                  } @else {
                    Suterén ({{ room.level }})
                  }
                </small>
              </td>
              <td class="table__td">
                <span class="badge badge--primary">{{ l.s('architecture.types.' + room.type) }}</span>
              </td>
              <td class="table__td">
                @if (!['hallway', 'other'].includes(room.type)) {
                    {{ room.capacity || 0 }} {{ l.s('students.count') }}
                } @else {
                    <span class="muted">-</span>
                }
              </td>
              <td class="table__td">
                @if (room.manager_firstName) {
                  {{ room.manager_firstName }} {{ room.manager_lastName }}
                } @else {
                  <span class="muted">{{ l.s('architecture.no_manager') }}</span>
                }
              </td>
              <td class="table__td">
                <div class="actions">
                    <button class="btn btn--icon btn--sm btn--ghost" (click)="openTimetableModal(room)">
                        <i-tabler name="calendar-stats"></i-tabler>
                    </button>
                    <button class="btn btn--icon btn--sm btn--ghost" (click)="openRoomModal(room)">
                        <i-tabler name="edit"></i-tabler>
                    </button>
                    <button class="btn btn--icon btn--sm btn--ghost btn--danger" (click)="deleteRoom(room.room_id)">
                        <i-tabler name="trash"></i-tabler>
                    </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="7" class="table__td" style="text-align: center; padding: 3rem;">
                <div class="empty-state">
                  <i-tabler name="door-off" class="empty-state__icon"></i-tabler>
                  <p class="empty-state__title">{{ l.s('architecture.empty.rooms') }}</p>
                  <p class="empty-state__description">{{ l.s('architecture.empty.rooms_desc') }}</p>
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
  `]
})
export class ArchitectureRoomsComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);

  public rooms: any[] = [];
  public floors: any[] = [];
  public employees: any[] = [];

  ngOnInit(): void {
    this.modalManager.addModal('room-modal', {
      icon: 'door',
      title: 'architecture.rooms',
      description: 'Úprava parametrů existující místnosti',
      closeable: true,
      width: 600,
      items: [{ type: 'component', component: RoomModalComponent }]
    });

    this.modalManager.addModal('room-timetable-modal', {
      title: 'timetable.room_timetable',
      closeable: true,
      width: 1000,
      items: [{ type: 'component', component: RoomTimetableModalComponent }]
    });

    this.loadRooms();
    this.loadFloors();
    this.loadEmployees();
  }

  loadRooms(): void {
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

  loadEmployees(): void {
    this.http.get(`${Config.API_URL}/v1/employees`, { withCredentials: true })
      .subscribe((data: any) => {
        this.employees = data.data;
      });
  }

  openRoomModal(room: any = null): void {
    this.modalManager.updateModal('room-modal', 'title', room ? this.l.s('architecture.edit_room') : this.l.s('architecture.new_room'));
    this.modalManager.openModal('room-modal', {
      room,
      floors: this.floors,
      employees: this.employees,
      refreshCallback: () => this.loadRooms()
    });
  }

  openTimetableModal(room: any): void {
    this.modalManager.openModal('room-timetable-modal', {
      room
    });
  }

  deleteRoom(id: number): void {
      if (confirm('Opravdu chcete smazat tuto místnost?')) {
          this.http.delete(`${Config.API_URL}/v1/school/architecture/rooms/${id}`, { withCredentials: true })
            .subscribe(() => this.loadRooms());
      }
  }
}
