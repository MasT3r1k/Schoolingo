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
  selector: 'add-bonus-modal',
  standalone: true,
  imports: [FormsModule, IconsModule, CalendarComponent],
  templateUrl: './add-bonus-modal.component.html',
  styleUrls: ['./add-bonus-modal.component.css']
})
export class AddBonusModalComponent implements OnInit {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

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
    date: moment()
  };

  ngOnInit() {
    const data = this.modalManager.getModalData('add_bonus');
    if (data && data.personId) {
      this.newBonus.personId = data.personId;
    }
  }

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
      {
        ...this.newBonus,
        date: this.newBonus.date.format('YYYY-MM-DD')
      },
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
      personId: this.modalManager.getModalData('add_bonus')?.personId || 0,
      type: 'performance',
      amount: 0,
      reason: '',
      date: moment()
    };
  }

  public selectedType() {
    return this.bonusTypes.find(t => t.value === this.newBonus.type);
  }

  close() {
    this.modalManager.closeModal('add_bonus');
  }
}
