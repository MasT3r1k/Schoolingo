import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-canteen-delete-meal-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './delete-meal-modal.component.html',
  styleUrl: './delete-meal-modal.component.css'
})
export class CanteenDeleteMealModalComponent implements OnInit {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public l = inject(Locale);

  public meal: any;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('canteen-delete-meal-modal');
    this.meal = data?.meal;
  }

  confirmDelete() {
    if (!this.meal) return;
    this.http.delete(`${Config.API_URL}/v1/canteen/meal/${this.meal.meal_id}`, { withCredentials: true })
      .subscribe(() => {
        const data = this.modalManager.getModalData('canteen-delete-meal-modal');
        if (data?.refreshCallback) {
          data.refreshCallback();
        }
        this.closeModal();
      });
  }

  closeModal() {
    this.modalManager.closeModal('canteen-delete-meal-modal');
  }
}
