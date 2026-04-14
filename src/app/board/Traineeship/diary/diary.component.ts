import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';
import { selectInstructorModalComponent } from './selectInstructor/selectInstructor';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DatalistComponent } from '@Components/datalist';
import { Utils } from '@Schoolingo/utils';
import { Config } from '@Schoolingo/config';
import { DiaryWeek, Traineeship } from '@Schoolingo/traineeship';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  standalone: true,
  imports: [DatalistComponent, writeDairyComponent, HttpClientModule, IconsModule],
  templateUrl: './diary.component.html',
  styleUrls: ['../manage/manage.component.css']
})
export class DiaryComponent implements OnInit {
  public Utils = Utils;

  public l = inject(Locale);
  public traineeship = inject(Traineeship);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  public modalManager = inject(ModalManager);
  private listeners: Subscription[] = [];
  datalist: DatalistComponent | null = null;

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  public printContract(): void {
    if (!this.traineeship.selectedDairy) {
      return;
    }

    try {
      this.http.post(
        Config.API_URL + '/v1/traineeship/contract',
        {
          traineeship: this.traineeship.selectedDairy?.traineeship
        },
        {
          withCredentials: true,
          responseType: 'json'
        }
      ).subscribe(
        (res: any) => {
          if (res && res.error) {
            switch(res.error) {
              case "no_token":
                // this.schoolingo.userService.logout();
                break;
              case "no_traineeship":
                // this.alert = new Alert("error", "traineeship/alerts/noTraineeship");
                return;
              case "no_company":
                // this.alert = new Alert("error", "traineeship/alerts/firstSelectCompany", true);
                return;
            }
            return console.error(res.error);
          }
        }, (err) => {
          if (err.status == 200) {
            this.http.post(
              Config.API_URL + '/v1/traineeship/contract',
              {
                traineeship: this.traineeship.selectedDairy?.traineeship
              },
              {
                withCredentials: true,
                responseType: 'blob' as 'json'
              }
            ).subscribe(
              (res: any) => {
                let pdf = new Blob([res], { type: 'application/pdf' });
                window.open(URL.createObjectURL(pdf), "_blank");
              }
            );
          }
        });
    } catch(e) {
      console.error(e)
    }
  }

  public getCompanyRating(rating: number | null) {
    return rating ? Number(rating).toFixed(1) : this.l.s('traineeship.no_rating')
  }
  
  public refreshSelectedWeek(): void {
    let idFromUrl = this.route.snapshot.paramMap.get("id");

    if (idFromUrl == undefined || idFromUrl == null) {
      // this.showPage = 'list';
      this.traineeship.selectDairy(null)
      return;
    }

    let week = this.traineeship.diaryWeeks
      .getValue()
      .find(
        (week: DiaryWeek) => week.traineeship === parseInt(idFromUrl!)
      );
      
    if (!week) {
      // this.alert = new Alert("error", "traineeship/alerts/noTraineeshipFound", true);
      return;
    }
    this.traineeship.selectDairy(week);
  }

  ngOnInit(): void {
  this.modalManager.addModal(
    'select_instructor', {
    closeable: true,
    title: 'traineeship.buttons.select_instructor',
    items: [
      {
        type: 'component',
        component: selectInstructorModalComponent
      }
    ]
  });

    if (this.traineeship.diaryWeeks.getValue().length == 1) {
      this.selectWeek(this.traineeship.diaryWeeks.getValue()[0]);
    }

    this.listeners.push(
      this.traineeship.diary.subscribe(
        () => this.datalist?.refreshData()
      )
    );

    this.listeners.push(
      this.traineeship.diaryWeeks.subscribe((weeks: DiaryWeek[]) => {
        if (weeks.length == 1) {
          this.traineeship.selectDairy(weeks[0]);
        }
      })
    );

    // let tempAlert = new Alert("error", "traineeship/alerts/noCompany", false);
    // tempAlert.addButton("traineeship/buttons/selectCompany", () => {
    //   this.router.navigate(['/traineeship/companies'])
    // })
    // this.alerts['noCompanySelected'] = tempAlert;
    
    // this.listeners.push(
    //   this.schoolingo.socketService.addFunction("traineeship:selectCompany").subscribe((data: selectCompanyAPI | errorAPI) => {
    //     if ('status' in data) {
    //       switch(data.status) {
    //         case 'updated':
    //           let weeks = this.traineeship.diaryWeeks.getValue();
    //           weeks.forEach((week: DiaryWeek) => {
    //             if (week.traineeship == data.traineeship) {
    //               week.company = data.company;
    //               week.instructor = data.instructor;
    //               this.traineeship.selectedDairy = week;
    //             }
    //           });
    //           this.traineeship.diaryWeeks.next(weeks);
    //           break;
    //       }
    //       this.selectInstructorModal.close();
    //       // Update data in diary
    //       console.log(data)
    //       return;
    //     }
    //     if ('error' in data) {
    //     }
    //   })
    // );

  }

  ngOnDestroy(): void {
    this.traineeship.selectDay(null);
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public selectWeek(week: DiaryWeek | null): void {
    console.log(week)
    this.traineeship.selectDairy(week);
  }

  public selectInstructor(): void {
    // this.selectInstructorModal.open()
  }


}
