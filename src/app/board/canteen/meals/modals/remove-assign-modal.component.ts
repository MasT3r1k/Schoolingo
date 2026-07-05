import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-canteen-remove-assign-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './remove-assign-modal.component.html',
  styleUrl: './remove-assign-modal.component.css'
})
export class CanteenRemoveAssignModalComponent implements OnInit {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public l = inject(Locale);

  public date = '';
  public variantIndex = 1;
  public mealName = '';

  ngOnInit(): void {
    const data = this.modalManager.getModalData('canteen-remove-assign-modal');
    if (data) {
      this.date = data.date;
      this.variantIndex = data.variant;
      this.mealName = data.mealName || '';
    }
  }

  formatDate(d: string): string {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  confirmRemove() {
    const payload = {
      date: this.date,
      variant_index: this.variantIndex,
      meal_id: null
    };

    this.http.post(`${Config.API_URL}/v1/canteen/menu`, payload, { withCredentials: true })
      .subscribe(() => {
        const data = this.modalManager.getModalData('canteen-remove-assign-modal');
        if (data?.refreshCallback) {
          data.refreshCallback();
        }
        this.closeModal();
      });
  }

  closeModal() {
    this.modalManager.closeModal('canteen-remove-assign-modal');
  }
}
