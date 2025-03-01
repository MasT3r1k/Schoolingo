import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [DatalistComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './books.component.html',
  styleUrls: ['../../../Styles/input.css', './books.component.css', '../../../Styles/card.css']
})
export class BooksComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public books = new BehaviorSubject<Data[][]>([]);
  public search = new FormControl();

  public onClick(id: number[]): void {
    this.schoolingo.showBook(id, "book");
  }

  ngOnInit(): void {
    this.schoolingo.socketService.addFunction("library:getBooks").subscribe((data: dataAPI | any) => {
      let loanList: Data[][] = []
      data.data.forEach((loan: any) => {
        loanList.push([{value: loan.name, isLocale: false}, {value: "Želva", isLocale: false}, {value: loan.isbn, isLocale: false}, {value: loan.genre, isLocale: false}, {value: 'library/status/' + loan.loanStatus, isLocale: true}])
      })
      this.books.next(loanList);
    });
  }
}
