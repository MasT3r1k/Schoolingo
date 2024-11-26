import { Component, OnInit } from '@angular/core';
import { Data, DatalistComponent } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [DatalistComponent],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css', '../../../Styles/card.css']
})
export class BooksComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public books: BehaviorSubject<Data[][] | any> = new BehaviorSubject([]);

  ngOnInit(): void {
    this.schoolingo.socketService.addFunction("library:getBooks").subscribe((data: any[]) => {
      let loanList: Data[][] = []
      data.forEach((loan: any) => {
        loanList.push([{value: loan.name, isLocale: false}, {value: "Želva", isLocale: false}, {value: loan.isbn, isLocale: false}, {value: "", isLocale: false}, {value: 'library/status/' + loan.loanStatus, isLocale: true}])
      })
      this.books.next(loanList);
    });
  }
}
