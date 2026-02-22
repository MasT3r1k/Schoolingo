import { Component, inject, OnInit } from '@angular/core';
import { DropdownManager } from '@Schoolingo/dropdown';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';

@Component({
  selector: 'set-salary-modal',
  standalone: true,
  imports: [FormsModule, IconsModule, CalendarComponent],
  templateUrl: './set-salary-modal.component.html',
  styleUrls: ['./set-salary-modal.component.css']
})
export class SetSalaryModalComponent implements OnInit {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public data: any;
  public employees: any[] = [];

  public newSalary = {
    teacherId: 0,
    salary: 0,
    currency: 'CZK',
    role: '',
    validFrom: moment(),
    validTo: null as moment.Moment | null,
    deductions: 0
  };

  ngOnInit() {
    this.data = this.modalManager.getModalData('set_salary');
    if (this.data && this.data.personId) {
      this.newSalary.teacherId = this.data.personId;
    }
    this.loadEmployees();
  }

  loadEmployees() {
    this.http.get<{ data: any[] }>(`${Config.API_URL}/v1/employees`, { withCredentials: true }).subscribe({
      next: (resp) => this.employees = resp.data
    });
  }

  submitNewSalary() {
    if (!this.newSalary.teacherId) {
      alert('Vyberte zaměstnance');
      return;
    }

    if (!this.newSalary.salary || this.newSalary.salary <= 0) {
      alert('Zadejte platnou částku platu');
      return;
    }

    if (!this.newSalary.validFrom) {
      alert('Zadejte datum platnosti');
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/employees/salaries`,
      {
        ...this.newSalary,
        validFrom: this.newSalary.validFrom.format('YYYY-MM-DD'),
        validTo: this.newSalary.validTo ? this.newSalary.validTo.format('YYYY-MM-DD') : null
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.modalManager.closeModal('set_salary');
        this.resetForm();
        alert('Plat byl úspěšně nastaven');
        if (this.data && this.data.onSave) {
          this.data.onSave();
        } else {
          window.location.reload();
        }
      },
      error: (error) => {
        console.error('Failed to set salary:', error);
        const errorMsg = error.error?.error || 'Nepodařilo se nastavit plat';
        alert(`Chyba: ${errorMsg}`);
      }
    });
  }

  resetForm() {
    this.newSalary = {
      teacherId: this.data?.personId || 0,
      salary: 0,
      role: '',
      currency: 'CZK',
      validFrom: moment(),
      validTo: null,
      deductions: 0
    };
  }

  close() {
    this.modalManager.closeModal('set_salary');
  }
}
