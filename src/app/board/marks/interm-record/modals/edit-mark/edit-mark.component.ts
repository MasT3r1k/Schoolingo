import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '@Components/Alert';
import { Alert } from '@Schoolingo/alert';
import { Locale } from '@Schoolingo/locale';
import { MarksManager } from '@Schoolingo/marks';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './edit-mark.component.html',
  styleUrl: './edit-mark.component.css'
})
export class EditMarkComponent implements OnInit {
  public alert: Alert | null = null;
  public marksManager = inject(MarksManager);
  public l = inject(Locale);
  
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
    // Validation
    if (!this.marksManager.getSelectedStudent() || !this.marksManager.getSubjectId()) {
      return;
    }

    if (this.mark == null || this.mark == "") {
      this.errors['mark'] = this.l.s('form.required');
      return;
    } 

    const config = this.marksManager.getConfig();
    console.log(config);
    console.log('a', config.mark_display.includes(this.mark), 'b', (config.mark_ids.includes(parseInt(this.mark)) && parseInt(this.mark).toString() == this.mark))

    if (  !config.mark_display.includes(this.mark)
        && config.mark_ids.includes(parseInt(this.mark))) {
      this.errors['mark'] = this.l.s('form.invalid');
      return;
    }
  }
}
