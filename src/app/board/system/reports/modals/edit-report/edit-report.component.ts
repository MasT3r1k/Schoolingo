import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-edit-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="modal-body pb-0">
      <div class="form-group">
        <label for="name">{{ l.s('reports.report_name') }}</label>
        <input type="text" id="name" [(ngModel)]="reportName" (keyup.enter)="save()" placeholder="Zadejte název sestavy..." autofocus />
      </div>

      <div class="form-group">
        <label for="type">{{ l.s('reports.report_type') }}</label>
        <select id="type" [(ngModel)]="reportType" class="modal-select">
          @for (type of availableReportTypes; track type) {
            <option [value]="type">{{ l.s('reports.types.' + type) }}</option>
          }
        </select>
      </div>

      <div class="modal-actions">
        <button class="btn btn--ghost" (click)="close()">{{ l.s('buttons.cancel') }}</button>
        <button class="btn btn--primary" (click)="save()" [disabled]="!reportName?.trim()">
          <i-tabler name="device-floppy"></i-tabler>
          {{ l.s('buttons.save') }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class EditReportModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);

  public report: any;
  public reportName = '';
  public reportType = '';
  public availableReportTypes = ['student_list', 'student_marks', 'class_marks', 'grade_overview'];

  ngOnInit(): void {
    const data = this.modalManager.getModalData('edit_report');
    this.report = data.report;
    this.reportName = this.report?.name || '';
    this.reportType = this.report?.type || 'student_list';
  }

  public save(): void {
    if (!this.reportName?.trim()) return;
    const data = this.modalManager.getModalData('edit_report');
    if (data.onSave) {
      data.onSave(this.report, this.reportName, this.reportType);
    }
    this.modalManager.closeModal('edit_report');
  }

  public close(): void {
    this.modalManager.closeModal('edit_report');
  }
}
