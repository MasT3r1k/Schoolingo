
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
import { CheckboxComponent } from '@Components/Checkbox';

@Component({
  selector: 'app-edit-year',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, CalendarComponent, CheckboxComponent],
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
    start: [moment(), Validators.required],
    end: [moment().add(10, 'month'), Validators.required],
    midterm: [moment().add(5, 'month'), Validators.required],
  });

  public current = false;

  public isEditing = false;
  public editingId: number | null = null;
  public data: any;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('edit_year');
    
    if (this.data?.year) {
      this.isEditing = true;
      this.editingId = this.data.year.sy_id;
      this.current = this.data.year.current;

      this.form.patchValue({
        start: moment(this.data.year.start),
        end: moment(this.data.year.end),
        midterm: moment(this.data.year.midterm)
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;

    const body = {
        ...this.form.value,
        current: this.current,
        start: this.form.value.start.format('YYYY-MM-DD'),
        end: this.form.value.end.format('YYYY-MM-DD'),
        midterm: this.form.value.midterm.format('YYYY-MM-DD')
    };
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
