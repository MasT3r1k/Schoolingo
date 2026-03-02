import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { Locale } from '@Schoolingo/locale';
import { ClassItem } from '../classes.component';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterLink],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  public Utils = Utils;
  public l = inject(Locale);

  classId: number | null = null;
  classData: ClassItem | null = null;
  students: any[] = [];
  
  isLoading = true;
  loadError: string | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.classId = parseInt(id, 10);
        this.loadClassDetail();
      }
    });
  }

  loadClassDetail() {
    this.isLoading = true;
    this.loadError = null;

    // Load classes to get details of the current class
    this.http.get<any>(`${Config.API_URL}/v1/school/classes`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          const classes = response.data || response;
          this.classData = classes.find((c: ClassItem) => c.id === this.classId) || null;
          
          if (!this.classData) {
            this.loadError = 'Třída nebyla nalezena.';
            this.isLoading = false;
          } else {
            this.loadStudents();
          }
        },
        error: (error) => {
          console.error('Error loading class details:', error);
          this.loadError = 'Nepodařilo se načíst detaily třídy.';
          this.isLoading = false;
        }
      });
  }

  loadStudents() {
    // Load students for this class
    this.http.get<any>(`${Config.API_URL}/v1/students`, {
      params: { classId: this.classId?.toString() || '' },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.students = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'former': return 'status-former';
      case 'suspended': return 'status-suspended';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Aktivní';
      case 'former': return 'Bývalý';
      case 'suspended': return 'Pozastaven';
      default: return status;
    }
  }

  getGradeClass(grade: string | null): string {
    if (!grade) return 'grade-none';
    const parsed = parseFloat(grade);
    if (isNaN(parsed)) return 'grade-none';
    
    if (parsed <= 2.0) return 'grade-excellent';
    if (parsed <= 3.0) return 'grade-good';
    if (parsed <= 4.0) return 'grade-fair';
    return 'grade-poor';
  }
}
