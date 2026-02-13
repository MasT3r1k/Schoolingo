import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';

interface SchoolYear {
  syId: number;
  start: string;
  end: string;
  midterm: string;
  current: boolean;
}

@Component({
  selector: 'app-school-years',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './school-years.component.html',
  styleUrls: ['./school-years.component.css']
})
export class SchoolYearsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  public years: SchoolYear[] = [];
  public isLoading = true;
  public showModal = false;
  public isEditing = false;
  public editingId: number | null = null;
  public error: string | null = null;

  public form: FormGroup = this.fb.group({
    start: ['', Validators.required],
    end: ['', Validators.required],
    midterm: ['', Validators.required],
    current: [false]
  });

  ngOnInit(): void {
    this.loadYears();
  }

  loadYears(): void {
    this.isLoading = true;
    this.error = null;
    this.http.get<SchoolYear[]>(`${Config.API_URL}/api/v1/school/years`, { withCredentials: true })
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
    this.isEditing = false;
    this.editingId = null;
    this.form.reset({ current: false });
    this.showModal = true;
  }

  openEditModal(year: SchoolYear): void {
    this.isEditing = true;
    this.editingId = year.syId;
    
    const formatDate = (dateStr: string) => dateStr ? dateStr.split('T')[0] : '';
    
    this.form.patchValue({
      start: formatDate(year.start),
      end: formatDate(year.end),
      midterm: formatDate(year.midterm),
      current: year.current
    });
    this.showModal = true;
  }

  setAsCurrent(year: SchoolYear): void {
    if (year.current) return;
    
    // Optimistic update
    const previousCurrent = this.years.find(y => y.current);
    if (previousCurrent) previousCurrent.current = false;
    year.current = true;

    this.http.put(`${Config.API_URL}/api/v1/school/years/${year.syId}`, { 
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

    this.http.delete(`${Config.API_URL}/api/v1/school/years/${id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loadYears();
        },
        error: () => alert('Failed to delete school year')
      });
  }

  save(): void {
    if (this.form.invalid) return;

    const data = this.form.value;
    const request = this.isEditing && this.editingId
      ? this.http.put(`${Config.API_URL}/api/v1/school/years/${this.editingId}`, data, { withCredentials: true })
      : this.http.post(`${Config.API_URL}/api/v1/school/years`, data, { withCredentials: true });

    request.subscribe({
      next: () => {
        this.showModal = false;
        this.loadYears();
      },
      error: () => alert('Failed to save school year')
    });
  }
}
