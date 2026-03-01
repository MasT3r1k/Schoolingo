import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import moment from 'moment';

@Component({
  selector: 'app-save-history-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './save-history-modal.component.html',
  styleUrl: './save-history-modal.component.css'
})
export class SaveHistoryModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);

  public data: any;
  public saveType: 'change' | 'correction' = 'change';
  public historyDate: string = moment().format('YYYY-MM-DD');

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('save_history');
  }

  public save(): void {
    if (this.data.callback) {
      this.data.callback(this.saveType, this.historyDate);
    }
    this.modalManager.closeModal('save_history');
  }

  public cancel(): void {
    this.modalManager.closeModal('save_history');
  }
}
