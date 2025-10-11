import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { dataAPI, Metadata } from '@Components/Datalist/Datalist';
import { Data, DatalistComponent } from '@Components/Datalist/Datalist';
import { Modal } from '@Components/Modal/Modal';
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
  imports: [DatalistComponent, TabsComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './loans.component.html',
  styleUrls: ['../../../Styles/card.css', '../../../Styles/input.css', './loans.component.css'],
  outputs: ['datalist']
})
export class LoansComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public tabValue = new BehaviorSubject<number>(0);
  public loans = new BehaviorSubject<Data[][]>([]);
  public search = new FormControl();

  public metadata: Metadata = {
    rows: 0
  };

  datalist: DatalistComponent | null = null;
  public modal: Modal = new Modal({ title: { icon: "book", text: "library/dropdown/showBook/title" }, size: 'size-2', closeable: true, items: [
    {
      type: 'value',
      label: 'library/name',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'name'
      }
    },
    {
      type: 'value',
      label: 'library/subtitle',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'subtitle'
      }
    },
    {
      type: 'value',
      label: 'library/authors',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'author'
      }
    },
    {
      type: 'value',
      label: 'library/ISBN',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'isbn'
      }
    },
    {
      type: 'value',
      label: 'library/genre',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'genre'
      }
    },
    {
      type: 'value',
      label: 'language',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'language'
      }
    },
    {
      type: 'value',
      label: 'library/location',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'location'
      }
    },
    {
      type: 'value',
      label: 'library/publisher',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'publisher'
      }
    },
    {
      type: 'value',
      label: 'library/yearPublication',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'yearPublication'
      }
    },
    {
      type: 'value',
      label: 'library/editionNumber',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'editionNumber'
      }
    },
    {
      type: 'value',
      label: 'library/pages',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'pages'
      }
    },
    {
      type: 'value',
      label: 'library/notes',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'notes'
      }
    },
    {
      type: 'value',
      label: 'library/annotation',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'annotation'
      }
    },
    {
      type: 'value',
      label: 'library/tags',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'tags'
      }
    },
    {
      type: 'value',
      label: 'library/keywords',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'keywords'
      }
    },
    {
      type: 'value',
      label: 'library/signature',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'signature'
      }
    },
    {
      type: 'line'
    },
    {
      type: 'value',
      label: 'library/status/main',
      value: {
        isLocale: true,
        object: this.schoolingo.bookInfo,
        localePrefix: 'library/status/',
        key: 'status'
      }
    },
    {
      type: 'date',
      label: 'library/loanDate',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'date_loan'
      }
    },
    {
      type: 'date',
      label: 'library/returnDate',
      value: {
        object: this.schoolingo.bookInfo,
        key: 'date_has_to_be_returned'
      }
    },
    
  ]})

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  onClick = (id: number[]) => {
    this.modal.open();
    this.schoolingo.showBook(id, "copy");
  }

  ngOnInit(): void {
    this.tabValue.subscribe(() => {
      setTimeout(() => this.datalist?.loadData())
    });

    this.schoolingo.socketService.addFunction("library:getLoans").subscribe((data: dataAPI | any) => {
      let loanList: Data[][] = []
      data.data.forEach((loan: any) => {
        loanList.push([{ id: loan.copyId }, { id: loan.loanId }, {value: loan.name, isLocale: false}, {value: "Želva", isLocale: false}, {value: loan.isbn, isLocale: false}, {value: loan.genre, isLocale: false}, {value: 'library/status/' + loan.loanStatus, isLocale: true}])
      })
      this.metadata.rows = data.rows;
      this.loans.next(loanList);
    });
  }

}
