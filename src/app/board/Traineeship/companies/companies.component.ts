import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Data, dataAPI, DatalistComponent, errorAPI, Metadata } from '@Components/Datalist/Datalist';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Permission } from '@Schoolingo/Permissions';
import { Utils } from '@Schoolingo/Utils';
import { Country } from 'country-state-city';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AgCharts } from "ag-charts-angular";
import { AgChartOptions } from "ag-charts-community";
import { Modal } from '@Components/Modal/Modal';
import { selectCompanyModalComponent } from './selectCompanyModal/selectCompanyModal';
import { editCompanyModalComponent } from './editCompanyModal/editCompanyModal';
import { DiaryWeek } from '@Schoolingo/Traineeship';

type Scope = {
  name: string;
  shortcut: string;
}

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatalistComponent, TabsComponent, NgClass, NgStyle, AgCharts],
  templateUrl: './companies.component.html',
  styleUrls: ['../../../Styles/card.css', '../../../Styles/input.css', './companies.component.css']
})
export class CompaniesComponent implements OnInit {
  Utils = Utils;

  constructor(
    public schoolingo: Schoolingo,
    public sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    public permissions: Permission
  ) {}

  country = Country;

  public scopes: Record<number, Scope> = {};
  public showPage: 'list' | 'detailCompany' | 'requestCompany' = 'list';
  public alert: 'success_selected_company' | 'success_updated_instructor' | null = null;
  public requestDataForAlert: any = {};
  public selectedTab = new BehaviorSubject<number>(0);

  onClick = (id: { id: number }[]) => {
    this.schoolingo.socketService.emit('school:getScopes');
    this.schoolingo.socketService.emit('traineeship:getCompanyInfo', { companyId: id[0].id });
    this.showPage = 'detailCompany';
    this.schoolingo.traineeship.selectedDairy = null;
    this.schoolingo.traineeship.selectedInstructor = null;
    this.selectedTab.next(0);
    this.router.navigate([], { queryParams: { companyId: id[0].id }});

  }

  private listeners: Subscription[] = [];
  public companies = new BehaviorSubject<Data[][] | any>([]);
  public weeks: DiaryWeek[] = [];
  public search = new FormControl();
  public iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl("");

  public metadata: Metadata = {
    rows: 0
  };

  public tableHead: string[] = [];

  datalist: DatalistComponent | null = null;
  receivedDatalist(value: DatalistComponent): void {
    this.schoolingo.socketService.emit('school:getScopes');
    this.datalist = value;
  }

  public goToList(): void {
    this.showPage = 'list';
    this.router.navigate([], { queryParams: {}});
  }

  public getDisabledLocales(): boolean[] {
    let arr: boolean[] = [];
    Object.keys(this.scopes).forEach((value: string) => {
      let id = parseInt(value);
      arr[id + 2] = this.scopes[id] ? true : false;
    })
    return arr;
  }

  public getTableTitles(): string[] {
    let arr: string[] = [];
    Object.keys(this.scopes).forEach((value: string) => {
      let id = parseInt(value);
      arr[id + 2] = this.scopes[id].name || "";
    })
    return arr;
  }

  ngOnInit(): void {

    this.listeners.push(
      this.schoolingo.socketService.addFunction("traineeship:getCompanyInfo").subscribe((data: companyInfoAPI) => {
        this.schoolingo.traineeship.selectedCompany = data;
        this.weeks = this.schoolingo.traineeship.getDiaryByCompanyId(data.companyId);
        this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl('https://maps.google.com/maps?q=' + this.schoolingo.traineeship.selectedCompany.street + ' ' + this.schoolingo.traineeship.selectedCompany.houseNumber + ', ' + this.schoolingo.traineeship.selectedCompany.cityName + '&output=embed');
      })
    );

    this.listeners.push(
      this.schoolingo.traineeship.diaryWeeks.subscribe(() => {
        if (!this.schoolingo.traineeship.selectedCompany) return;
        this.weeks = this.schoolingo.traineeship.getDiaryByCompanyId(this.schoolingo.traineeship.selectedCompany.companyId);
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("school:getScopes").subscribe((data: Scope[]) => {
        this.tableHead = [];
        this.tableHead.push('traineeship/companyName', 'traineeship/officeAddress');
        this.scopes = data;
        data.forEach((scope: Scope) => {
          this.tableHead.push(scope.shortcut);
        });
        this.tableHead.push('web', 'rate');
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("traineeship:getCompanyInstructors").subscribe((data: { personId: number }[]) => {
        this.schoolingo.traineeship.instructors = [];
        data.forEach((person: { personId: number }) => {
          this.schoolingo.traineeship.instructors.push(person.personId);
        });
      })
    );

    this.listeners.push(
      this.route.queryParamMap.subscribe((param: Params) => {
        this.alert = null;
        this.weeks = [];
        // Show company
        if (param.params.companyId != undefined) {
          this.onClick([{ id: param.params.companyId }]);
        } else {
          this.showPage = 'list';
          this.schoolingo.traineeship.selectedDairy = null;
          this.schoolingo.traineeship.selectedInstructor = null;
          this.router.navigate([], { queryParams: {}});
        }
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("traineeship:getCompanies").subscribe((data: dataAPI | errorAPI) => {
        if ('error' in data) return;
        let companiesList: Data[][] = []
        data.data.forEach((company: any) => {
          let scopeList: any = {};
          Object.values(JSON.parse(company.scopes)).forEach((value: Scope | any) => {
            scopeList[value.scopeId - 1] = value.status;
          });
          let row: Data[] = [
            { id: company.companyId },
            { value: company.name, isLocale: false },
            { value: Utils.formatAddress({ code2: company.code2, street: company.street, houseNumber: company.houseNumber, city: company.cityName, postcode: company.postcode }), isLocale: false },
          ];
          Object.keys(this.scopes).forEach((scopeId: any) => { /* ✔✅❌ */
            row.push({ value: scopeList[scopeId] ? '✅' : '❌', isLocale: false })
          });

          
          row.push(
            { value: company.web, isLocale: false },
            { value: this.schoolingo.traineeship.getRating(company), isLocale: company.rating ? false : true }
          );
          companiesList.push(row);
          
        })
        this.metadata.rows = data.rows;
        this.companies.next(companiesList);
      })
    );
    
    this.listeners.push(
      this.schoolingo.socketService.addFunction("traineeship:selectCompany").subscribe((data: selectCompanyAPI | errorAPI) => {
        if ('status' in data) {
          this.requestDataForAlert = data;

          let weekList = this.schoolingo.traineeship.diaryWeeks.getValue();
          weekList.forEach((week: DiaryWeek) => {
            if (week.traineeship === data.traineeship) {
              week.company = data.company;
              week.instructor = data.instructor;
            }
          });

          this.schoolingo.traineeship.diaryWeeks.next(weekList);

          if (data.status == 'success') {
            this.alert = 'success_selected_company';
          }
          if (data.status == 'updated') {
            this.alert = 'success_updated_instructor';
          }
        }
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("connect").subscribe(() => {
        this.schoolingo.socketService.emit('school:getScopes');
      })
    );
  }

  public getScopes(company: any): string[] {
    let scopeList: string[] = [];
    if (!company || !company.scopes) return [];
    Object.values(JSON.parse(company.scopes)).forEach((value: Scope | any) => {
      if (value.status === 1 && this.scopes?.[value.scopeId - 1]) {
        scopeList.push(this.scopes?.[value.scopeId - 1]?.name)
      }
    });
    return scopeList;
  }
  

  public selectCompanyModal = new Modal({
    closeable: true,
    title: {
      text: "traineeship/registerToCompany"
    },
    size: 'size-2',
    items: [
      {
        type: 'component',
        component: selectCompanyModalComponent,
        data: this.schoolingo.traineeship.selectedCompany
      }
    ]
  });

  public editCompanyModal = new Modal({
    closeable: true,
    title: {
      text: "traineeship/editCompany"
    },
    size: 'size-2',
    items: [
      {
        type: 'component',
        component: editCompanyModalComponent,
        data: this.schoolingo.traineeship.selectedCompany
      }
    ]
  });

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  options: AgChartOptions = {
    theme: (this.schoolingo.theme.getTheme() === "light") ? 'ag-default' : 'ag-default-dark',
    background: {
      visible: false
    },
    minHeight: 250,
    // Data: Data to be displayed in the chart
    data: [
      { year: "2020", students: 15 },
      { year: "2021", students: 10 },
      { year: "2022", students: 8 },
      { year: "2023", students: 12 },
      { year: "2024", students: 15 },
    ],

    axes: [
      {
        type: 'category',
        position: "bottom"
      },
      {
        type: "number",
        position: "left",
        min: 0
      },
    ],
  
    // Series: Defines which chart type and data to use
    series: [
      {
        type: "line",
        xKey: "year",
        yKey: "students",
        yName: "Počet studentů"
      },
    ],
  };
}
