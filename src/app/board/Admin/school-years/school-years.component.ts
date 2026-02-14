import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { EditYearComponent } from './modals/edit-year/edit-year.component';

export interface SchoolYear {
  syId: number;
  start: string;
  end: string;
  midterm: string;
  current: boolean;
}

@Component({
  selector: 'app-school-years',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './school-years.component.html',
  styleUrls: ['./school-years.component.css']
})
export class SchoolYearsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);

  public years: SchoolYear[] = [];
  public isLoading = true;
  public error: string | null = null;

  ngOnInit(): void {
    this.loadYears();
    
    this.modalManager.addModal('edit_year', {
      title: this.l.s('admin.schoolYears.new') || 'Nový školní rok',
      closeable: true,
      width: 500,
      items: [
        {
          type: 'component',
          component: EditYearComponent
        }
      ]
    });
  }

  loadYears(): void {
    this.isLoading = true;
    this.error = null;
    this.http.get<SchoolYear[]>(`${Config.API_URL}/v1/school/years`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.years = data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load school years.';
          this.isLoading = false;
        }
      });
  }

  openCreateModal(): void {
    this.modalManager.updateModal('edit_year', 'title', this.l.s('admin.schoolYears.new') || 'Nový školní rok');
    this.modalManager.openModal('edit_year', {
      onSave: () => this.loadYears()
    });
  }

  openEditModal(year: SchoolYear): void {
    this.modalManager.updateModal('edit_year', 'title', this.l.s('admin.schoolYears.edit') || 'Upravit školní rok');
    this.modalManager.openModal('edit_year', {
      year: year,
      onSave: () => this.loadYears()
    });
  }

  setAsCurrent(year: SchoolYear): void {
    if (year.current) return;
    
    // Optimistic update
    const previousCurrent = this.years.find(y => y.current);
    if (previousCurrent) previousCurrent.current = false;
    year.current = true;

    this.http.put(`${Config.API_URL}/v1/school/years/${year.syId}`, { 
      start: year.start, 
      end: year.end, 
      midterm: year.midterm, 
      current: true 
    }, { withCredentials: true })
    .subscribe({
      next: () => this.loadYears(),
      error: () => {
        alert('Failed to update current year');
        // Revert optimistic update
        year.current = false;
        if (previousCurrent) previousCurrent.current = true;
      }
    });
  }

  deleteYear(id: number): void {
    if(!confirm('Are you sure you want to delete this school year? This action cannot be undone.')) return;

    this.http.delete(`${Config.API_URL}/v1/school/years/${id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loadYears();
        },
        error: () => alert('Failed to delete school year')
      });
  }
}
