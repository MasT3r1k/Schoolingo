import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Locale } from '@Schoolingo/locale';
import { Alert } from '../../../../../infrastructure/alert/alert';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: './edit-column.component.html',
  styleUrl: './edit-column.component.css'
})
export class EditColumnComponent implements OnInit {
  public l = inject(Locale)
  public alert: Alert | null = null;

  public topic: string = "";
  public type: 'marks' | 'points' = 'marks';
  public types: (typeof this.type)[] = ['marks', 'points'];
  public weight: string = "1";
  public maxPoints: string = "10";
  public prefillMark: string | number | null = null;
  public includeInGradeEvenIfNoPoints: boolean = false;
  public plannedMark = "";

  public showSelect: 'type' | 'weight' | null = null;

  public selectedType: typeof this.type = 'marks';

  ngOnInit(): void {
    this.topic = "";
  }

  public editColumn(): void {
    this.alert = null;

    // Validation
    if (!this.topic.length) {
      this.alert = new Alert("error", "marks/alerts/emptyTopic");
      return;
    }

    if (this.topic.length > 50) {
      this.alert = new Alert("error", "marks/alerts/topicTooLong");
      return;
    }

    switch (this.type) {
      case "marks":
        let weight = parseFloat(this.weight);
        if (isNaN(weight) || this.weight == "" || this.weight == null || this.weight == undefined) {
          this.alert = new Alert("error", "marks/alerts/emptyWeight");
          return;
        }

        if (weight < 1 || weight > 10) {
          this.alert = new Alert("error", "marks/alerts/invalidWeight");
          return;
        }

        if (parseInt(this.weight).toString() != this.weight) {
          this.alert = new Alert("error", "marks/alerts/weightMustBeInteger");
          return;
        }
      break;
    case "points":
      let maxPoints = parseFloat(this.maxPoints);
      if (isNaN(maxPoints) || this.maxPoints == "" || this.maxPoints == null || this.maxPoints == undefined) {
        this.alert = new Alert("error", "marks/alerts/emptyMaxPoints");
        return;
      }

      if (maxPoints < 1 || maxPoints > 100) {
        this.alert = new Alert("error", "marks/alerts/invalidMaxPoints");
        return;
      }

      if (parseInt(this.maxPoints).toString() != this.maxPoints) {
        this.alert = new Alert("error", "marks/alerts/maxPointsMustBeInteger");
        return;
      }
      break;
    }

    
  }
}
