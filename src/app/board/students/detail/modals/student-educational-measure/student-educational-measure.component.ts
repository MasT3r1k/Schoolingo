import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { CalendarComponent } from '@Components/calendar';
import { EducationMeasuresService } from '../../../../../infrastructure/measures/education-measures.service';
import { School } from '../../../../../infrastructure/school';
import moment from 'moment';

@Component({
  selector: 'app-student-educational-measure',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CalendarComponent],
  templateUrl: './student-educational-measure.component.html',
  styleUrl: './student-educational-measure.component.css'
})
export class StudentEducationalMeasureComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  private school = inject(School);

  public measuresService = inject(EducationMeasuresService);
  public data: any;
  public student: any;

  public form = {
    term: '',
    date: moment(),
    type: 'dŘŠ',
    ref_number: '',
    measure_text: '',
    report_card_text: ''
  };

  public terms: string[] = [];

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('add_measure_student');
    if (this.data) {
      this.student = this.data.student;
    }

    this.measuresService.loadMeasureTypes().subscribe(types => {
        if (types.length > 0 && !this.form.type) {
            this.form.type = types[0].id.toString();
        }
    });

    // Derive terms from school config
    this.school.config.subscribe(config => {
      if (config && config.year) {
        const yearStr = `${moment(config.year.start).format('YYYY')}/${moment(config.year.end).format('YY')}`;
        this.terms = [
          `${this.l.s('time.first_term')} ${yearStr}`,
          `${this.l.s('time.second_term')} ${yearStr}`
        ];
        this.form.term = this.terms[0];
      }
    });
  }

  public getSelectedTypeLabel(): string {
    return this.measuresService.measureTypes().find(t => t.id == this.form.type)?.label_1st || '';
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_measure_student');
  }

  public copyToReportCard(): void {
    this.form.report_card_text = this.form.measure_text;
  }

  public generateRefNumber(): void {
    // Dummy generation or refresh logic
    this.form.ref_number = 'JED/' + Math.floor(Math.random() * 1000) + '/' + moment().format('YYYY');
  }

  public submit(): void {
    console.log('Submitting measure:', this.form);
    if (this.data.callback) {
      this.data.callback();
    }
    this.closeModal();
  }

  public openTemplatesModal(field: 'measure' | 'report'): void {
    this.modalManager.openModal('measure_templates', {
      callback: (text: string) => {
        if (field === 'measure') this.form.measure_text = text;
        else this.form.report_card_text = text;
      }
    });
  }

  public openTypesManagementModal(): void {
    this.modalManager.openModal('measure_types');
  }
}
