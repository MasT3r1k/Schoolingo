
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import moment from 'moment';

@Component({
  selector: 'app-edit-year',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, CalendarComponent],
  templateUrl: './edit-year.component.html',
  styleUrls: ['./edit-year.component.css']
})
export class EditYearComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public calendarManager = inject(CalendarManager);

  public form: FormGroup = this.fb.group({
    start: ['', Validators.required],
    end: ['', Validators.required],
    midterm: ['', Validators.required],
    current: [false]
  });

  public isEditing = false;
  public editingId: number | null = null;
  public data: any;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('edit_year');
    
    if (this.data?.year) {
      this.isEditing = true;
      this.editingId = this.data.year.syId;
      
      const formatDate = (dateStr: string) => dateStr ? dateStr.split('T')[0] : '';
      
      this.form.patchValue({
        start: formatDate(this.data.year.start),
        end: formatDate(this.data.year.end),
        midterm: formatDate(this.data.year.midterm),
        current: this.data.year.current
      });

      // Sync calendars with existing data
      setTimeout(() => {
        if (this.data.year.start) this.calendarManager.getCalendarData('schoolYear_start').selected_date[0].next(moment(this.data.year.start));
        if (this.data.year.end) this.calendarManager.getCalendarData('schoolYear_end').selected_date[0].next(moment(this.data.year.end));
        if (this.data.year.midterm) this.calendarManager.getCalendarData('schoolYear_midterm').selected_date[0].next(moment(this.data.year.midterm));
      });
    }

    // Subscribe to calendar changes
    this.calendarManager.getCalendarData('schoolYear_start').selected_date[0].subscribe((date) => {
        this.form.get('start')?.setValue(date.format('YYYY-MM-DD'));
    });
    this.calendarManager.getCalendarData('schoolYear_end').selected_date[0].subscribe((date) => {
        this.form.get('end')?.setValue(date.format('YYYY-MM-DD'));
    });
    this.calendarManager.getCalendarData('schoolYear_midterm').selected_date[0].subscribe((date) => {
        this.form.get('midterm')?.setValue(date.format('YYYY-MM-DD'));
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const body = this.form.value;
    const request = this.isEditing && this.editingId
      ? this.http.put(`${Config.API_URL}/v1/school/years/${this.editingId}`, body, { withCredentials: true })
      : this.http.post(`${Config.API_URL}/v1/school/years`, body, { withCredentials: true });

    request.subscribe({
      next: () => {
        if (this.data?.onSave) {
          this.data.onSave();
        }
        this.modalManager.closeModal('edit_year');
      },
      error: () => alert('Failed to save school year')
    });
  }

  close(): void {
    this.modalManager.closeModal('edit_year');
  }
}
