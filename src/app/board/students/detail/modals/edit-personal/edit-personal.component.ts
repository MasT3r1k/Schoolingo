import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import moment from 'moment';

@Component({
  selector: 'app-edit-personal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './edit-personal.component.html',
  styleUrl: './edit-personal.component.css'
})

export class EditPersonalModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  public Utils = Utils;

  public getSelectedClassLabel(): string {
    const cls = this.classes.find(c => c.class_id === this.form.classId);
    return cls ? cls.class_name : 'Vyberte třídu...';
  }

  public getSelectedInsuranceLabel(): string {
    const ins = this.insurances.find(i => i.insurance_id === this.form.insuranceId);
    return ins ? (ins.shortcut + ' - ' + ins.insurance) : 'Nezadáno';
  }

  public getSelectedNationalityLabel(): string {
    const country = this.countries.find(c => c.country_id === this.form.nationalityId);
    return country ? country.nationality : '';
  }

  public getSelectedNationalityFlag(): string {
    const country = this.countries.find(c => c.country_id === this.form.nationalityId);
    return country ? Utils.getFlagFromCountry(country.code2) : '';
  }


  public getSelectedPrefixTitles(): string {
    return this.form.prefixTitle || 'Nezadáno';
  }

  public getSelectedSuffixTitles(): string {
    return this.form.suffixTitle || 'Nezadáno';
  }

  public togglePrefixTitle(title: string): void {
    let titles = this.form.prefixTitle ? this.form.prefixTitle.split(',').map(t => t.trim()) : [];
    if (titles.includes(title)) {
      titles = titles.filter(t => t !== title);
    } else {
      titles.push(title);
    }
    this.form.prefixTitle = titles.join(', ');
  }

  public toggleSuffixTitle(title: string): void {
    let titles = this.form.suffixTitle ? this.form.suffixTitle.split(',').map(t => t.trim()) : [];
    if (titles.includes(title)) {
      titles = titles.filter(t => t !== title);
    } else {
      titles.push(title);
    }
    this.form.suffixTitle = titles.join(', ');
  }

  public isPrefixTitleSelected(title: string): boolean {
    const titles = this.form.prefixTitle ? this.form.prefixTitle.split(',').map(t => t.trim()) : [];
    return titles.includes(title);
  }

  public isSuffixTitleSelected(title: string): boolean {
    const titles = this.form.suffixTitle ? this.form.suffixTitle.split(',').map(t => t.trim()) : [];
    return titles.includes(title);
  }



  public data: any;
  public form = {
    firstName: '',
    lastName: '',
    prefixTitle: '', // Simplified for now, titles can be comma separated or handled better
    suffixTitle: '',
    classId: 0 as number,
    insuranceId: 0 as number | null,
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


  ngOnInit(): void {
    this.data = this.modalManager.getModalData('edit_personal');
    if (this.data?.student) {
      const s = this.data.student;
      this.form = {
        firstName: s.first_name || '',
        lastName: s.last_name || '',
        prefixTitle: s.prefix_title || '',
        suffixTitle: s.suffix_title || '',
        classId: s.class_id || 0,
        insuranceId: s.insurance_id || null,
        gender: s.gender !== undefined ? s.gender : 0,
        birthNum: s.birthnum || '',
        birthday: s.birthday ? moment(s.birthday).format('YYYY-MM-DD') : '',
        birthPlace: s.birth_place || '',
        nationalityId: s.nationality_id || 1
      };
    }

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


  public save(): void {
    const personId = this.data.student.person_id;
    this.http.patch(`${Config.API_URL}/v1/student/${personId}/personal`, this.form, { withCredentials: true })
      .subscribe({
        next: () => {
          this.modalManager.closeModal('edit_personal');
          if (this.data.callback) {
            this.data.callback();
          }
        },
        error: (err) => {
            console.error(err);
            alert('Chyba při ukládání dat');
        }
      });
  }

  public closeModal(): void {
    this.modalManager.closeModal('edit_personal');
  }
}
