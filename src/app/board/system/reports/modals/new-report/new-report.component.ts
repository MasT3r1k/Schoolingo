import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { ReportType } from '../../reports.component';

@Component({
  selector: 'app-new-report',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './new-report.component.html',
  styleUrls: ['./new-report.component.css', '../../../../../Components/modal/modal.css']
})
export class NewReportComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);

  public templates: { type: ReportType, color: string, icon: string }[] = [
    { type: 'student_list', color: 'primary', icon: 'users' },
    { type: 'student_marks', color: 'info', icon: 'star' },
    { type: 'class_marks', color: 'warning', icon: 'chalkboard' },
    { type: 'grade_overview', color: 'success', icon: 'report-analytics' }
  ];

  ngOnInit(): void {}

  public selectReport(type: ReportType): void {
    const data = this.modalManager.getModalData('create_report');
    if (data?.parent) {
      data.parent.selectReport(type);
    } else if (data?.onSelect) {
      data.onSelect(type);
    }
    this.closeModal();
  }

  public closeModal(): void {
    this.modalManager.closeModal('create_report');
  }
}
