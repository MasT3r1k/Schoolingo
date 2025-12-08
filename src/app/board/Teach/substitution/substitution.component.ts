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
  public formattedDate = signal('');

  // Data
  public substitutions = signal<Substitution[]>([]);
  public loading = signal(true);

  // Filters
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
    type: 'substitution' as 'cancelled' | 'substitution' | 'room_change' | 'other',
    substituteTeacherId: null as number | null,
    newRoom: '',
    note: ''
  };

  ngOnInit(): void {
    this.updateFormattedDate();
    this.loadSubstitutions();
  }

  private updateFormattedDate(): void {
    const date = this.currentDate();
    this.formattedDate.set(date.toISOString().split('T')[0]);
  }

  public loadSubstitutions(): void {
    this.loading.set(true);
    this.substitutionService.loadSubstitutions(this.formattedDate()).subscribe({
      next: (data: Substitution[]) => {
        this.substitutions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  public previousDay(): void {
    const date = new Date(this.currentDate());
    date.setDate(date.getDate() - 1);
    this.currentDate.set(date);
    this.updateFormattedDate();
    this.loadSubstitutions();
  }

  public nextDay(): void {
    const date = new Date(this.currentDate());
    date.setDate(date.getDate() + 1);
    this.currentDate.set(date);
    this.updateFormattedDate();
    this.loadSubstitutions();
  }

  public goToToday(): void {
    this.currentDate.set(new Date());
    this.updateFormattedDate();
    this.loadSubstitutions();
  }

  // Getters for stats
  public getTotalCount(): number {
    return this.getFilteredSubstitutions().length;
  }

  public getCancelledCount(): number {
    return this.substitutions().filter(s => s.type === 'cancelled').length;
  }

  public getSubstitutionCount(): number {
    return this.substitutions().filter(s => s.type === 'substitution').length;
  }

  public getRoomChangeCount(): number {
    return this.substitutions().filter(s => s.type === 'room_change').length;
  }

  public getFilteredSubstitutions(): Substitution[] {
    let filtered = this.substitutions();

    // Filter by type
    if (this.selectedType() !== 'all') {
      filtered = filtered.filter(s => s.type === this.selectedType());
    }

    // Filter by search
    const query = this.searchQuery().toLowerCase();
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
      case 'cancelled': return 'x';
      case 'substitution': return 'user-check';
      case 'room_change': return 'door';
      default: return 'info-circle';
    }
  }

  public getTypeLabel(type: string): string {
    switch (type) {
      case 'cancelled': return this.l.s('substitution.types.cancelled');
      case 'substitution': return this.l.s('substitution.types.substitution');
      case 'room_change': return this.l.s('substitution.types.room_change');
      default: return this.l.s('substitution.types.other');
    }
  }

  public getTypeClass(type: string): string {
    switch (type) {
      case 'cancelled': return 'badge--danger';
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

  public canManageSubstitutions(): boolean {
    return this.perm.checkPermission(['teacher', 'manager:schedule:manage']);
  }

  public formatTime(hour: number): string {
    return `${hour}:00`;
  }

  public formatDateDisplay(): string {
    const date = this.currentDate();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(date, today)) {
      return this.l.s('substitution.today');
    } else if (this.isSameDay(date, tomorrow)) {
      return this.l.s('substitution.tomorrow');
    } else if (this.isSameDay(date, yesterday)) {
      return this.l.s('substitution.yesterday');
    }

    return Utils.formatDate(date);
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }
}
