import { Component, OnInit } from '@angular/core';
import { DatalistComponent } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [DatalistComponent],
  templateUrl: './diary.component.html',
  styleUrls: ['../../../Styles/card.css', './diary.component.css']
})
export class DiaryComponent implements OnInit {

  datalist: DatalistComponent | null = null;
  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }
  
  constructor(public schoolingo: Schoolingo) {}
  ngOnInit(): void {
    this.schoolingo.socketService.emit('traineeship:getDiaryWeeks');
    this.schoolingo.socketService.emit('traineeship:getDiaryDays');
    this.schoolingo.diary.subscribe(() => this.datalist?.refreshData())
  }

  public ignoredDays: number[] = [6, 7];

  public getDays(diary: { start: moment.Moment; end: moment.Moment; }) {
    let days: moment.Moment[] = [];
    let date = diary.start.clone();
    while (date.isSameOrBefore(diary.end)) {
      if (!this.ignoredDays.includes(date.isoWeekday())) {
        days.push(date.clone());
      }
      date.add(1, 'day');
    }
    return days;
  }
}
