import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Locale } from '@Schoolingo/locale';
import { Alert } from '../../../../../infrastructure/alert/alert';
import { MarksManager } from '@Schoolingo/marks';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, CalendarComponent, IconsModule],
  templateUrl: './edit-column.component.html',
  styleUrl: './edit-column.component.css'
})
export class EditColumnComponent implements OnInit {
  public l = inject(Locale)
  private modalManager = inject(ModalManager);
  public marksManager = inject(MarksManager);
  public dropdownManager = inject(DropdownManager);
  private http = inject(HttpClient);
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
    }

    if (this.topic.length > this.marksManager.getConfig().max_topic_length) {
      this.errors['topic'] = this.l.s('form.maxLength', { max: this.marksManager.getConfig().max_topic_length });
    }

    if (this.topic.length < this.marksManager.getConfig().min_topic_length) {
      this.errors['topic'] = this.l.s('form.minLength', { min: this.marksManager.getConfig().min_topic_length });
    }

    switch (this.type) {
      case "marks":
        let weight = parseFloat(this.weight);
        if (isNaN(weight) || this.weight == "" || this.weight == null || this.weight == undefined) {
          this.errors['weight'] = this.l.s('form.required');
        }

        if (weight < this.marksManager.getConfig().min_weight) {
          this.errors['weight'] = this.l.s('form.minValue', { min: this.marksManager.getConfig().min_weight });
        }

        if (weight > this.marksManager.getConfig().max_weight) {
          this.errors['weight'] = this.l.s('form.maxValue', { max: this.marksManager.getConfig().max_weight });
        }

        if (parseInt(this.weight).toString() != this.weight) {
          this.errors['weight'] = this.l.s('form.invalid');
        }
      break;
    case "points":
      let maxPoints = parseFloat(this.maxPoints);
      if (isNaN(maxPoints) || this.maxPoints == "" || this.maxPoints == null || this.maxPoints == undefined) {
        this.errors['points'] = this.l.s('form.required');
      }

      if (maxPoints > this.marksManager.getConfig().max_points) {
        this.errors['points'] = this.l.s('form.maxValue', { max: this.marksManager.getConfig().max_points });
      }
      if (maxPoints < this.marksManager.getConfig().min_points) {
        this.errors['points'] = this.l.s('form.minValue', { min: this.marksManager.getConfig().min_points });
      }

      if (parseInt(this.maxPoints).toString() != this.maxPoints) {
        this.errors['points'] = this.l.s('form.invalid');
      }
      break;
    }

    if (Object.keys(this.errors).length) {
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/marks/update_column`,
      {
        group_id: this.marksManager.getGroupId(),
        subject_id: this.marksManager.getSubjectId(),
        columnIndex: this.marksManager.getColumnIndex(),
        weight: parseInt(this.weight),
        type: this.types.indexOf(this.type),
        topic: this.topic
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('data' in data) {
        this.marksManager.updateColumn$.next(data.data);
        this.modalManager.closeModal("edit_column")
      }
      console.log(data)
    })
  }
}
