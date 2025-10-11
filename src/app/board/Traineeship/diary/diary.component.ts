import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatalistComponent, errorAPI } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { DiaryWeek } from '@Schoolingo/Traineeship';
import { Subscription } from 'rxjs';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';
import { Modal } from '@Components/Modal/Modal';
import { selectInstructorModalComponent } from './selectInstructor/selectInstructor';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Config } from '@Schoolingo/Config';
import { Alert } from '@Schoolingo/Alert';
import { AlertComponent } from '@Components/Alert/Alert';
import { Utils } from '@Schoolingo/Utils';

@Component({
  standalone: true,
  imports: [DatalistComponent, NgClass, writeDairyComponent, HttpClientModule, AlertComponent],
  templateUrl: './diary.component.html',
  styleUrls: ['../../../Styles/card.css', '../../../Styles/input.css', './diary.component.css']
})
export class DiaryComponent implements OnInit {
  constructor(public schoolingo: Schoolingo) {}
  public Utils = Utils;

  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private listeners: Subscription[] = [];
  datalist: DatalistComponent | null = null;
  public alert: Alert | null = null;

  public selectInstructorModal = new Modal({
    title: {
      text: "traineeship/buttons/selectInstructor"
    },
    size: "size-2",
    closeable: true,
    items: [
      {
        type: 'component',
        component: selectInstructorModalComponent,
        data: {}
      }
    ]
  })

  public alerts: Record<string, Alert> = {
    "noCompanySelected": new Alert("error", "traineeship/alerts/noCompany", false)
  }

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  public printContract(): void {
    if (!this.schoolingo.traineeship.selectedDairy) {
      return;
    }

    try {
      this.http.post(
        Config.API_URL + 'contract',
        {
          traineeship: this.schoolingo.traineeship.selectedDairy?.traineeship
        },
        {
          withCredentials: true,
          responseType: 'json'
        }
      ).subscribe(
        (res: any) => {
          if (res.error) {
            switch(res.error) {
              case "no_token":
                this.schoolingo.userService.logout();
                break;
              case "no_traineeship":
                this.alert = new Alert("error", "traineeship/alerts/noTraineeship");
                return;
                case "no_company":
                  this.alert = new Alert("error", "traineeship/alerts/firstSelectCompany", true);
                  return;
            }
            return console.error(res.error);;
          }
        }, (err) => {
          if (err.status == 200) {
            this.http.post(
              Config.API_URL + 'contract',
              {
                traineeship: this.schoolingo.traineeship.selectedDairy?.traineeship
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
    return rating ? Number(rating).toFixed(1) : this.schoolingo.locale.getLocale('traineeship/noRating')
  }
  
  public refreshSelectedWeek(): void {
    let idFromUrl = this.route.snapshot.paramMap.get("id");
    // if (idFromUrl == "new") {
    //   this.showPage = "requestCompany";
    //   this.schoolingo.traineeship.selectedCompany = "new";
    //   return;
    // }

    if (idFromUrl == undefined || idFromUrl == null) {
      // this.showPage = 'list';
      this.schoolingo.traineeship.selectDairy(null)
      return;
    }

    let week = this.schoolingo.traineeship.diaryWeeks
      .getValue()
      .find(
        (week: DiaryWeek) => week.traineeship === parseInt(idFromUrl!)
      );
      
    if (!week) {
      this.alert = new Alert("error", "traineeship/alerts/noTraineeshipFound", true);
      return;
    }
    this.schoolingo.traineeship.selectDairy(week);
  }

  ngOnInit(): void {

    if (this.schoolingo.traineeship.diaryWeeks.getValue().length == 1) {
      this.selectWeek(this.schoolingo.traineeship.diaryWeeks.getValue()[0]);
    }

    this.listeners.push(
      this.schoolingo.traineeship.diary.subscribe(
        () => this.datalist?.refreshData()
      )
    );

    this.listeners.push(
      this.schoolingo.traineeship.diaryWeeks.subscribe((weeks: DiaryWeek[]) => {
        if (weeks.length == 1) {
          this.schoolingo.traineeship.selectDairy(weeks[0]);
        }
      })
    );

    let tempAlert = new Alert("error", "traineeship/alerts/noCompany", false);
    tempAlert.addButton("traineeship/buttons/selectCompany", () => {
      this.router.navigate(['/traineeship/companies'])
    })
    this.alerts['noCompanySelected'] = tempAlert;
    
    this.listeners.push(
      this.schoolingo.socketService.addFunction("traineeship:selectCompany").subscribe((data: selectCompanyAPI | errorAPI) => {
        if ('status' in data) {
          switch(data.status) {
            case 'updated':
              let weeks = this.schoolingo.traineeship.diaryWeeks.getValue();
              weeks.forEach((week: DiaryWeek) => {
                if (week.traineeship == data.traineeship) {
                  week.company = data.company;
                  week.instructor = data.instructor;
                  this.schoolingo.traineeship.selectedDairy = week;
                }
              });
              this.schoolingo.traineeship.diaryWeeks.next(weeks);
              break;
          }
          this.selectInstructorModal.close();
          // Update data in diary
          console.log(data)
          return;
        }
        if ('error' in data) {
        }
      })
    );

  }

  ngOnDestroy(): void {
    this.schoolingo.traineeship.selectDay(null);
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public selectWeek(week: DiaryWeek | null): void {
    this.schoolingo.traineeship.selectDairy(week);
  }

  public selectInstructor(): void {
    this.selectInstructorModal.open()
  }


}
