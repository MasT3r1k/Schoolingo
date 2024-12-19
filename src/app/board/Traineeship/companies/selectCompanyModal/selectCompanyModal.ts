import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { errorAPI } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './selectCompanyModal.html',
  styleUrls: ['../../../../Styles/input.css', './selectCompanyModal.css']
})
export class selectCompanyModalComponent implements OnInit {
  private listeners: Subscription[] = [];
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public showSelect: string | null = null;
  public alert: 'noCompany' | 'noTraineeship' | null = null;

  ngOnInit(): void {
    this.listeners.push(this.schoolingo.socketService.addFunction("traineeship:selectCompany").subscribe((data: selectCompanyAPI | errorAPI) => {
      if ('status' in data && data.status) {
        this.schoolingo.traineeship.activateModal.close();
        return;
      }
      if ('error' in data) {
        this.alert = data.error as 'noCompany' | 'noTraineeship';
      }
    }));
  }

  public selectCompany(): void {
    this.alert = null;
    if (!this.schoolingo.traineeship.selectedCompany.companyId) {
      this.alert = 'noCompany';
      return;
    }
    if (!this.schoolingo.traineeship.selectedDairy?.traineeship) {
      this.alert = 'noTraineeship';
      return;
    } 
    this.schoolingo.socketService.emit('traineeship:selectCompany', {
      traineeship: this.schoolingo.traineeship.selectedDairy?.traineeship,
      company: this.schoolingo.traineeship.selectedCompany.companyId,
      instructor: this.schoolingo.traineeship.selectedInstructor
    })
  }


}
