import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';

@Component({
  selector: 'add-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './add-student-modal.component.html',
  styleUrls: ['./add-student-modal.component.css']
})
export class AddStudentModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public Utils = Utils;

  public getSelectedClassLabel(): string {
    const cls = this.classes.find(c => c.class_id === this.newStudent.classId);
    return cls ? cls.class_name : 'Vyberte třídu...';
  }

  public getInsuranceLabel(insturance_id: number | null): string {
    const ins = this.insurances.find(i => i.insurance_id === insturance_id);
    return ins ? (ins.shortcut + ' - ' + ins.insurance_id) : 'Nezadáno';
  }

  public getSelectedNationalityLabel(): string {
    const country = this.countries.find(c => c.country_id === this.newStudent.nationalityId);
    return country ? country.nationality : '';
  }

  public getSelectedNationalityFlag(): string {
    const country = this.countries.find(c => c.country_id === this.newStudent.nationalityId);
    return country ? Utils.getFlagFromCountry(country.code2) : '';
  }
  
  public newStudent = {
    firstName: '',
    lastName: '',
    degrees: [],
    classId: 0 as number,
    insuranceId: null as number | null,
    gender: 0 as number,
    birthNum: '',
    birthday: '',
    birthPlace: '',
    nationalityId: 1
  };

  public classes: any[] = [];
  public insurances: any[] = [];
  public countries: any[] = [];
  public degrees: DropdownOption[] = [];

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    // Load classes
    this.http.get(`${Config.API_URL}/v1/schedule/classes`, { withCredentials: true })
      .subscribe((res: any) => {
        this.classes = res.classes || [];
      });

    // Load insurances
    this.http.get(`${Config.API_URL}/v1/school/insurance`, { withCredentials: true })
      .subscribe((res: any) => {
        this.insurances = res || [];
      });

    // Load countries (from system settings or similar)
    this.http.get(`${Config.API_URL}/v1/system`, { withCredentials: true })
      .subscribe((res: any) => {
        this.countries = res.countries || [];
      });

    // Load degrees
    this.http.get(`${Config.API_URL}/v1/school/degrees`, { withCredentials: true })
      .subscribe((res: any) => {
        const degrees = res || [];
        this.degrees = degrees.map((degree: any) => ({
          label: degree.shortcut,
          value: degree.shortcut
        }))
      });
  }

  submit() {
    if (!this.newStudent.firstName || !this.newStudent.lastName) {
        alert('Vyplňte jméno a příjmení');
        return;
    }

    this.http.post(`${Config.API_URL}/v1/students`, this.newStudent, { withCredentials: true }).subscribe({
        next: () => {
            this.close();
            alert('Student přidán.');
            window.location.reload();
        },
        error: (err) => {
            console.error('Failed to add student:', err);
            const msg = err.error?.error || 'Nepodařilo se přidat studenta';
            alert('Chyba: ' + msg);
        }
    });
  }

  close() {
    this.modalManager.closeModal('add_student');
  }
}
