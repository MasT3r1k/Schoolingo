import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Data, dataAPI, DatalistComponent, Metadata } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatalistComponent],
  templateUrl: './companies.component.html',
  styleUrls: ['../../../Styles/card.css', '../../../Styles/input.css', './companies.component.css']
})
export class CompaniesComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo,
    public sanitizer: DomSanitizer
  ) {}

  public showPage: 'list' | 'detailCompany' | 'requestCompany' = 'list';

  onClick = (id: { id: number }[]) => {
    this.schoolingo.socketService.emit('traineeship:getCompanyInfo', { companyId: id[0].id });
    this.showPage = 'detailCompany';
  }

  private listeners: Subscription[] = [];
  public companies: BehaviorSubject<Data[][] | any> = new BehaviorSubject([]);
  public selectedCompany: Record<string, any> = {};
  public search = new FormControl();
  public iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl("");

  public metadata: Metadata = {
    rows: 0
  };


  datalist: DatalistComponent | null = null;
  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  ngOnInit(): void {
    this.listeners.push(this.schoolingo.socketService.addFunction("traineeship:getCompanyInfo").subscribe((data: any) => {
      this.selectedCompany = data[0];
      this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl('https://maps.google.com/maps?&q=' + this.selectedCompany.street + ' ' + this.selectedCompany.houseNumber + ', ' + this.selectedCompany.cityName + '&output=embed');
      console.log(data);
    }));
    this.listeners.push(this.schoolingo.socketService.addFunction("traineeship:getCompanyInstructors").subscribe((data: any) => {
      console.log(data);
    }));

    this.listeners.push(this.schoolingo.socketService.addFunction("traineeship:getCompanies").subscribe((data: dataAPI) => {
      let companiesList: Data[][] = []
      data.data.forEach((company: any) => {
        companiesList.push([
          { id: company.companyId },
          {value: company.name, isLocale: false},
          {value: `${company.street} ${company.houseNumber}, ${company.cityName} ${company.postcode}`, isLocale: false},
          {value: company.CIN, isLocale: false},
          {value: company.web, isLocale: false},
          {value: company.rating ? Number(company.rating).toFixed(1) : 'traineeship/noRating', isLocale: company.rating ? false : true}
        ]);
      })
      this.metadata.rows = data.rows;
      this.companies.next(companiesList);
    }));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
