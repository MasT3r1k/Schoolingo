import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { RouterLink } from '@angular/router';
import { ModalManager } from '@Schoolingo/modal';
import { AddClassComponent } from './modals/add-class/add-class.component';
import { RemoveClassComponent } from './modals/remove-class/remove-class.component';

export interface ClassItem {
  id: number;
  name: string;
  year: number;
  fieldOfStudy: string;
  headTeacher: string;
  headTeacherAvatar?: string | null;
  classroom: string;
  studentsCount: number;
}

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, RouterLink],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.css'
})
export class ClassesComponent implements OnInit {
  private http = inject(HttpClient);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  public modalManager = inject(ModalManager);

  isLoading = false;
  loadError: string | null = null;
  searchStr = '';

  classes: ClassItem[] = [];

  filters = {
    fieldOfStudy: null as string | null,
    year: null as number | null,
    headTeacher: null as string | null
  };

  get availableFieldsOfStudy(): string[] {
    return [...new Set(this.classes.map(c => c.fieldOfStudy).filter(Boolean))].sort();
  }

  get availableYears(): number[] {
    return [...new Set(this.classes.map(c => c.year).filter(Boolean))].sort((a, b) => a - b);
  }

  get availableHeadTeachers(): string[] {
    return [...new Set(this.classes.map(c => c.headTeacher).filter(Boolean))].sort();
  }

  clearFilters() {
    this.filters.fieldOfStudy = null;
    this.filters.year = null;
    this.filters.headTeacher = null;
    this.searchStr = '';
  }

  ngOnInit() {
    this.loadClasses();

    this.modalManager.addModal(
      'add_class',
      {
        icon: 'chalkboard',
        title: 'Přidat novou třídu',
        description: 'Vytvořte novou třídu a nastavte základní parametry.',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: AddClassComponent
        }]
      }
    );

    this.modalManager.addModal(
      'remove_class',
      {
        icon: 'trash',
        title: 'Odstranění třídy',
        description: 'Vyberte způsob, jakým chcete třídu odstranit ze systému.',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: RemoveClassComponent
        }]
      }
    );
  }

  loadClasses() {
    this.isLoading = true;
    this.loadError = null;

    this.http.get<any>(`${Config.API_URL}/v1/school/classes`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.classes = response.data || response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading classes:', error);
          this.loadError = 'Nepodařilo se načíst spojení s databází pro třídy.';
          this.isLoading = false;
        }
      });
  }

  get filteredClasses() {
    return this.classes.filter(c => {
      // Search text
      if (this.searchStr) {
        const lower = this.searchStr.toLowerCase();
        const matchesSearch = c.name.toLowerCase().includes(lower) || 
          (c.fieldOfStudy && c.fieldOfStudy.toLowerCase().includes(lower)) ||
          (c.headTeacher && c.headTeacher.toLowerCase().includes(lower));
        if (!matchesSearch) return false;
      }
      
      // Dropdown filters
      if (this.filters.fieldOfStudy && c.fieldOfStudy !== this.filters.fieldOfStudy) return false;
      if (this.filters.year && c.year !== this.filters.year) return false;
      if (this.filters.headTeacher && c.headTeacher !== this.filters.headTeacher) return false;
      
      return true;
    });
  }

  openAddClassModal() {
    this.modalManager.openModal('add_class');
  }

  deleteClass(cls: ClassItem) {
    this.modalManager.openModal('remove_class', { class: cls });
  }
}
