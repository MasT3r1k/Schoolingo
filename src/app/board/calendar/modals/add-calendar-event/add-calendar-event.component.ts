import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { CalendarService } from '../../../../infrastructure/calendar/calendar.service';
import { DropdownManager } from '@Schoolingo/dropdown';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';

@Component({
  selector: 'app-calendar-add-event',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CalendarComponent],
  templateUrl: './add-calendar-event.component.html',
  styleUrl: './add-calendar-event.component.css'
})
export class CalendarAddEventComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private calendarService = inject(CalendarService);
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);

  public event = {
    name: '',
    description: '',
    date: moment(),
    type: 'event',
    classId: null as number | null
  };

  public eventTypes = [
    { id: 'event', name: 'Událost' },
    { id: 'exam', name: 'Zkouška/Test' },
    { id: 'lesson', name: 'Lekce' },
    { id: 'holiday', name: 'Prázdniny' }
  ];

  public classes: { classId: number; className: string }[] = [];
  public selectedClassName = 'Všechny třídy';

  ngOnInit(): void {
    this.calendarService.getClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  public selectClass(classItem: { classId: number; className: string } | null): void {
    if (classItem) {
      this.event.classId = classItem.classId;
      this.selectedClassName = classItem.className;
    } else {
      this.event.classId = null;
      this.selectedClassName = 'Všechny třídy';
    }
    this.dropdownManager.selected_dropdown = '';
  }

  public selectType(type: string): void {
    this.event.type = type;
    this.dropdownManager.selected_dropdown = '';
  }

  public getSelectedTypeName(): string {
    return this.eventTypes.find(t => t.id === this.event.type)?.name || 'Událost';
  }

  public submit(): void {
    if (!this.event.name || !this.event.date) return;

    this.calendarService.createEvent({
      ...this.event,
      date: this.event.date.format('YYYY-MM-DD')
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.calendarService.refresh();
          this.modalManager.closeModal('calendar_add_event');
        }
      }
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('calendar_add_event');
  }
}
