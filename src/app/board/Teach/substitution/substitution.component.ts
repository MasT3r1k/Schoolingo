import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { SubstitutionService, Substitution } from '../../../infrastructure/substitution/substitution.service';
import { Permission } from '@Schoolingo/permission';
import { Utils } from '@Schoolingo/utils';
import { BehaviorSubject } from 'rxjs';
import { TabsComponent } from '../../../Components/Tabs';

export enum SubstitutionPage {
  ALL,
  CANCELLED,
  SUBSTITUTION,
  ROOM_CHANGE
}

@Component({
  selector: 'app-substitution',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    TabsComponent
  ],
  templateUrl: './substitution.component.html',
  styleUrl: './substitution.component.css'
})
export class SubstitutionComponent implements OnInit {
  public l = inject(Locale);
  public substitutionService = inject(SubstitutionService);
  public perm = inject(Permission);
  public Utils = Utils;

  // Date management
  public currentDate = signal(new Date());
  public weekDays = signal<Date[]>([]);

  // Data
  public allSubstitutions = signal<Substitution[]>([]); // Full list for stats
  public loading = signal(true);

  // Filters
  public pages = ['all', 'cancelled', 'substitution', 'room_change'];
  public selectedTab = new BehaviorSubject<number>(0);
  public filterOptions = ['substitution.filters.all', 'substitution.filters.by_type'];
  public selectedType = signal<string>('all');
  public searchQuery = signal('');

  // Modal state
  public showCreateModal = signal(false);
  public editingSubstitution = signal<Substitution | null>(null);

  // Form model
  public formData = {
    lessonId: null as number | null,
    type: 'substitution' as 'cancelled' | 'cancelled_hour' | 'substitution' | 'room_change' | 'other',
    substituteTeacherId: null as number | null,
    newRoom: '',
    note: ''
  };

  ngOnInit(): void {
    this.generateWeekDays();

    // Reload when tab (type filter) changes
    this.selectedTab.subscribe(() => {
      this.loadSubstitutions();
    });
  }

  private generateWeekDays(): void {
    const startOfWeek = this.getStartOfWeek(this.currentDate());
    const days = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
    this.weekDays.set(days);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  public loadSubstitutions(): void {
    this.loading.set(true);
    const startOfWeek = this.weekDays()[0];
    const endOfWeek = this.weekDays()[4];

    if (!startOfWeek || !endOfWeek) return;

    const startStr = Utils.makeMoment(startOfWeek).format('YYYY-MM-DD');
    const endStr = Utils.makeMoment(endOfWeek).format('YYYY-MM-DD');

    // Always load ALL for the week to populate stats
    this.substitutionService.loadSubstitutions(startStr, endStr, 'all').subscribe({
      next: (data: Substitution[]) => {
        this.allSubstitutions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  public previousWeek(): void {
    const date = new Date(this.currentDate());
    date.setDate(date.getDate() - 7);
    this.currentDate.set(date);
    this.generateWeekDays();
    this.loadSubstitutions();
  }

  public nextWeek(): void {
    const date = new Date(this.currentDate());
    date.setDate(date.getDate() + 7);
    this.currentDate.set(date);
    this.generateWeekDays();
    this.loadSubstitutions();
  }

  public goToToday(): void {
    this.currentDate.set(new Date());
    this.generateWeekDays();
    this.loadSubstitutions();
  }

  // Getters for stats
  public getTotalCount(): number {
    return this.allSubstitutions().length;
  }

  public getCancelledCount(): number {
    return this.allSubstitutions().filter(s => s.type === 'cancelled').length;
  }

  public getSubstitutionCount(): number {
    return this.allSubstitutions().filter(s => s.type === 'substitution').length;
  }

  public getRoomChangeCount(): number {
    return this.allSubstitutions().filter(s => s.type === 'room_change').length;
  }

  public getFilteredSubstitutions(): Substitution[] {
    const all = this.allSubstitutions();
    if (!all) return [];
    let filtered = [...all];

    // Filter by type (tab)
    if (this.selectedTab.getValue() !== 0) {
      const type = this.pages[this.selectedTab.getValue()];
      filtered = filtered.filter(s => {
        // More robust type check
        if (type === 'cancelled') {
            return s.type === 'cancelled' || s.type === 'cancelled_hour' || !s.subjectName;
        }
        return s.type === type;
      });
    }

    // Filter by search
    const query = (this.searchQuery() || '').toLowerCase();
    if (query) {
      filtered = filtered.filter(s =>
        s.subjectName?.toLowerCase().includes(query) ||
        s.originalTeacher?.toLowerCase().includes(query) ||
        s.substituteTeacher?.toLowerCase().includes(query) ||
        s.className?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  public getTypeIcon(type: string): string {
    switch (type) {
      case 'cancelled':
      case 'cancelled_hour':
        return 'x';
      case 'substitution': return 'user-check';
      case 'room_change': return 'door';
      default: return 'info-circle';
    }
  }

  public getTypeLabel(type: string): string {
    switch (type) {
      case 'cancelled':
      case 'cancelled_hour':
        return this.l.s('substitution.types.cancelled');
      case 'substitution': return this.l.s('substitution.types.substitution');
      case 'room_change': return this.l.s('substitution.types.room_change');
      default: return this.l.s('substitution.types.other');
    }
  }

  public getTypeClass(type: string): string {
    switch (type) {
      case 'cancelled':
      case 'cancelled_hour':
        return 'badge--danger';
      case 'substitution': return 'badge--warning';
      case 'room_change': return 'badge--info';
      default: return 'badge--neutral';
    }
  }

  public openCreateModal(): void {
    this.resetForm();
    this.showCreateModal.set(true);
  }

  public openEditModal(sub: Substitution): void {
    this.editingSubstitution.set(sub);
    this.formData = {
      lessonId: null,
      type: sub.type,
      substituteTeacherId: null,
      newRoom: '',
      note: sub.note || ''
    };
    this.showCreateModal.set(true);
  }

  public closeModal(): void {
    this.showCreateModal.set(false);
    this.editingSubstitution.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      lessonId: null,
      type: 'substitution',
      substituteTeacherId: null,
      newRoom: '',
      note: ''
    };
  }

  /** Returns substitutions grouped by day, sorted chronologically. */
  public getSubstitutionsByDay(): { date: string; items: Substitution[] }[] {
    const filtered = this.getFilteredSubstitutions();
    const map = new Map<string, Substitution[]>();

    for (const sub of filtered) {
      const key = Utils.makeMoment(sub.date).format('YYYY-MM-DD');

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(sub);
    }

    // Sort days and items within each day by hour
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => (a.hour ?? 0) - (b.hour ?? 0))
      }));
  }

  public formatTime(hour: number): string {
    return `${hour}:00`;
  }

  public formatDateDisplay(): string {
    const days = this.weekDays();
    if (days.length === 0) return '';
    
    return `${Utils.makeMoment(days[0]).format('D. M.')} - ${Utils.makeMoment(days[4]).format('D. M. YYYY')}`;
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }
}
