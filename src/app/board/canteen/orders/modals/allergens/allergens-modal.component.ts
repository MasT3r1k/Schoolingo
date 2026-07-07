import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { CheckboxComponent } from '@Components/Checkbox';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../../../../infrastructure/config';
import { Authentication } from '@Schoolingo/authentication';

@Component({
  selector: 'app-allergens-modal',
  standalone: true,
  imports: [CommonModule, IconsModule, CheckboxComponent],
  templateUrl: './allergens-modal.component.html',
  styleUrls: ['./allergens-modal.component.css']
})
export class AllergensModalComponent implements OnInit {
  l = inject(Locale);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);
  
  selectedAllergens: string[] = [];
  submitting = false;

  ngOnInit() {
    const data = this.modalManager.getModalData('allergens-modal');
    if (data && data.allergens) {
      this.selectedAllergens = [...data.allergens];
    }
  }

  toggleAllergen(id: string) {
    const idx = this.selectedAllergens.indexOf(id);
    if (idx > -1) {
      this.selectedAllergens.splice(idx, 1);
    } else {
      this.selectedAllergens.push(id);
    }
  }

  close() {
    this.modalManager.closeModal('allergens-modal');
  }

  save() {
    this.http.post(
      Config.API_URL + '/v1/canteen/allergens',
      { allergen: this.selectedAllergens },
      { withCredentials: true }
    )
    .subscribe((data) => {
      
    })

    const data = this.modalManager.getModalData('allergens-modal');
    if (data && data.refreshCallback) {
      data.refreshCallback(this.selectedAllergens);
    }
    this.close();
  }
}
