import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '@Components/Alert/Alert';
import { Schoolingo } from '@Schoolingo';
import { Alert } from '@Schoolingo/Alert';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './edit-mark.component.html',
  styleUrl: './edit-mark.component.css'
})
export class EditMarkComponent implements OnInit {
  public schoolingo = inject(Schoolingo);
  public alert: Alert | null = null;

  public mark: string | number | null = null;

  ngOnInit(): void {
    this.mark = this.schoolingo.tmarks.getMark()
  }

  public editMark(): void {
    this.alert = null;
    // Validation
    if (!this.schoolingo.tmarks.getSelectedStudent() || !this.schoolingo.tmarks.getSubjectId()) {
      this.alert = new Alert("error", "marks/alerts/unknownDetails", true);
      return;
    }

    if (this.mark == null || this.mark == "") {
      return;
    } 

    if (typeof this.mark == "string" && !["A", "N", "X", "?"].includes(this.mark) ||
        typeof this.mark == "number" && isNaN(this.mark)) {
          this.alert = new Alert("error", "marks/alerts/invalidMark", true);
          return;
      }
  }
}
