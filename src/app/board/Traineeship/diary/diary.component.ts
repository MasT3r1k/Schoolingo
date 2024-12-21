import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatalistComponent } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { DiaryWeek } from '@Schoolingo/Traineeship';
import { Subscription } from 'rxjs';
import { writeDairyComponent } from '../writeDairy/writeDairy.component';

@Component({
  standalone: true,
  imports: [DatalistComponent, NgClass, RouterLink, writeDairyComponent],
  templateUrl: './diary.component.html',
  styleUrls: ['../../../Styles/card.css', '../../../Styles/input.css', './diary.component.css']
})
export class DiaryComponent implements OnInit {
  private listeners: Subscription[] = [];
  datalist: DatalistComponent | null = null;
  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }
  
  constructor(public schoolingo: Schoolingo) {}
  ngOnInit(): void {

    if (this.schoolingo.traineeship.diaryWeeks.getValue().length == 1) {
      this.selectWeek(this.schoolingo.traineeship.diaryWeeks.getValue()[0]);
    }

    this.listeners.push(this.schoolingo.traineeship.diary.subscribe(() => this.datalist?.refreshData()));

    this.listeners.push(this.schoolingo.traineeship.diaryWeeks.subscribe((weeks: DiaryWeek[]) => {
      if (weeks.length == 1) {
        this.schoolingo.traineeship.selectDairy(weeks[0]);
      }
    }));
    
  }

  ngOnDestroy(): void {
    this.schoolingo.traineeship.selectDay(null);
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public selectWeek(week: DiaryWeek | null): void {
    this.schoolingo.traineeship.selectDairy(week);

  }

}
