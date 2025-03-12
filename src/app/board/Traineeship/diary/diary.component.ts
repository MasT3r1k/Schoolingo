import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatalistComponent, errorAPI } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { DiaryWeek } from '@Schoolingo/Traineeship';
import { Subscription } from 'rxjs';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';
import { Modal } from '@Components/Modal/Modal';
import { selectInstructorModalComponent } from './selectInstructor/selectInstructor';

@Component({
  standalone: true,
  imports: [DatalistComponent, NgClass, RouterLink, writeDairyComponent],
  templateUrl: './diary.component.html',
  styleUrls: ['../../../Styles/card.css', '../../../Styles/input.css', './diary.component.css']
})
export class DiaryComponent implements OnInit {
  private listeners: Subscription[] = [];
  datalist: DatalistComponent | null = null;

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

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }
  
  constructor(public schoolingo: Schoolingo) {}
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
