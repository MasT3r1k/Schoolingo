import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';

@Component({
  selector: 'add-student-modal',
  standalone: true,
  imports: [FormsModule, IconsModule, CalendarComponent],
  templateUrl: './add-student-modal.component.html',
  styleUrls: ['./add-student-modal.component.css']
})
export class AddStudentModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

  public addStudentTab: 'manual' | 'ldap' | 'excel' = 'manual';

  public availableClasses: { id: number; name: string }[] = [];
  public availableScopes: { id: number; name: string }[] = [];

  public newStudent = {
    firstName: '',
    lastName: '',
    email: '',
    classId: null as number | null,
    scopeId: null as number | null,
    birthday: moment()
  };

  ngOnInit() {
    this.loadFilters();
  }

  loadFilters() {
    this.http.get<{ classes: { id: number; name: string }[], scopes: { id: number; name: string }[] }>(
        `${Config.API_URL}/v1/students/filters`,
        { withCredentials: true }
    ).subscribe({
        next: (response) => {
            this.availableClasses = response.classes;
            this.availableScopes = response.scopes;
        },
        error: (error) => {
            console.error('Error loading filters in modal:', error);
        }
    });
  }

  setAddStudentTab(tab: typeof this.addStudentTab) {
    this.addStudentTab = tab;
  }

  public selectedClass() {
    return (this.newStudent.classId ? (this.availableClasses.find(c => c.id === this.newStudent.classId)?.name || 'Vyberte třídu') : 'Vyberte třídu')
  }

  public selectedScope() {
    return (this.newStudent.scopeId ? (this.availableScopes.find(s => s.id === this.newStudent.scopeId)?.name || 'Vyberte obor') : 'Vyberte obor')
  }

  submit() {
    if (this.addStudentTab === 'manual') {
        if (!this.newStudent.firstName || !this.newStudent.lastName) {
            alert('Vyplňte jméno a příjmení');
            return;
        }

        // Dummy send logic, API isn't built fully in this snippet, adapt as necessary.
        // Assuming POST /v1/students is similar
        this.http.post(`${Config.API_URL}/v1/students`, {
            ...this.newStudent,
            birthday: this.newStudent.birthday.format('YYYY-MM-DD')
        }, { withCredentials: true }).subscribe({
            next: () => {
                this.close();
                alert('Student přidán.');
                window.location.reload();
            },
            error: (err) => {
                console.error('Failed to add student:', err);
                const msg = err.error?.error || 'Nepodařilo se přidat studenta';
                alert('Chyba: ' + msg);
            }
        });
    } else {
        alert('Tato metoda importu ještě není plně implementována.');
    }
  }

  close() {
    this.modalManager.closeModal('add_student');
  }
}
