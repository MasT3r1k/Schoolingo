import { Component, OnInit } from '@angular/core';
import { TableColumn, TableOptions } from '@Components/table/table.component';
import { Locale } from '@Schoolingo/Locale';

type Student = {
  name: string;
  class: number;

}

@Component({
  selector: 'app-pupilcard',
  templateUrl: './pupilcard.component.html',
  styleUrl: './pupilcard.component.css'
})
export class PupilcardComponent implements OnInit {
  public tableName: string = 'student-list';


  columns: TableColumn[] = [
    {
      name: "Jméno"
    },
    {
      name: "Příjmení"
    },
    {
      name: "Třída"
    },
    {
      name: "Pohlaví"
    },
    {
      name: "Město"
    }
  ];

  _dat: any[] = [];
  data: any[] = [
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
  ]

  options: TableOptions = {
    tableType: 'interactive-list'
  };
  
  constructor(
    public locale: Locale
  ){}

  public testPerformance(countOfLines: number): void {
    this.data = [];
    let start = performance.now();
    for(let i = 0;i < countOfLines;i++) {
      this.data.push(["Fylyp", "Bašek", "B2I", "muž", "Strakonice"]);
    }
    let end = performance.now();
    console.log('Performance for ' + countOfLines + ' is ' + (end - start) + 'ms');
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.testPerformance(1000);
      this.testPerformance(10000);
      this.testPerformance(100000);
      this.testPerformance(1000000);
    }, 2000)
  }

}
