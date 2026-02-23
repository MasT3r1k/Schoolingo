import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Utils } from '@Schoolingo/utils';
import { School } from '@Schoolingo/school';
import { Timetable } from '../../../../../infrastructure/timetable/timetable';
import { SharedTimetableComponent } from '../../../../../Components/timetable/timetable.component';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, SharedTimetableComponent],
  template: `
    @if (generatingPdf) {
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; flex-direction: column;">
            <div class="loader" style="width: 48px; height: 48px; border-width: 4px; border-color: #fff; border-top-color: transparent;"></div>
            <p style="margin-top: 20px; color: #fff; font-size: 18px; font-weight: 500;">{{ l.s('timetable.generating_pdf') }}</p>
        </div>
    }
    <div class="timetable-container" [class.loading]="isLoading">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <div class="item-btn text" (click)="exportPdf()" style="cursor: pointer; display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; background: hsla(213, 100%, 50%, .12); border-radius: 8px; color: #3b82f6;">
            <div class="icon" style="display: flex;">
                <i-tabler name="printer"></i-tabler>
            </div>
        </div>
      </div>
      <schoolingo-timetable
          [isLoading]="isLoading"
          [timetable]="timetable"
          [timetableHours]="timetableHours"
          [selectedWeek]="selectedWeek"
          [selectedTab]="0"
          type="room"
      ></schoolingo-timetable>
    </div>
  `,
  styles: [`
    .timetable-container {
      min-height: 300px;
      padding: 1rem;
      overflow-x: auto;
    }
  `]
})
export class RoomTimetableModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public school = inject(School);
  public Utils = Utils;
  private modalManager = inject(ModalManager);
  private timetableService = inject(Timetable);

  public room: any;
  public isLoading = true;
  public generatingPdf = false;
  public timetable: any[] = [];
  public timetableHours: any[] = [];
  public selectedWeek = moment();

  ngOnInit(): void {
    const data = this.modalManager.getModalData('room-timetable-modal');
    if (data && data.room) {
      this.room = data.room;
      this.loadTimetable();
    }
  }

  loadTimetable(): void {
    if (!this.room) return;
    this.isLoading = true;

    const { timetable, timetableHours, isLoading } = this.timetableService.getTimetable(
        'room',
        this.room.room_id,
        this.selectedWeek,
        0
    );

    isLoading.subscribe(loading => this.isLoading = loading);
    timetable.subscribe(data => this.timetable = data);
    timetableHours.subscribe(data => this.timetableHours = data);
  }

  public exportPdf(): void {
    this.generatingPdf = true;
    const data = {
      type: 'rozvrh',
      timetableData: {
        timetable: this.timetable,
        timetableHours: this.timetableHours,
        selectedTab: 0, // Current week view
        timetableSelectedWeek: this.selectedWeek.format('YYYY-MM-DD'),
        targetType: 'room',
        targetId: this.room.room_id
      }
    };

    this.http.post(Config.API_URL + '/documents/generate', data, {
      withCredentials: true,
      responseType: 'blob'
    }).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        this.generatingPdf = false;
      },
      error: () => {
        this.generatingPdf = false;
      }
    });
  }
}
