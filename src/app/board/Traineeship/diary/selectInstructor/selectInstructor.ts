import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '@Components/Alert/Alert';
import { errorAPI } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { Alert } from '@Schoolingo/Alert';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, AlertComponent],
  templateUrl: './selectInstructor.html',
  styleUrls: ['../../../../Styles/select.css', './selectInstructor.css']
})
export class selectInstructorModalComponent implements OnInit {
  private listeners: Subscription[] = [];
  public selectedInstructor: number | null = null;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  public alert: 'noCompany' | 'noTraineeship' | 'noInstructor' | null = null;

  public alerts: Record<string, Alert> = {
    "noInstructors": new Alert("error", "traineeship/noInstructors")
  };

  ngOnInit(): void {
    if (this.schoolingo.traineeship.selectedDairy) {
      this.schoolingo.socketService.emit('traineeship:getCompanyInfo', {
        companyId: this.schoolingo.traineeship.selectedDairy?.company
      });
    }

    this.listeners.push(
      this.schoolingo.socketService.addFunction("traineeship:selectCompany").subscribe((data: selectCompanyAPI | errorAPI) => {
        if ('error' in data) {
          this.alert = data.error as typeof this.alert;
        }
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("traineeship:getCompanyInstructors").subscribe((data: { personId: number }[]) => {
        this.schoolingo.traineeship.instructors = [];
        data.forEach((person: { personId: number }) => {
          this.schoolingo.traineeship.instructors.push(person.personId);
        });
      })
    );
  }

  public selectInstructor(): void {
    this.alert = null;
    if (this.selectedInstructor == null) {
      this.alert = 'noInstructor';
      return;
    }

    this.schoolingo.socketService.emit('traineeship:selectCompany', {
      traineeship: this.schoolingo.traineeship.selectedDairy?.traineeship,
      company: this.schoolingo.traineeship.selectedDairy?.company,
      instructor: this.selectedInstructor
    });


    // this.alert = 'noInstructor';
  }


}
