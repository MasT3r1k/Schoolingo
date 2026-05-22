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
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  selector: 'app-edit-personal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './edit-personal.component.html',
  styleUrl: './edit-personal.component.css'
})

export class EditPersonalModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  public Utils = Utils;

  public showMoreFields = false;

  public getSelectedClassLabel(): string {
    const cls = this.classes.find(c => c.class_id === this.form.classId);
    return cls ? cls.class_name : 'Vyberte třídu...';
  }

  public getInsuranceLabel(insturance_id: number | null): string {
    const ins = this.insurances.find(i => i.insurance_id === insturance_id);
    return ins ? (ins.shortcut + ' - ' + ins.insurance_id) : 'Nezadáno';
  }

  public birthNumError: string | boolean = true;

  public onBirthNumChange(): void {
    // Remove non-numeric characters
    let val = this.form.birthNum.replace(/\D/g, '');
    
    // Add slash
    if (val.length > 6) {
      val = val.substring(0, 6) + '/' + val.substring(6, 10);
    }
    
    this.form.birthNum = val;

    // Validate
    this.birthNumError = Utils.verifyBirthNumber(this.form.birthNum, this.form.birthday, this.form.gender);
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
    nationalityId: 1,
    saveType: 'change' as 'change' | 'correction'
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
        nationalityId: s.nationality_id || 1,
        saveType: 'change'
      };
    }

    this.loadData();
    this.onBirthNumChange();
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
        this.countries = res.countries.map((country: any) => ({
          ...country,
          label: `${Utils.getFlagFromCountry(country.code2)} ${country.nationality}`,
          value: country.country_id
        })) || [];
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
    const changes: any[] = [];
    const s = this.data.student;

    // Check changes and build diff
    const fields: { key: string, label: string, oldVal: any, newVal: any }[] = [
      { key: 'firstName', label: 'Jméno', oldVal: s.first_name, newVal: this.form.firstName },
      { key: 'lastName', label: 'Příjmení', oldVal: s.last_name, newVal: this.form.lastName },
      { key: 'prefixTitle', label: 'Tituly před jménem', oldVal: s.prefix_title, newVal: this.form.prefixTitle },
      { key: 'suffixTitle', label: 'Tituly za jménem', oldVal: s.suffix_title, newVal: this.form.suffixTitle },
      { key: 'classId', label: 'Třída', oldVal: s.class_id, newVal: this.form.classId },
      { key: 'insuranceId', label: 'Pojišťovna', oldVal: s.insurance_id, newVal: this.form.insuranceId },
      { key: 'gender', label: 'Pohlaví', oldVal: s.gender, newVal: this.form.gender },
      { key: 'birthNum', label: 'Rodné číslo', oldVal: s.birthnum.replace('/', ''), newVal: this.form.birthNum.replace('/', '') },
      { key: 'birthday', label: 'Datum narození', oldVal: s.birthday ? moment(s.birthday).format('YYYY-MM-DD') : '', newVal: this.form.birthday },
      { key: 'birthPlace', label: 'Místo narození', oldVal: s.birth_place, newVal: this.form.birthPlace },
      { key: 'nationalityId', label: 'Státní občanství', oldVal: s.nationality_id, newVal: this.form.nationalityId },
    ];

    fields.forEach(f => {
      // Basic Comparison (handle null vs empty string)
      const oldVal = f.oldVal === null || f.oldVal === undefined ? '' : f.oldVal;
      const newVal = f.newVal === null || f.newVal === undefined ? '' : f.newVal;

      if (oldVal.toString() !== newVal.toString()) {
        let displayOld = oldVal;
        let displayNew = newVal;

        // Visual mapping for specific fields
        if (f.key === 'classId') {
          displayOld = this.classes.find(c => c.class_id === oldVal)?.class_name || 'Nezadáno';
          displayNew = this.classes.find(c => c.class_id === newVal)?.class_name || 'Nezadáno';
        } else if (f.key === 'insuranceId') {
          displayOld = this.getInsuranceLabel(oldVal);
          displayNew = this.getInsuranceLabel(newVal);
        } else if (f.key === 'gender') {
          displayOld = this.l.s('genders.' + Utils.getGender(oldVal as number));
          displayNew = this.l.s('genders.' + Utils.getGender(newVal as number));
        } else if (f.key === 'birthday') {
            displayOld = oldVal ? moment(oldVal).format('D. M. YYYY') : 'Nezadáno';
            displayNew = newVal ? moment(newVal).format('D. M. YYYY') : 'Nezadáno';
        } else if (f.key === 'nationalityId') {
          displayOld = this.countries.find(c => c.country_id === oldVal)?.label || 'Nezadáno';
          displayNew = this.countries.find(c => c.country_id === newVal)?.label || 'Nezadáno';
        }

        changes.push({
          label: f.label,
          oldValue: displayOld,
          newValue: displayNew
        });
      }
    });

    if (changes.length === 0) {
      this.closeModal();
      return;
    }

    this.modalManager.openModal('save_history', {
      changes,
      callback: (saveType: 'change' | 'correction', historyDate: string) => {
        this.finalizeSave(saveType, historyDate, changes);
      }
    });
  }

  private finalizeSave(saveType: 'change' | 'correction', historyDate: string, changes: any[]): void {
    const personId = this.data.student.person_id;
    const body = {
        ...this.form,
        saveType,
        historyDate, // Including history date in body if backend supports it
        changes
    };

    this.http.patch(`${Config.API_URL}/v1/student/${personId}/personal`, body, { withCredentials: true })
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
