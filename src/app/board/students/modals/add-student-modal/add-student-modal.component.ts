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

@Component({
  selector: 'add-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
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

  public getSelectedPrefixTitles(): string {
    return this.newStudent.prefixTitle || 'Nezadáno';
  }

  public getSelectedSuffixTitles(): string {
    return this.newStudent.suffixTitle || 'Nezadáno';
  }

  public togglePrefixTitle(title: string): void {
    let titles = this.newStudent.prefixTitle ? this.newStudent.prefixTitle.split(',').map(t => t.trim()) : [];
    if (titles.includes(title)) {
      titles = titles.filter(t => t !== title);
    } else {
      titles.push(title);
    }
    this.newStudent.prefixTitle = titles.join(', ');
  }

  public toggleSuffixTitle(title: string): void {
    let titles = this.newStudent.suffixTitle ? this.newStudent.suffixTitle.split(',').map(t => t.trim()) : [];
    if (titles.includes(title)) {
      titles = titles.filter(t => t !== title);
    } else {
      titles.push(title);
    }
    this.newStudent.suffixTitle = titles.join(', ');
  }

  public isPrefixTitleSelected(title: string): boolean {
    const titles = this.newStudent.prefixTitle ? this.newStudent.prefixTitle.split(',').map(t => t.trim()) : [];
    return titles.includes(title);
  }

  public isSuffixTitleSelected(title: string): boolean {
    const titles = this.newStudent.suffixTitle ? this.newStudent.suffixTitle.split(',').map(t => t.trim()) : [];
    return titles.includes(title);
  }

  public newStudent = {
    firstName: '',
    lastName: '',
    prefixTitle: '',
    suffixTitle: '',
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
  public prefixDegrees: any[] = [];
  public suffixDegrees: any[] = [];

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
        // @ts-ignore
        this.prefixDegrees = degrees.filter(d => d.is_before === 1 || d.is_before === true);
        // @ts-ignore
        this.suffixDegrees = degrees.filter(d => d.is_before === 0 || d.is_before === false);
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
