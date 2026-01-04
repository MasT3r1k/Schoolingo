import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'set-salary-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './set-salary-modal.component.html',
  styleUrls: ['./set-salary-modal.component.css']
})
export class SetSalaryModalComponent {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);

  public newSalary = {
    personId: 0,
    amount: 0,
    currency: 'CZK',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: null as string | null,
    deductions: 0
  };

  submitNewSalary() {
    if (!this.newSalary.amount || this.newSalary.amount <= 0) {
      alert('Zadejte platnou částku platu');
      return;
    }

    if (!this.newSalary.validFrom) {
      alert('Zadejte datum platnosti');
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/employees/salaries`,
      this.newSalary,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.modalManager.closeModal('set_salary');
        this.resetForm();
        alert('Plat byl úspěšně nastaven');
        window.location.reload();
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
      personId: 0,
      amount: 0,
      currency: 'CZK',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: null,
      deductions: 0
    };
  }

  close() {
    this.modalManager.closeModal('set_salary');
  }
}
