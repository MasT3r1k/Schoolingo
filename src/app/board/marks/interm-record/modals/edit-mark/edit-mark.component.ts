import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '@Components/Alert';
import { Alert } from '@Schoolingo/alert';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { MarksManager } from '@Schoolingo/marks';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './edit-mark.component.html',
  styleUrl: './edit-mark.component.css'
})
export class EditMarkComponent implements OnInit {
  public alert: Alert | null = null;
  public marksManager = inject(MarksManager);
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  private http = inject(HttpClient);

  public isLoading = true;
  public action: '' | 'edit' | 'create' = '';
  public mark: string | null = null;
  public errors: { [key: string]: string } = {};

  ngOnInit(): void {
    this.mark = this.marksManager.getMark();
    this.action = this.marksManager.getAction() as typeof this.action;
    this.isLoading = false;
  }

  public isButtonActivated(): boolean {
    if (this.mark == "" || this.mark == null) return false;
    return true;
  }

  public editMark(): void {
    this.alert = null;
    this.errors = {};

    console.log(
      this.marksManager.getSelectedStudent(),
      this.marksManager.getSubjectId(),
      this.marksManager.getColumnId()
    )
    // Validation
    if (this.marksManager.getSelectedStudentId() == undefined || this.marksManager.getSubjectId() == undefined || this.marksManager.getColumnId() == undefined) {
      this.errors['mark'] = this.l.s('form.invalid');
      return;
    }

    if (this.mark == null || this.mark == "") {
      this.errors['mark'] = this.l.s('form.required');
      return;
    } 

    const config = this.marksManager.getConfig();

    if (  !config.mark_display.includes(this.mark)
        && config.mark_ids.includes(parseInt(this.mark))) {
      this.errors['mark'] = this.l.s('form.invalid');
      console.log('INVALID MARK')
      return;
    }



    this.http.post(
      `${Config.API_URL}/v1/marks/add_mark`,
      { column_id: this.marksManager.getColumnId(),
        mark: this.mark,
        student_id: this.marksManager.getSelectedStudentId(),
        description: "" },
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.marksManager.updateMark$.next({
        studentId: this.marksManager.getSelectedStudentId(),
        studentIndex: this.marksManager.getSelectedStudentIndex(),
        columnIndex: this.marksManager.getColumnIndex(),
        mark: this.mark
      })
      this.modalManager.closeModal("edit_mark")
    })
  }
}
