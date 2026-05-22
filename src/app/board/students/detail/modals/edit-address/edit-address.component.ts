import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Utils } from '@Schoolingo/utils';
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  selector: 'app-edit-address-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './edit-address.component.html',
  styleUrl: './edit-address.component.css'
})
export class EditAddressModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  public Utils = Utils;

  public data: any;
  public form = {
    street: '',
    houseNumber: '',
    city: '',
    postcode: '',
    countryId: 1
  };

  public countries: any[] = [];

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('edit_address');
    if (this.data?.student) {
      const s = this.data.student;
      this.form = {
        street: s.street || '',
        houseNumber: s.house_number || '',
        city: s.city_name || '',
        postcode: s.postcode || '',
        countryId: s.country_id || 1
      };
    }
    this.loadCountries();
  }

  private loadCountries(): void {
    this.http.get(`${Config.API_URL}/v1/system`, { withCredentials: true })
      .subscribe((res: any) => {
        this.countries = res.countries.map((country: any) => ({
          ...country,
          label: `${Utils.getFlagFromCountry(country.code2)} ${country.nationality}`,
          value: country.country_id
        })) || [];
      });
  }

  public save(): void {
    const changes: any[] = [];
    const s = this.data.student;

    if ((s.street || '') !== (this.form.street || '')) {
      changes.push({ label: 'Ulice', oldValue: s.street || 'Nezadáno', newValue: this.form.street || 'Nezadáno' });
    }
    if ((s.house_number || '') !== (this.form.houseNumber || '')) {
      changes.push({ label: 'Číslo popisné', oldValue: s.house_number || 'Nezadáno', newValue: this.form.houseNumber || 'Nezadáno' });
    }
    if ((s.city_name || '') !== (this.form.city || '')) {
      changes.push({ label: 'Město', oldValue: s.city_name || 'Nezadáno', newValue: this.form.city || 'Nezadáno' });
    }
    if ((s.postcode || '') !== (this.form.postcode || '')) {
      changes.push({ label: 'PSČ', oldValue: s.postcode || 'Nezadáno', newValue: this.form.postcode || 'Nezadáno' });
    }
    if ((s.country_id || 0) !== (this.form.countryId || 0)) {
      const oldCountry = this.countries.find(c => c.country_id === s.country_id)?.label || 'Nezadáno';
      const newCountry = this.countries.find(c => c.country_id === this.form.countryId)?.label || 'Nezadáno';
      changes.push({ label: 'Země', oldValue: oldCountry, newValue: newCountry });
    }

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
    this.http.patch(`${Config.API_URL}/v1/student/${personId}/address`, {
      ...this.form,
      saveType,
      historyDate,
      changes
    }, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.modalManager.closeModal('edit_address');
        if (this.data.callback) {
          this.data.callback();
        }
      },
      error: (err) => {
        console.error(err);
        alert('Chyba při ukládání adresy');
      }
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('edit_address');
  }
}
