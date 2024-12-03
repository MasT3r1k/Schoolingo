import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent, Metadata } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatalistComponent],
  templateUrl: './companies.component.html',
  styleUrls: ['../../../Styles/card.css', '../../../Styles/input.css', './companies.component.css']
})
export class CompaniesComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public companies: BehaviorSubject<Data[][] | any> = new BehaviorSubject([]);
  public search = new FormControl();

  public metadata: Metadata = {
    rows: 0
  };


  datalist: DatalistComponent | null = null;
  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  ngOnInit(): void {
    this.schoolingo.socketService.addFunction("traineeship:getCompanies").subscribe((data: dataAPI) => {
      let companiesList: Data[][] = []
      console.log(data);
      data.data.forEach((company: any) => {
        companiesList.push([
          { id: company.companyId },
          {value: company.name, isLocale: false},
          {value: `${company.street} ${company.houseNumber}, ${company.cityName} ${company.postcode}`, isLocale: false},
          {value: company.CIN, isLocale: false},
          {value: company.web, isLocale: false},
          {value: Number(company.rating).toFixed(1), isLocale: false}
        ]);
      })
      this.metadata.rows = data.rows;
      this.companies.next(companiesList);
    });
  }

}
