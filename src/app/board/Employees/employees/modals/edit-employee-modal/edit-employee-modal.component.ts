import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Utils } from '@Schoolingo/utils';

@Component({
  selector: 'edit-employee-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './edit-employee-modal.component.html',
  styleUrls: ['./edit-employee-modal.component.css']
})
export class EditEmployeeModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public Utils = Utils;

  public data: any;

  public roles = [
    'teacher',
    'admin_staff',
    'management',
    'personnel',
    'maintenance',
    'other'
  ];

  public contractTypes = [
    { value: 'fulltime', label: 'Plný úvazek' },
    { value: 'parttime', label: 'Částečný úvazek' },
    { value: 'dpp', label: 'DPP' },
    { value: 'dpc', label: 'DPČ' }
  ];

  public roleLabel(role: string): string {
    if (role == "other") {
      return this.l.s('employees.add_employee.roles.' + role)
    }
    // Try to get gender from employee data or default to male
    const gender = this.employee.gender == 1 ? 'female' : 'male'; 
    return this.l.s('employees.add_employee.roles.' + role + '_' + gender);
  }

  public getContractTypeLabel(type: string | null): string {
    return this.contractTypes.find(t => t.value === type)?.label || 'Neuvedeno';
  }

  public employee: any = {
    personId: 0,
    firstName: '',
    lastName: '',
    gender: 0,
    role: '',
    cabinet: null as number | null,
    department: '' as string | null,
    contractType: null as string | null
  };

  ngOnInit() {
    this.data = this.modalManager.getModalData('edit_employee');
    if (this.data && this.data.employee) {
      this.employee = { ...this.data.employee };
    }
  }

  submitEditEmployee() {
    this.http.put(
      `${Config.API_URL}/v1/employees/${this.employee.personId}`,
      {
        role: this.employee.role,
        cabinet: this.employee.cabinet,
        department: this.employee.department,
        contractType: this.employee.contractType
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.modalManager.closeModal('edit_employee');
        alert('Zaměstnanec byl úspěšně upraven');
        if (this.data.onSave) {
          this.data.onSave();
        }
      },
      error: (error) => {
        console.error('Failed to update employee:', error);
        const errorMsg = error.error?.error || 'Nepodařilo se upravit zaměstnance';
        alert(`Chyba: ${errorMsg}`);
      }
    });
  }

  close() {
    this.modalManager.closeModal('edit_employee');
  }
}
