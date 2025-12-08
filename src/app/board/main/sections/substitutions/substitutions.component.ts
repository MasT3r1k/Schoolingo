import { Component, inject, OnInit } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import { SubstitutionService, Substitution } from '../../../../infrastructure/substitution/substitution.service';
import moment from 'moment';

@Component({
  selector: 'app-substitutions',
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './substitutions.component.html',
  styleUrl: './substitutions.component.css'
})
export class SubstitutionsComponent implements OnInit {
  public substitutionService = inject(SubstitutionService);
  public l = inject(Locale);
  
  public substitutions: Substitution[] = [];
  public isLoading = true;

  ngOnInit(): void {
    this.loadSubstitutions();
  }

  public loadSubstitutions(): void {
    this.isLoading = true;
    this.substitutionService.loadSubstitutions().subscribe({
      next: (data) => {
        this.substitutions = data.slice(0, 5); // Limit to 5 for dashboard
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public formatDate(date: string | Date): string {
    if (!date) return '';
    const d = moment(date);
    const now = moment();
    
    if (d.isSame(now, 'day')) return 'Dnes';
    if (d.isSame(moment().add(1, 'day'), 'day')) return 'Zítra';
    return d.format('D. M.');
  }

  public getSubstitutionType(sub: Substitution): string {
    if (sub.type === 'cancelled') return 'cancelled';
    if (sub.type === 'room_change') return 'room-change';
    if (sub.type === 'substitution') return 'teacher-change';
    return 'other';
  }

  public getTypeIcon(sub: Substitution): string {
    if (sub.type === 'cancelled') return 'calendar-x';
    if (sub.type === 'room_change') return 'door';
    if (sub.type === 'substitution') return 'user-minus';
    return 'refresh';
  }

  public getTypeLabel(sub: Substitution): string {
    if (sub.type === 'cancelled') return 'Odpadá';
    if (sub.type === 'room_change') return 'Změna místnosti';
    if (sub.type === 'substitution') return 'Suplování';
    return 'Změna';
  }
}

