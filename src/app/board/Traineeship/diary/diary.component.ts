import { Component, OnInit } from '@angular/core';
import { DatalistComponent } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';

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
    this.schoolingo.traineeship.diary.subscribe(() => this.datalist?.refreshData())
  }
}
