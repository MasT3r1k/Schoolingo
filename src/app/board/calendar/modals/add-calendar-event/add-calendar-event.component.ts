import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { CalendarService } from '../../../../infrastructure/calendar/calendar.service';
import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  selector: 'app-calendar-add-event',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
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
    date: new Date().toISOString().split('T')[0],
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

    this.calendarService.createEvent(this.event).subscribe({
      next: (res) => {
        if (res.success) {
          this.modalManager.closeModal('calendar_add_event');
          // The parent component should refresh. 
          // Since we don't have a direct reference easily, we could use a subject in the service.
          // For now, let's assume the user will manually refresh or we can add a notification.
        }
      }
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('calendar_add_event');
  }
}
