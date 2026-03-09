import { Component, inject, OnInit } from '@angular/core';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-remove-company-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './removeCompanyModal.html',
  styleUrl: './removeCompanyModal.css'
})
export class removeCompanyModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  public company: any = {};
  public selected_option = 0;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('remove_company');
    this.company = data.company;
  }

  public getActionIcon(): string {
    switch(this.selected_option) {
      case 0:
        return 'archive';
      case 1:
        return 'trash-x';
    }
    return ''
  }

  public getActionText(): string {
    switch(this.selected_option) {
      case 0:
        return 'Odebrat do archivu';
      case 1:
        return 'Kompletně smazat';
    }
    return this.l.s('buttons.remove')
  }

  public closeModal(): void {
    this.modalManager.closeModal('remove_company')
  }

  public confirm(): void {
    const data = this.modalManager.getModalData('remove_company');
    if (data.callback) {
        data.callback(this.selected_option);
    }
    this.closeModal();
  }
}
