import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Data, DatalistComponent } from '@Components/Datalist/Datalist';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

enum bookLoanStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = "completed",
  BORROWED = "borrowed",
  RETURNED = "returned",
  OVERDUE = "overdue"
}

@Component({
  standalone: true,
  imports: [DatalistComponent, TabsComponent],
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.css', '../../../Styles/card.css'],
  outputs: ['datalist']
})
export class LoansComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public tabValue: BehaviorSubject<number> = new BehaviorSubject(0);
  public loans: BehaviorSubject<Data[][] | any> = new BehaviorSubject([]);

  datalist: DatalistComponent | null = null;

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  ngOnInit(): void {
    this.tabValue.subscribe(() => {
      setTimeout(() => this.datalist?.loadData())
    });

    this.schoolingo.socketService.addFunction("library:getLoans").subscribe((data: any[]) => {
      let loanList: Data[][] = []
      data.forEach((loan: any) => {
        loanList.push([{value: loan.name, isLocale: false}, {value: "Želva", isLocale: false}, {value: loan.isbn, isLocale: false}, {value: "", isLocale: false}, {value: 'library/status/' + loan.loanStatus, isLocale: true}])
      })
      this.loans.next(loanList);
    });
  }

}
