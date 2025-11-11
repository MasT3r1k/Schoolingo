import { NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { errorAPI } from '@Components/datalist';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Traineeship } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgStyle, IconsModule],
  templateUrl: './selectCompanyModal.html',
  styleUrls: ['./selectCompanyModal.css', '../../../../Components/modal/modal.css']
})
export class selectCompanyModalComponent implements OnInit {
  public traineeship = inject(Traineeship);
  public l = inject(Locale);

  public Utils = Utils

  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public showSelect: string | null = null;
  public alert: 'no_company' | 'no_traineeship' | null = null;
  public page: 'main' | 'select_traineeship' | 'select_instructor' = 'main';

  ngOnInit(): void {
  }

  public contextMenuInstructor(instructor_id: number, event: MouseEvent): void {

  }

  public validateButton(): boolean {
    return this.traineeship.selectedCompany.companyId != undefined && this.traineeship.selectedDairy != undefined;
  }

  public getWeeks(): any[] {
    const selectedId = this.traineeship.selectedDairy?.traineeship;
    
    return this.traineeship.getFutureWeeks()
      .sort((a: any, b: any) => {
        // Vybrané praxe
        if (a.traineeship === selectedId) return -1;
        if (b.traineeship === selectedId) return 1;

        // Začátek praxe
        const dateA = new Date(a.start).getTime();
        const dateB = new Date(b.start).getTime();
        return dateB - dateA;
      });
  }

  public getInstructors(): any[] {
    const selectedId = this.traineeship.selectedInstructor;
    
    return this.traineeship.selectedCompany.instructors
      .filter((instructor: any) => instructor.status === 'active')
      .sort((a: any, b: any) => {
        // Vybraný instruktor
        if (a.instructorId === selectedId) return -1;
        if (b.instructorId === selectedId) return 1;

        // Poslední update
        const dateA = new Date(a.last_updated).getTime();
        const dateB = new Date(b.last_updated).getTime();
        return dateB - dateA;
      });
  }

  public selectCompany(): void {
    this.alert = null;
    if (this.traineeship.selectedCompany.companyId == undefined) {
      this.alert = 'no_company';
      return;
    }
    
    if (this.traineeship.selectedDairy?.traineeship == undefined) {
      this.alert = 'no_traineeship';
      return;
    }

    this.http.post<selectCompanyAPI | errorAPI>(
      `${Config.API_URL}/v1/traineeship/select_company`,
      {
        traineeship: this.traineeship.selectedDairy?.traineeship,
        companyId: this.traineeship.selectedCompany.companyId,
        instructorId: this.traineeship.selectedInstructor
      },
      { withCredentials: true }
    )
    .subscribe((data: selectCompanyAPI | errorAPI) => {
        if ('status' in data && data.status) {
          this.modalManager.closeModal("select_company");
          let weeks = this.traineeship.diaryWeeks.getValue();
          let week = weeks.find((week) => week.traineeship == data.traineeship);
          if (!week) return;
          week.companyId = data.companyId;
          week.companyName = this.traineeship.selectedCompany.companyName;
          week.instructor = data.instructor;
          this.traineeship.diaryWeeks.next(weeks);
          return;
        }
        if ('error' in data) {
          // this.alert = data.error as typeof this.alert;
        }
    });
  }


}
