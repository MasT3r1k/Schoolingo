import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';

export type Genders = 'male' | 'female'; 

@Component({
  selector: 'add-employee-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './add-employee-modal.component.html',
  styleUrls: ['./add-employee-modal.component.css']
})
export class AddEmployeeModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

  public genders: Genders[] = ['male', 'female'];
  public selected_gender: Genders = 'male';

  public roles = [
    'teacher',
    'admin_staff',
    'management',
    'personnel',
    'maintenance',
    'other'
  ];
  public roleLabel(role: string): string {
    if (role == "other") {
      return this.l.s('employees.add_employee.roles.' + role)
    }
    return this.l.s('employees.add_employee.roles.' + role + '_' + this.selected_gender);
  }
  public selected_role = 'teacher';

  public genderIcon(gender: Genders): string {
    return 'gender-' + gender;
  }

  public genderColor(gender: Genders): string {
    switch(gender) {
      case 'male':
        return '#90D5FF';
      case 'female':
        return '#FFC0CB';
    }
  }

  public degrees: any[] = [];
  public selectedDegrees: number[] = [];
  public showAddDegreeForm = false;
  public newDegree = {
    shortcut: '',
    degree: '',
    isBefore: true,
    weight: 10
  };

  public newEmployee = {
    firstName: '',
    lastName: '',
    gender: 0,
    birthday: '',
    email: '',
    phone: '',
    phoneCode: 420,
    role: '',
    cabinet: null as number | null,
    degrees: [] as number[]
  };

  ngOnInit() {
    this.loadDegrees();
  }

  loadDegrees() {
    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/degrees`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.degrees = response.data;
      },
      error: (error) => {
        console.error('Failed to load degrees:', error);
      }
    });
  }

  toggleDegree(degreeId: number) {
    const index = this.newEmployee.degrees.indexOf(degreeId);
    if (index > -1) {
      this.newEmployee.degrees.splice(index, 1);
    } else {
      this.newEmployee.degrees.push(degreeId);
    }
  }

  isDegreeSelected(degreeId: number): boolean {
    return this.newEmployee.degrees.includes(degreeId);
  }

  submitNewDegree() {
    if (!this.newDegree.shortcut || !this.newDegree.degree) {
      alert('Vyplňte zkratku a název titulu');
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/employees/degrees`,
      this.newDegree,
      { withCredentials: true }
    ).subscribe({
      next: (response: any) => {
        // Add to list and auto-select
        this.degrees.push(response.degree);
        this.newEmployee.degrees.push(response.degree.degreeID);
        // Reset form
        this.cancelAddDegree();
      },
      error: (error) => {
        console.error('Failed to add degree:', error);
        alert('Nepodařilo se přidat titul');
      }
    });
  }

  cancelAddDegree() {
    this.showAddDegreeForm = false;
    this.newDegree = {
      shortcut: '',
      degree: '',
      isBefore: true,
      weight: 10
    };
  }

  submitNewEmployee() {
    if (!this.newEmployee.firstName || !this.newEmployee.lastName) {
      alert('Vyplňte jméno a příjmení');
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/employees`,
      this.newEmployee,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.modalManager.closeModal('add_employee');
        // Reset form
        this.newEmployee = { 
          firstName: '',
          lastName: '',
          gender: 0,
          birthday: '',
          email: '',
          phone: '',
          phoneCode: 420,
          role: '',
          cabinet: null,
          degrees: []
        };
        alert('Zaměstnanec byl úspěšně přidán');
        // Reload page or emit event
        window.location.reload();
      },
      error: (error) => {
        console.error('Failed to add employee:', error);
        const errorMsg = error.error?.error || 'Nepodařilo se přidat zaměstnance';
        alert(`Chyba: ${errorMsg}`);
      }
    });
  }

  close() {
    this.modalManager.closeModal('add_employee');
  }
}
