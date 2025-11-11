import { NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Alert } from '@Schoolingo/alert';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Traineeship } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IconsModule, NgStyle],
  templateUrl: './selectInstructor.html',
  styleUrls: ['./selectInstructor.css', '../../../../Components/modal/modal.css']
})
export class selectInstructorModalComponent implements OnInit {
  public l = inject(Locale)
  public traineeship = inject(Traineeship);
  public showSelect: 'selectInstructor' | null = null;
  private modalManager = inject(ModalManager);
  private router = inject(Router);
  private http = inject(HttpClient);
  Utils = Utils;

  public page: 'main' | 'select_instructor' = 'main';
  public alert: 'no_company' | 'no_traineeship' | 'no_instructor' | null = null;
  public selectedInstructor: number | null = null;

  public alerts: Record<string, Alert> = {
    // "noInstructors": new Alert("error", "traineeship/noInstructors")
  };

  public getInstructors(): any[] {
    const selectedId = this.traineeship.selectedDairy?.instructor;
    
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

  public getInstructorName(): string {
    if (this.selectedInstructor == null) return this.l.s('traineeship.no_instructor_selected');

    const isExist = this.traineeship.selectedCompany.instructors.find((instructor: any) => instructor.instructorId == this.selectedInstructor);

    if (!isExist) {
      return this.l.s('unknown');
    }

    return isExist.name;
  }



  ngOnInit(): void {
    if (this.traineeship.selectedDairy) {
      this.selectedInstructor = this.traineeship.selectedDairy.instructorId;

        this.http.get<companyInfoAPI>(
            `${Config.API_URL}/v1/traineeship/company_info?companyId=${this.traineeship.selectedDairy.companyId}`,
            { withCredentials: true }
        )
        .subscribe((data: companyInfoAPI) => {
            this.traineeship.selectedCompany = data;
        })
      // this.schoolingo.socketService.emit('traineeship:getCompanyInfo', {
      //   companyId: this.traineeship.selectedDairy?.company
      // });
    }

    // this.listeners.push(
    //   this.schoolingo.socketService.addFunction("traineeship:selectCompany").subscribe((data: selectCompanyAPI | errorAPI) => {
    //     if ('error' in data) {
    //       this.alert = data.error as typeof this.alert;
    //     }
    //   })
    // );

    // this.listeners.push(
    //   this.schoolingo.socketService.addFunction("traineeship:getCompanyInstructors").subscribe((data: { personId: number }[]) => {
    //     this.traineeship.instructors = [];
    //     data.forEach((person: { personId: number }) => {
    //       this.traineeship.instructors.push(person.personId);
    //     });
    //   })
    // );
  }

  public goToCompanies(): void {
    this.router.navigate(['traineeship', 'companies']);
    this.modalManager.closeModal('select_instructor');
  }

  public selectInstructor(): void {
    this.alert = null;
    if (this.traineeship.selectedInstructor == null) {
      this.alert = 'no_instructor';
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/traineeship/select_company`,
      {
        traineeship: this.traineeship.selectedDairy?.traineeship,
        companyId: this.traineeship.selectedDairy?.companyId,
        instructorId: this.traineeship.selectedInstructor
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && 'traineeship' in data && 'instructor' in data) {
        const weeks = this.traineeship.diaryWeeks.getValue();
        let week = weeks.find((week) => week.traineeship == data.traineeship);
        if (!week) return;
        week.instructor = data.instructor as string | null;
        this.traineeship.diaryWeeks.next(weeks);
      }
      console.log(data)
    })
  }


}
