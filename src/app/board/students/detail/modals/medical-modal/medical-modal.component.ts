import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-medical-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './medical-modal.component.html',
  styleUrl: './medical-modal.component.css'
})
export class MedicalModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);

  public data: any;
  public medicalForm = {
    type: 'Alergie',
    title: '',
    description: '',
    severity: 'low' as 'low' | 'medium' | 'high',
    is_food_allergy: false,
    allergen_codes: [] as string[]
  };

  public view: 'general' | 'allergy' = 'general';

  public allergens = [

    { code: '1', name: 'Obiloviny obsahující lepek' },
    { code: '2', name: 'Korýši' },
    { code: '3', name: 'Vejce' },
    { code: '4', name: 'Ryby' },
    { code: '5', name: 'Podzemnice olejná (arašídy)' },
    { code: '6', name: 'Sójové boby (sója)' },
    { code: '7', name: 'Mléko' },
    { code: '8', name: 'Skořápkové plody' },
    { code: '9', name: 'Celer' },
    { code: '10', name: 'Hořčice' },
    { code: '11', name: 'Sezamová semena' },
    { code: '12', name: 'Oxid siřičitý a siřičitany' },
    { code: '13', name: 'Vlčí bob (lupina)' },
    { code: '14', name: 'Měkkýši' }
  ];

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('medical_record');
    if (this.data?.mode === 'edit' && this.data.record) {
      this.medicalForm = {
        type: this.data.record.type,
        title: this.data.record.title,
        description: this.data.record.description || '',
        severity: this.data.record.severity,
        is_food_allergy: !!this.data.record.is_food_allergy,
        allergen_codes: this.data.record.allergen_codes ? this.data.record.allergen_codes.split(',') : []
      };
      this.view = this.data.record.is_food_allergy ? 'allergy' : 'general';
    } else if (this.data?.initialData) {
      this.medicalForm = { ...this.medicalForm, ...this.data.initialData };
      this.view = this.data.initialData.view || 'general';
    }
  }



  public toggleAllergen(code: string): void {
    const index = this.medicalForm.allergen_codes.indexOf(code);
    if (index > -1) {
      this.medicalForm.allergen_codes.splice(index, 1);
    } else {
      this.medicalForm.allergen_codes.push(code);
    }
  }

  public save(): void {
    if (!this.medicalForm.title || !this.medicalForm.type) return;

    const studentId = this.data.studentId;
    const url = this.data.mode === 'add'
      ? `${Config.API_URL}/v1/student/${studentId}/medical`
      : `${Config.API_URL}/v1/student/${studentId}/medical/${this.data.record.record_id}`;
    
    const method = this.data.mode === 'add' ? 'post' : 'patch';

    const payload = {
      ...this.medicalForm,
      allergen_codes: this.medicalForm.allergen_codes.join(',')
    };

    this.http[method](url, payload, { withCredentials: true })
      .subscribe({

        next: () => {
          this.modalManager.closeModal('medical_record');
          if (this.data.callback) {
            this.data.callback();
          }
        }
      });
  }

  public closeModal(): void {
    this.modalManager.closeModal('medical_record');
  }
}
