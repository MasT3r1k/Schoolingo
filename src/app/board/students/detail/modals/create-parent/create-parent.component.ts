import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  selector: 'app-create-parent',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './create-parent.component.html',
  styleUrl: './create-parent.component.css'
})
export class CreateParentComponent implements OnInit {
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);

  public form = {
    firstName: '',
    lastName: '',
    role: 'father',
    gender: 0,

    prefixTitle: '',
    suffixTitle: '',
    email: '',
    dataBox: '',
    mobile: '',
    phone: '',
    address: {
      street: '',
      houseNumber: '',
      city: '',
      postcode: ''
    }
  };

  public prefixDegrees: any[] = [];
  public suffixDegrees: any[] = [];

  ngOnInit(): void {
    // Load degrees for titles
    this.http.get(`${Config.API_URL}/v1/admin/setup/lists/list/degrees`, { withCredentials: true })
      .subscribe((api: any) => {
        this.prefixDegrees = api.data.filter((d: any) => d.is_before === 1);
        this.suffixDegrees = api.data.filter((d: any) => d.is_before === 0);
      });
  }

  public getSelectedPrefixTitles(): string {
    return this.form.prefixTitle || 'Žádné';
  }

  public getSelectedSuffixTitles(): string {
    return this.form.suffixTitle || 'Žádné';
  }

  public isPrefixTitleSelected(shortcut: string): boolean {
    return this.form.prefixTitle.split(', ').includes(shortcut);
  }

  public isSuffixTitleSelected(shortcut: string): boolean {
    return this.form.suffixTitle.split(', ').includes(shortcut);
  }

  public togglePrefixTitle(shortcut: string): void {
    let titles = this.form.prefixTitle ? this.form.prefixTitle.split(', ') : [];
    if (titles.includes(shortcut)) {
      titles = titles.filter(t => t !== shortcut);
    } else {
      titles.push(shortcut);
    }
    this.form.prefixTitle = titles.join(', ');
  }

  public toggleSuffixTitle(shortcut: string): void {
    let titles = this.form.suffixTitle ? this.form.suffixTitle.split(', ') : [];
    if (titles.includes(shortcut)) {
      titles = titles.filter(t => t !== shortcut);
    } else {
      titles.push(shortcut);
    }
    this.form.suffixTitle = titles.join(', ');
  }

  public closeModal(): void {
    this.modalManager.closeModal('create_parent');
  }

  public save(): void {
    const student_id = this.modalManager.getModalData('create_parent').student_id;
    if (!student_id) return;

    const payload = {
      mode: 'new',
      role: this.form.role,
      firstName: this.form.firstName,

      lastName: this.form.lastName,
      gender: this.form.gender,
      prefixTitle: this.form.prefixTitle,
      suffixTitle: this.form.suffixTitle,
      email: this.form.email,
      dataBox: this.form.dataBox,
      phone: this.form.mobile || this.form.phone,
      address: this.form.address
    };

    this.http.post(`${Config.API_URL}/v1/student/${student_id}/parent`, payload, { withCredentials: true })
      .subscribe((api: any) => {
        if (api.success) {
          const callback = this.modalManager.getModalData('create_parent').callback;
          if (callback) callback();
          this.closeModal();
          // Also close the add_parent modal if it was open
          this.modalManager.closeModal('add_parent');
        }
      });
  }
}
