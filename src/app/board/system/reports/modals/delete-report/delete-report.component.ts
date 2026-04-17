import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-delete-report-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="modal-body">
      <div class="danger-notice"
          style="margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: var(--danger); font-size: 13px; font-weight: 600;">
          <i-tabler name="alert-triangle" style="width: 18px; height: 18px;"></i-tabler>
          <span>{{ l.s('reports.delete_report.description', { report_name: report.name }) }}</span>
      </div>

      <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
          <div class="btn" (click)="close()">{{ l.s('buttons.cancel') }}</div>
          <div class="btn btn--danger" (click)="delete()">
              <i-tabler name="trash"></i-tabler>
              {{ l.s('buttons.delete') }}
          </div>
      </div>
    </div>
  `
})
export class DeleteReportModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);

  public report: any;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('delete_report');
    this.report = data.report;
  }

  public delete(): void {
    const data = this.modalManager.getModalData('delete_report');
    if (data.onDelete) {
      data.onDelete(this.report.report_id);
    }
    this.modalManager.closeModal('delete_report');
  }

  public close(): void {
    this.modalManager.closeModal('delete_report');
  }
}
