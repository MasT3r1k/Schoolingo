import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Locale } from '@Schoolingo/locale';
import { Alert } from '../../../../../infrastructure/alert/alert';
import { MarksManager } from '@Schoolingo/marks';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: './edit-column.component.html',
  styleUrl: './edit-column.component.css'
})
export class EditColumnComponent implements OnInit {
  public l = inject(Locale)
  public marksManager = inject(MarksManager);
  public alert: Alert | null = null;

  public action: 'edit' | 'create' = 'edit';
  public isLoading = true;
  public topic: string = "";
  public type: 'marks' | 'points' = 'marks';
  public types: (typeof this.type)[] = ['marks', 'points'];
  public weight: string = "1";
  public maxPoints: string = "10";
  public prefillMark: string | number | null = null;
  public includeInGradeEvenIfNoPoints: boolean = false;
  public plannedMark = "";
  public errors: { [key: string]: string } = {};

  public showSelect: 'type' | 'weight' | null = null;

  public selectedType: typeof this.type = 'marks';

  ngOnInit(): void {
    this.topic = this.marksManager.getTopic() || "";
    this.type = this.marksManager.getType() as typeof this.type;
    this.weight = this.marksManager.getWeight().toString();
    this.action = this.marksManager.getAction() as typeof this.action;
    this.isLoading = false;
  }

  public isButtonActivated(): boolean {
    if (this.topic == "") return false;
    return true;
  }

  public editColumn(): void {
    this.errors = {};

    // Validation
    if (!this.topic.length) {
      this.errors['topic'] = this.l.s('form.required');
      return;
    }

    if (this.topic.length > 50) {
      this.errors['topic'] = this.l.s('form.maxLength').replaceAll('%max%', "50");
      return;
    }

    switch (this.type) {
      case "marks":
        let weight = parseFloat(this.weight);
        if (isNaN(weight) || this.weight == "" || this.weight == null || this.weight == undefined) {
          this.errors['weight'] = this.l.s('form.required');
          return;
        }

        if (weight < 1 || weight > 10) {
          this.errors['weight'] = this.l.s('form.invalid');
          return;
        }

        if (parseInt(this.weight).toString() != this.weight) {
          this.errors['weight'] = this.l.s('form.invalid');
          return;
        }
      break;
    case "points":
      let maxPoints = parseFloat(this.maxPoints);
      if (isNaN(maxPoints) || this.maxPoints == "" || this.maxPoints == null || this.maxPoints == undefined) {
        this.errors['points'] = this.l.s('form.required');
        return;
      }

      if (maxPoints < 1 || maxPoints > 100) {
        this.errors['points'] = this.l.s('form.invalid');
        return;
      }

      if (parseInt(this.maxPoints).toString() != this.maxPoints) {
        this.errors['points'] = this.l.s('form.invalid');
        return;
      }
      break;
    }
  }
}
