import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'add-bonus-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './add-bonus-modal.component.html',
  styleUrls: ['./add-bonus-modal.component.css']
})
export class AddBonusModalComponent {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);

  public bonusTypes = [
    { value: 'performance', label: 'Výkon' },
    { value: 'project', label: 'Projekt' },
    { value: 'holiday', label: 'Svátky' },
    { value: 'other', label: 'Ostatní' }
  ];

  public newBonus = {
    personId: 0,
    type: 'performance',
    amount: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0]
  };

  submitNewBonus() {
    if (!this.newBonus.amount || this.newBonus.amount <= 0) {
      alert('Zadejte platnou částku');
      return;
    }

    if (!this.newBonus.reason) {
      alert('Zadejte důvod prémie');
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/employees/bonuses`,
      this.newBonus,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.modalManager.closeModal('add_bonus');
        this.resetForm();
        alert('Prémie byla úspěšně přidána');
        window.location.reload();
      },
      error: (error) => {
        console.error('Failed to add bonus:', error);
        const errorMsg = error.error?.error || 'Nepodařilo se přidat prémii';
        alert(`Chyba: ${errorMsg}`);
      }
    });
  }

  resetForm() {
    this.newBonus = {
      personId: 0,
      type: 'performance',
      amount: 0,
      reason: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  close() {
    this.modalManager.closeModal('add_bonus');
  }
}
