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
  

  public mark: string | number | null = null;

  ngOnInit(): void {
    this.mark = this.marksManager.getMark()
  }

  public editMark(): void {
    this.alert = null;
    // Validation
    if (!this.marksManager.getSelectedStudent() || !this.marksManager.getSubjectId()) {
      return;
    }

    if (this.mark == null || this.mark == "") {
      return;
    } 

    if (typeof this.mark == "string" && !["A", "N", "X", "?"].includes(this.mark) ||
        typeof this.mark == "number" && isNaN(this.mark)) {
          return;
      }
  }
}
